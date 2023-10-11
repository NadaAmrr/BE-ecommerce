import mongoose, { Schema, Types, model } from "mongoose";

const subcategorySchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true , lowercase: true},
    slug: { type: String, required: true },
    image: { type: { secure_url: String, public_id: String }, required: true },
    categoryId: { type: Types.ObjectId, ref: 'Category', required: true }, 
    createdBy: { type: Types.ObjectId, ref: 'User', required: true }, 
    updatedBy: { type: Types.ObjectId, ref: 'User' }, 
    isDeleted: { type: Boolean, default: false },
    customId: { type: String, required: true, unique: true},
}, {
    timestamps: true
})

const subcategoryModel = mongoose.models.subcategory || model("Subcategory", subcategorySchema)
export default subcategoryModel