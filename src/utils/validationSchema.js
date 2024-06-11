import Joi from "joi";

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(21).required(),
  email: Joi.string().email().lowercase().required(),
  password: Joi.string().min(6).max(50).required(),
});

const loginSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(21).required(),
  password: Joi.string().min(6).max(50).required(),
});

const verifyEmailSchema = Joi.object({
  token: Joi.string().required(),
});

export { registerSchema, loginSchema, verifyEmailSchema };
