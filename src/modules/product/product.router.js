import * as productController from './controller/product.js'
import * as validators from './product.validation.js'
import { fileUpload, fileValidation } from '../../utils/multer.js'
import { validation } from '../../middleware/validation.js'
import { auth } from '../../middleware/auth.js'
import { Router } from "express";
import {endPoint} from './product.endPoint.js'
// import reviewRouter from '../reviews/reviews.router.js'
import { asyncHandler } from '../../utils/errorHandling.js';
const router = Router()
// router.use("/:productId/review", reviewRouter)
//============== Create product ==============
router.post("/",
    auth(endPoint.create),
    fileUpload(fileValidation.image).fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 },

    ]),
    validation(validators.createProduct),
    asyncHandler( productController.createProduct))
//============== Get product ==============
router.get("/", asyncHandler(productController.products))
//============== Update product ==============
router.put("/:productId",
    auth(endPoint.update),
    fileUpload(fileValidation.image).fields([
        { name: 'mainImage', maxCount: 1 },
        { name: 'subImages', maxCount: 5 },
    ]),
    validation(validators.updateProduct),
    asyncHandler(productController.updateProduct))
//============== Delete product from wishlist ==============
router.patch("/:productId/wishlist/delete",
    auth(endPoint.wishlist),
    // validation(validators.deleteProduct),
    asyncHandler( productController.deleteFromWishlist))
//============== Add product to wishlist ==============
router.patch("/:productId/wishlist/add",
auth(endPoint.wishlist),
asyncHandler( productController.wishlist))

export default router