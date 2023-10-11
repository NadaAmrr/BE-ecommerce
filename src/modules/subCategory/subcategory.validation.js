import joi from 'joi'
import { generalFields } from '../../middleware/validation.js'
//============== Create Category ==============
export const createSubCategory = joi.object({
    categoryId: generalFields.id,
    name: joi.string().min(2).max(25),
    file: generalFields.file.required()
}).required()
//============== Update Category ==============
export const updateSubCategory = joi.object({
    categoryId: generalFields.id,
    subcategoryId: generalFields.id,
    name: joi.string().min(2).max(25),
    file: generalFields.file  
})
//============== Delete Category ==============
export const deleteSubCategory = joi.object({

})
