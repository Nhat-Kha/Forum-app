import express from "express";

import {
  register,
  login,
  verifyEmail,
  resendVerificationEmail,
  forgotPassword,
  resetPassword,
  checkResetPasswordToken,
} from "../controllers/authController.js";

const authRouter = express.Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/resend-verify-email", resendVerificationEmail);
authRouter.post("/verify-email", verifyEmail);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.post("/check-resetpassword-token", checkResetPasswordToken);

authRouter.get("/", (req, res) => {
  res.json({ route: "Auth Routes" });
});

export default authRouter;
