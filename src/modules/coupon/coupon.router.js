import * as couponController from "./controller/coupon.js";
import {  auth } from '../../middleware/auth.js';
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { asyncHandler } from '../../utils/errorHandling.js'
import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import * as validators from "./coupon.validation.js"
const router = Router();
//============== Create Coupon ==============
router.post(
  "/",
  fileUpload(fileValidation.image).single("image"),
  validation(validators.createCoupon),
  asyncHandler( couponController.createCoupon )
);
//============== Update Coupon ==============
router.patch(
    "/:couponId",
    fileUpload(fileValidation.image).single("image"),
    validation(validators.updateCoupon),
    asyncHandler( couponController.updateCoupon )
  );
//============== Get Coupon ==============
router.get(
    "/",
    asyncHandler( couponController.getCoupon )
  );
//============== Delete Coupon ==============
router.delete(
    "/:couponId",
    asyncHandler( couponController.deleteCoupon )
  );

export default router;