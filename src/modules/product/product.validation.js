import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'
//==============
// export const headers = joi.object({
//     authorization: generalFields.headers
// }).required()
//============== Create Product ==============
export const createProduct = joi.object({
    name: joi.string().min(2).max(50).required(),
    description: joi.string().min(2).max(20000),
    size: joi.array(),
    colors: joi.array(),
    stock: joi.number().positive().integer().min(1),
    price: joi.number().positive().min(1).required(),
    discount: joi.number().positive().min(1),
    categoryId: generalFields.id,
    subcategoryId: generalFields.id,
    brandId: generalFields.id,
    file: joi.object({
        mainImage: joi.array().items(generalFields.file.required()).length(1).required(),
        subImages: joi.array().items(generalFields.file).min(1).max(5)
    })
}).required()
//============== Update Product ==============
export const updateProduct = joi.object({
    name: joi.string().min(2).max(50),
    description: joi.string().min(2).max(150000),
    size: joi.array(),
    colors: joi.array(),
    stock: joi.number().positive().integer().min(1),
    price: joi.number().positive().min(1),
    discount: joi.number().positive().min(1),
    categoryId: generalFields.id,
    subcategoryId: generalFields.id,
    brandId: generalFields.id,
    file: joi.object({
        mainImage: joi.array().items(generalFields.file).max(1),
        subImages: joi.array().items(generalFields.file).min(1).max(5)
    }).required()
})
//============== Delete Product ==============
export const deleteProduct = joi.object({

})