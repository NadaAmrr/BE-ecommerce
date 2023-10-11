import slugify from "slugify";
import couponModel from "../../../../DB/model/Coupon.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import cloudinary from "../../../utils/cloudinary.js";
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";
//============== Create Coupon ==============
export const createCoupon = async (req, res, next) => {
  const { name } = req.body;
  //-----Must be a unique name
  if (await couponModel.findOne({ name })) {
    return next(
      new ErrorClass(`Duplicated coupon name ${name}`, StatusCodes.CONFLICT)
    );
  }
  if (req.file) {
    //-----Upload image in cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `${process.env.APP_NAME}/coupon` }
    );
    req.body.image = { secure_url, public_id };
  }
  //-----Create coupon
  req.body.createdBy = req.user._id
  const coupon = await couponModel.create(req.body);
  return res.status(201).json({ message: "Created", coupon });
};
//============== Create Coupon ==============
export const updateCoupon = async (req, res, next) => {
  if (!req.body || !req.file) {
    return next(
      new ErrorClass(`You are not updating`, StatusCodes.BAD_REQUEST)
    );
  }
  //----------Find Coupon
  const coupon = await couponModel.findById(req.params.couponId);
  if (!coupon) {
    return next(
      new ErrorClass(
        `Coupon not found or in-valid coupon id`,
        StatusCodes.BAD_REQUEST
      )
    );
  }
  //----------Check name
  if (req.body.name) {
    //-----Check if old name != new name
    if (coupon.name == req.body.name) {
      return next(
        next(
          new ErrorClass(
            `Cannot update coupon with the same name`,
            StatusCodes.BAD_REQUEST
          )
        )
      );
    }
    //-----Check if other coupon have the same name
    if (await couponModel.findOne({ name: req.body.name })) {
      return next(
        new ErrorClass(
          `Duplicated coupon name ${req.body.name}`,
          StatusCodes.CONFLICT
        )
      );
    }
    coupon.name = req.body.name;
  }
  //----------Check amount
  if (req.body.amount) {
    coupon.amount = req.body.amount;
  }
  //----------Check expire date
  if (req.body.expireDate) {
    coupon.expireDate = req.body.expireDate;
  }
  //----------file
  if (req.file) {
    //-----Upload image in cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `${process.env.APP_NAME}/coupon` }
    );
    if (coupon.image) {
      //-----Delete old image from cloudinary
      await cloudinary.uploader.destroy(coupon.image.public_id);
    }
    coupon.image = { secure_url, public_id };
  }
  //----------Update coupon
  coupon.updatedBy = req.user._id
  await coupon.save();
  return res.status(200).json({ message: "Updated", coupon });
};
//============== Get Coupon ==============
export const getCoupon = async (req, res, next) => {
    //----------Find coupon
    const coupon = await couponModel.find()
    return res.status(200).json({ message: "Done", coupon });
};
//============== Create Coupon ==============
export const deleteCoupon = async (req, res, next) => {};
