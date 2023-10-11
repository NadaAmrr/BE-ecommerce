import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'
//============== Create Coupon ==============
export const createCoupon = joi.object({
    name: joi.string().min(2).max(25).required(),
    amount: joi.number().positive().min(1).max(100).required(),
    expireDate: joi.number().positive().min(1).max(100),
    file: generalFields.file,
}).required()
//============== Update Coupon ==============
export const updateCoupon = joi.object({
    couponId: generalFields.id,
    name: joi.string().min(2).max(25),
    amount: joi.number().positive().min(1).max(100),
    expireDate: joi.number().positive().min(1).max(100),
    file: generalFields.file  
})
//============== Delete Coupon ==============
export const deleteCoupon = joi.object({

})