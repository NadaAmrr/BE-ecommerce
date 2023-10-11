import productModel from "../../../../DB/model/Product.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import cloudinary from "../../../utils/cloudinary.js";
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";
import cartModel from "../../../../DB/model/Cart.model.js";
//============== Create Cart ==============
export const createCart = async(req,res,next)=>{
    const { productId , quantity } = req.body;
    //----- Availability of product
    const product = await productModel.findById(productId)
    if (!product) {
        return next(new ErrorClass(`In-valid product id`, StatusCodes.BAD_REQUEST));
    }
    if(product.stock < quantity || product.isDeleted){
        await productModel.updateOne({_id: productId}, {$addToSet: { wishUserList: req.user._id }})
        return next(new ErrorClass(`In-valid product quantity, maximum available is ${product.stock}`, StatusCodes.BAD_REQUEST));
    }
    //----- create cart
    const cart = await cartModel.findOne({userId: req.user._id})
    if (!cart) {
        const newCart = await cartModel.create({
            userId: req.user._id,
            products: [{ productId , quantity}]
        })
        return res.status(201).json({message: "Done" , cart: newCart})
    }
    //------ If product found before
    let matchProduct = false
    for (let i = 0; i < cart.products.length; i++) {
       if (cart.products[i].productId.toString() == productId) {
         cart.products.quantity = quantity
         break; 
       }
    }
    //------ If product not found
    if (!matchProduct) {
        cart.products.push({productId , quantity})
    }
    //------- 
    await cart.save()
    return res.status(201).json({message: "Done" ,cart})
}
//============== Update Cart ==============
