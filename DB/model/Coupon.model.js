import mongoose, { Schema, Types, model } from "mongoose";

const couponSchema = new Schema({
    name: { type: String, required: true, unique: true , lowercase: true},
    image: { type: { secure_url: String, public_id: String } },
    amount:{ type: Number , default: 1},
    expireDate: Date,
    usedBy:[{ type:Types.ObjectId, ref:'User' }],
    createdBy: { type: Types.ObjectId, ref: 'User', required: false }, 
    updatedBy: { type: Types.ObjectId, ref: 'User' }, 
}, {
    timestamps: true
})

const couponModel = mongoose.models.coupon || model("Coupon", couponSchema)
export default couponModel