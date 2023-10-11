import * as subcategoryController from "./controller/subcategory.js";
import { auth } from '../../middleware/auth.js';
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { asyncHandler } from '../../utils/errorHandling.js'
import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import * as validators from "./subcategory.validation.js"
import { endPoint } from "./subcategory.endPoint.js";
const router = Router({ mergeParams: true });
//============== Create SubCategory ==============
router.post(
  "/",
  auth(endPoint.create),
  fileUpload(fileValidation.image).single("image"),
  validation(validators.createSubCategory),
  asyncHandler( subcategoryController.createSubCategory )
);
//============== Update SubCategory ==============
router.put(
    "/:subcategoryId",
    auth(endPoint.update),
    fileUpload(fileValidation.image).single("image"),
    validation(validators.updateSubCategory),
    asyncHandler( subcategoryController.updateSubCategory )
  );
//============== Get SubCategory ==============
router.get(
    "/",
    auth,
    asyncHandler( subcategoryController.getSubCategory )
  );
//============== Delete SubCategory ==============
router.delete(
    "/:subCategoryId",
    auth(endPoint.delete),
    asyncHandler( subcategoryController.deleteSubCategory )
  );

export default router;
