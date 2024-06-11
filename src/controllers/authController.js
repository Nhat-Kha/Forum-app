import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
} from "../utils/validationSchema.js";
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
} from "../utils/verification.js";
import { randomOTPNumber, randomTokenString } from "../utils/generate_keys.js";
import { signAccessToken } from "../utils/jwt.js";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import AuthHistory from "../models/AuthHistory.js";
import { Types } from "mongoose";

const register = async (req, res, next) => {
  try {
    const result = await registerSchema.validateAsync(req.body);

    const emailExists = await User.findOne({ email: result.email });
    if (emailExists) {
      throw createHttpError.Conflict("E-mail is already been registered");
    }

    const username = result.username.toLowerCase();
    const usernameExists = await User.findOne({ name: username });
    if (usernameExists) {
      throw createHttpError.Conflict("User name is already been registered");
    }

    const newVerifyToken = randomTokenString();
    const user = new User({
      name: username,
      displayName: result.username,
      email: result.email,
      password: result.password,
      createdAt: new Date().toISOString(),
      onlineAt: new Date().toISOString(),
      role: "1",
      verificationToken: newVerifyToken,
    });

    const saveUser = await user.save();

    const accessToken = await signAccessToken(saveUser);

    await sendVerificationEmail(user);

    res.json({
      user: {
        id: saveUser._id,
        name: saveUser.name,
        email: saveUser.email,
        displayName: saveUser.displayName,
        picture: saveUser.picture,
        role: saveUser.role,
      },
      accessToken,
    });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await loginSchema.validateAsync(req.body);

    const username = result.username.toLowerCase();
    const user = await User.findOne({ name: username });
    if (!user) throw createHttpError.NotFound("User not found");

    const isMatch = await user.isValidPassword(result.password);
    if (!isMatch)
      throw createHttpError.Unauthorized("Username or password is not valid");

    if (!user.verified) {
      throw createHttpError.Unauthorized("Email not verified");
    }

    const accessToken = await signAccessToken(user);

    const now = new Date().toISOString();

    if (user.ban) {
      if (user.ban.expiresAt < now) {
        await User.updateOne(
          { _id: new Types.ObjectId(user._id) },
          { ban: null }
        );
      } else {
        return res.json({ ban: { userId: user._id } });
      }
    }

    const authHistory = new AuthHistory({
      user: user._id,
      loginAt: now,
      ip: req.headers["x-forwarded-for"] || req.connection.remoteAddress,
      ua: req.headers["user-agent"],
    });

    await authHistory.save();

    res.json({
      user: {
        id: user._id,
        name: user.name,
        displayName: user.displayName,
        picture: user.picture,
        role: user.role,
      },
      accessToken,
    });
  } catch (error) {
    if (error.isJoi === true) {
      return next(createHttpError.BadRequest("Invalid username or password"));
    }
    next(error);
  }
};

const resendVerificationEmail = async (req, res) => {
  try {
    const result = req.body;
    const username = result.username.toLowerCase();
    const user = await User.findOne({ name: username });

    await sendVerificationEmail(user);

    res.json({
      message: "Re-send verification email successfully!",
      email: user.email,
    });
  } catch (error) {}
};

const verificationToken = async ({ token }) => {
  try {
    const user = await User.findOne({ verificationToken: token });

    if (!user) throw createHttpError.BadRequest("Verification failed");

    user.verified = Date.now();
    user.verificationToken = undefined;
    await user.save();

    return user;
  } catch (err) {
    throw createHttpError.InternalServerError("Invalid Token");
  }
};

const verifyEmail = async (req, res, next) => {
  try {
    const result = await verifyEmailSchema.validateAsync(req.body);

    const user = await verificationToken({ token: result.token });

    res.json({
      message: "Verification successful, you can now login",
      userId: user._id,
    });
  } catch (error) {
    if (error.isJoi === true) error.status = 422;
    next(error);
  }
};

const forgotPassword = async (req, res) => {
  try {
    const result = req.body;
    console.log("result", result);
    const user = await User.findOne({ email: result.email });

    if (!user) return;

    user.resetToken = {
      token: randomTokenString(),
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    };
    await user.save();

    await sendPasswordResetEmail(user);
    res.json({
      message: "Please check your email for password reset instructions",
      user: user,
    });
  } catch (error) {
    res.json({ message: error.message });
  }
};

const resetPassword = async (req, res) => {
  try {
    const result = req.body;
    const user = await User.findOne({
      "resetToken.token": result.token,
      "resetToken.expires": { $gt: Date.now() },
    });

    if (!user) throw createHttpError.BadRequest("Invalid Token");

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(result.password, salt);

    user.password = hashPassword;
    user.passwordReset = Date.now();
    user.resetToken = undefined;

    if (!user.verified) {
      user.verified = Date.now();
      user.verificationToken = undefined;
    }

    await user.save();
    res.json({ message: "Password reset successfully", user: user });
  } catch (error) {
    res.json({ message: error.message });
  }
};

const checkResetPasswordToken = async (req, res) => {
  try {
    const result = req.body;
    const user = await User.findOne({
      "resetToken.token": result.token,
      "resetToken.expires": { $gt: Date.now() },
    });

    if (!user) throw createHttpError.BadRequest("Invalid token");

    res.json({ message: "Token correctly" });
  } catch (error) {
    res.json({ message: error.message });
  }
};

export {
  register,
  login,
  resendVerificationEmail,
  verifyEmail,
  forgotPassword,
  resetPassword,
  checkResetPasswordToken,
};
