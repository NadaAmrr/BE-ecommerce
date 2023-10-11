import * as brandController from "./controller/brand.js";
import {  auth } from '../../middleware/auth.js';
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { asyncHandler } from '../../utils/errorHandling.js'
import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import * as validators from "./brand.validation.js"
import { endPoint } from "./brand.endPoint.js";
const router = Router();
//============== Create brand ==============
router.post(
  "/",
  auth(endPoint.create),
  fileUpload(fileValidation.image).single("image"),
  validation(validators.createBrand),
  asyncHandler( brandController.createBrand )
);
//============== Update brand ==============
router.patch(
    "/:brandId",
    auth(endPoint.update),
    fileUpload(fileValidation.image).single("image"),
    validation(validators.updateBrand),
    asyncHandler( brandController.updateBrand )
  );
//============== Get brand ==============
router.get(
    "/",
    asyncHandler( brandController.getBrand )
  );
//============== Delete brand ==============
router.delete(
    "/:brandId",
    auth(endPoint.delete),
    asyncHandler( brandController.deleteBrand )
  );

export default router;