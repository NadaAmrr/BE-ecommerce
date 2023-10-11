import mongoose, { Schema, Types, model } from "mongoose";

const brandSchema = new Schema({
    name: { type: String, required: true, unique: true , lowercase: true},
    image: { type: { secure_url: String, public_id: String } , required: true },
    createdBy: { type: Types.ObjectId, ref: 'User', required: true }, 
    updatedBy: { type: Types.ObjectId, ref: 'User' }, 
}, {
    timestamps: true
})

const brandModel = mongoose.models.brand || model("Brand", brandSchema)
export default brandModel