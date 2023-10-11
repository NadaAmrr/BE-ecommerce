import joi from "joi";
import { generalFields } from "../../middleware/validation.js";

export const signup = joi.object({
    username: joi.string().min(2).max(20).alphanum().required(),
    email: generalFields.email,
    password: generalFields.password.required(),
    cPassword: generalFields.cPassword.valid(joi.ref("password")).required(),
    phone: generalFields.phone,
    age: generalFields.age,
  }).required();

export const login = joi.object({
    email: generalFields.email,
    password: generalFields.password,
  }).required();

export const forgetPassword = joi.object({
      email: generalFields.email,
    }).required()

export const resetPassword = joi.object({
    email: generalFields.email,
    password: generalFields.password,
    cPassword: generalFields.cPassword.valid(joi.ref("password")).required(),
    code: joi.string().required(),
  }).required();

export const token = joi.object({
    token: joi.string().required(),
  }).required();

export const refreshToken = joi.object({
    token: generalFields.id.required(),
  }).required();
