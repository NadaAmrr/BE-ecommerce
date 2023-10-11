import joi from "joi";
import { Types } from "mongoose";
// ==== Validation ID
const validateId = (value, helper) => {
  Types.ObjectId.isValid(value) ? true : helper.message("In-valid ID");
};
//===== General Fields(( Email Password cPassword Age Phone Gender File))
export const generalFields = {
  email: joi.string().email({
    minDomainSegments: 2,
    maxDomainSegments: 3,
    tlds: { allow: ["com", "net"] },
  }),
  password: joi
    .string()
    // .pattern(new RegExp(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[a-zA-Z]).{8,}$/))
    .required(),
  cPassword: joi.string().required(),
  age: joi.number().integer().positive().min(15).max(80),
  phone: joi.string().min(11),
  gender: joi.string().valid("Female", "Male"),
  id: joi.string().custom(validateId).required(),
  file: joi.object({
    size: joi.number().positive().required(),
    path: joi.string().required(),
    filename: joi.string().required(),
    destination: joi.string().required(),
    mimetype: joi.string().required(),
    encoding: joi.string().required(),
    originalname: joi.string().required(),
    fieldname: joi.string().required(),
  }),
};

export const validation = (schema) => {
  return (req, res, next) => {
    const inputsData = { ...req.body, ...req.query, ...req.params };
    if (req.file || req.files) {
      inputsData.file = req.file || req.files
      console.log(req.file);
    }
    const validationResult = schema.validate(inputsData, { abortEarly: false });
    if (validationResult.error?.details) {
      return res
        .status(400)
        .json({
          message: "Validation Error",
          validationError: validationResult.error?.details,
        });
    }
    return next();
  };
};
