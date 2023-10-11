import * as cartController from "./controller/cart.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import * as validators from "./cart.validation.js";
import { auth , roles } from "../../middleware/auth.js";
import { endPoint } from "./cart.endPoint.js";
const router = Router();
//============== Create cart ==============
router.post(
  "/",
  auth(endPoint.create),
//   fileUpload(fileValidation.image).single("image"),
//   validation(validators.createCategory),
  asyncHandler(cartController.createCart)
);


export default router;
