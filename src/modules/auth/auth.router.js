import * as authController from "./controller/register.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import * as validators from "./auth.validation.js";
const router = Router();
router.post(
  "/signup",
  validation(validators.signup),
  asyncHandler(authController.signup)
);
router.get(
  "/confirmEmail/:token",
  validation(validators.token),
  asyncHandler(authController.confirmEmail)
);
router.get(
  "/requestNewConfirmEmail/:token",
  validation(validators.token),
  asyncHandler(authController.newConfirmEmail)
);
router.post(
  "/login",
  validation(validators.login),
  asyncHandler(authController.login)
);
router.post(
  "/forgetPassword",
  validation(validators.forgetPassword),
  asyncHandler(authController.forgetPassword)
);
router.patch(
  "/resetPassword",
  validation(validators.resetPassword),
  asyncHandler(authController.resetPassword)
);
router.patch(
  "/refresh",
  validation(validators.refreshToken),
  asyncHandler(authController.refreshToken)
);
export default router;
