import crypto from "crypto";

const randomTokenString = () => {
  return crypto.randomBytes(40).toString("hex");
};

const randomOTPNumber = () => {
  let otp = "";
  for (let i = 0; i < 6; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

export { randomTokenString, randomOTPNumber };
