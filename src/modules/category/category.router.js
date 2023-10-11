import categoryRouter from "../subCategory/subcategory.router.js";
import * as categoryController from "./controller/category.js";
import { fileUpload, fileValidation } from "../../utils/multer.js";
import { asyncHandler } from "../../utils/errorHandling.js";
import { Router } from "express";
import { validation } from "../../middleware/validation.js";
import * as validators from "./category.validation.js";
import { auth , roles } from "../../middleware/auth.js";
import { endPoint } from "./category.endPoint.js";
const router = Router();
router.use("/:categoryId/subcategory", categoryRouter);
//============== Create Category ==============
router.post(
  "/",
  auth(endPoint.create),
  fileUpload(fileValidation.image).single("image"),
  validation(validators.createCategory),
  asyncHandler(categoryController.createCategory)
);
//============== Update Category ==============
router.put(
  "/:categoryId",
  auth(endPoint.update),
  fileUpload(fileValidation.image).single("image"),
  validation(validators.updateCategory),
  asyncHandler(categoryController.updateCategory)
);
//============== Get Category ==============
router.get(
  "/",
  auth(Object.values(roles)),
  asyncHandler(categoryController.getCategory)
);
//============== Delete Category ==============
router.delete(
  "/:categoryId",
  auth(endPoint.delete),
  asyncHandler(categoryController.deleteCategory)
);

export default router;
