import mongoose, { Schema, Types, model } from "mongoose";

const categorySchema = new Schema({
    name: { type: String, required: true, unique: true, trim: true  , lowercase: true},
    slug: { type: String, required: true },
    image: { type: { secure_url: String, public_id: String }, required: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true }, 
    updatedBy: { type: Types.ObjectId, ref: 'User' }, 
    isDeleted: { type: Boolean, default: false }
}, {
    toJSON:{virtuals:true},
    toObject:{virtuals:true},
    timestamps: true
})

categorySchema.virtual('subcategory', {
    localField: "_id",
    foreignField: "categoryId",
    ref: 'Subcategory'
})

const categoryModel = mongoose.models.Category || model("Category", categorySchema)
export default categoryModel