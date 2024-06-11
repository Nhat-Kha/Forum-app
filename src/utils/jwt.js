import jwt from "jsonwebtoken";
import createHttpError from "http-errors";

const signAccessToken = (user) => {
  return new Promise((resolve, reject) => {
    const payload = {
      _id: user.id,
      name: user.name,
      displayName: user.displayName,
      picture: user.picture,
      role: user.role,
    };
    jwt.sign(payload, process.env.JWT, { expiresIn: "24h" }, (err, token) => {
      if (err) {
        console.log(err.message);
        return reject(createHttpError.InternalServerError());
      }
      return resolve(token);
    });
  });
};

const verifyAccessToken = (req, res, next) => {
  if (!req.headers["authorization"]) {
    return next(createHttpError.Unauthorized());
  }

  const authHeader = req.headers["authorization"];
  const bearerToken = authHeader.split(" ");
  const token = bearerToken[1];

  jwt.verify(token, process.env.JWT, (err, payload) => {
    if (err) {
      const message =
        err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;

      return next(createHttpError.Unauthorized(message));
    }

    req.payload = payload;
    next();
  });
};

const verifyAccessTokeIO = (token) => {
  if (!token) return createHttpError.Unauthorized();

  return jwt.verify(token, process.env.JWT, (err, payload) => {
    if (err) {
      const message =
        err.name === "JsonWebTokenError" ? "Unauthorized" : err.message;
      return createHttpError.Unauthorized(message);
    }

    return payload;
  });
};

export { signAccessToken, verifyAccessToken, verifyAccessTokeIO };
