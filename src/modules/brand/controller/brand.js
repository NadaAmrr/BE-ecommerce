import slugify from "slugify";
import brandModel from "../../../../DB/model/Brand.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import cloudinary from "../../../utils/cloudinary.js";
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";
//============== Create brand ==============
export const createBrand = async (req, res, next) => {
  const { name } = req.body;
  //-----Must be a unique name
  if (await brandModel.findOne({ name })) {
    return  next( new ErrorClass(
      `Duplicated brand ${name}`,
      StatusCodes.CONFLICT
    ));
  }
  //-----Upload image in cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {folder:`${process.env.APP_NAME}/brand`}
  ); 
  //-----Create brand
  const brand = await brandModel.create({
    name,
    slug: slugify(name, "-"),
    image: { secure_url, public_id },
    createdBy: req.user._id
  });
  return res.status(201).json({ message: "Created", brand });
};
//============== Update brand ==============
export const updateBrand = async (req, res, next) => {
  if (!req.body.name && !req.file) {
    return next( new ErrorClass(`You are not updating`, StatusCodes.BAD_REQUEST));
  } 
  //----------Find brand
  const brand = await brandModel.findById(req.params.brandId);
  if (!brand) {
    return next(new ErrorClass(
      `brand not found or in-valid brand id`,
      StatusCodes.BAD_REQUEST
    ));
  }
  //----------Check name
  if (req.body.name) {
    //-----Check if old name != new name
    if (brand.name == req.body.name) {
      return next(
        next( new ErrorClass(
          `Cannot update brand with the same name`,
          StatusCodes.BAD_REQUEST
        )
      ));
    }
    //-----Check if other brand have the same name
    if (await brandModel.findOne({ name: req.body.name })) {
      return  next( new ErrorClass(
        `Duplicated brand name ${req.body.name}`,
        StatusCodes.CONFLICT
      ));
    }
    brand.name = req.body.name;
    //-----slug
    brand.slug = slugify(req.body.name, "-");
  }
  //----------file
  if (req.file) {
    //-----Upload image in cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `${process.env.APP_NAME}/brand`}
    );
    //-----Delete old image from cloudinary
    await cloudinary.uploader.destroy(
      brand.image.public_id
    );
    brand.image = { secure_url, public_id }
  } 
  //----------Update brand
  brand.updatedBy = req.user._id
  await brand.save()
  return res.status(200).json({ message: "Updated", brand });
};
//============== Get brand ==============
export const getBrand = async (req, res, next) => {
  //----------Find brand
  const brand = await brandModel.find()
  return res.status(200).json({ message: "Done", brand });
};
//============== Delete brand ==============
export const deleteBrand = async (req, res, next) => {
};