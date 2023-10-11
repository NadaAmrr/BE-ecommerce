import { nanoid } from "nanoid";
import slugify from "slugify";
import cloudinary from "../../../utils/cloudinary.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";
import subcategoryModel from "../../../../DB/model/Subcategory.model.js";
import categoryModel from "../../../../DB/model/Category.model.js";
//============== Create SubCategory ==============
export const createSubCategory = async (req, res, next) => {
  const { categoryId } = req.params;
  const { name } = req.body;
  //----------Find Category
  const category = await categoryModel.findById(categoryId);
  if (!category) {
    return next(
      new ErrorClass(`In-valid category id`, StatusCodes.BAD_REQUEST)
    );
  }
  //-----Must be a unique name
  if (await subcategoryModel.findOne({ name })) {
    return next(
      new ErrorClass(
        `Duplicated subcategory name ${name}`,
        StatusCodes.CONFLICT
      )
    );
  }
  const customId = nanoid();
  console.log(`${process.env.APP_NAME}/category/${categoryId}/subcategory/${customId}`);
  //-----Upload image in cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    { folder: `${process.env.APP_NAME}/category/${categoryId}/subcategory/${customId}` }
  );
  //-----Create subcategory
  let subcategory = await subcategoryModel.create({
    name,
    slug: slugify(name, "-"),
    image: { secure_url, public_id },
    categoryId,
    customId,
    createdBy: req.user._id
  });
  return res.status(201).json({ message: "Created", subcategory });
};
//============== Update SubCategory ==============
export const updateSubCategory = async (req, res, next) => {
  const { categoryId, subcategoryId } = req.params;
  //----------Find SubCategory
  const subcategory = await subcategoryModel.findOne({
    _id: subcategoryId,
    categoryId,
  });
  if (!subcategory) {
    return next( new ErrorClass(
      `Subcategory not found or in-valid Subcategory id`,
      StatusCodes.BAD_REQUEST
    ));
  }
  //----------Check name
  if (req.body.name) {
    //-----Check if old name != new name
    if (subcategory.name == req.body.name) {
      return next(
        new ErrorClass(
          `Cannot update subcategory with the same name`,
          StatusCodes.BAD_REQUEST
        )
      );
    }
    //-----Check if other subcategory have the same name
    if (await subcategoryModel.findOne({ name: req.body.name })) {
      return next(
        new ErrorClass(
          `Duplicated subcategory name ${req.body.name}`,
          StatusCodes.CONFLICT
        )
      );
    }
    subcategory.name = req.body.name;
    //-----slug
    subcategory.slug = slugify(req.body.name, "-");
  }
  //----------file
  if (req.file) {
    //-----Upload image in cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      `${process.env.APP_NAME}/category/${categoryId}/subcategory/${subcategory.customId}`
    );
    //-----Delete old image from cloudinary
    await cloudinary.uploader.destroy(subcategory.image.public_id);
    subcategory.image = { secure_url, public_id };
  }
  if (req.body.name || req.file) {
    //----------Update subcategory
    subcategory.updatedBy = req.user._id
    await subcategory.save();
    return res.status(200).json({ message: "Updated", subcategory });
  } else {
    return next( new ErrorClass(`You are not updating`, StatusCodes.BAD_REQUEST));
  }
};
//============== Get SubCategory ==============
export const getSubCategory = async (req, res, next) => {
  //----------Find SubCategory
  const subcategory = await subcategoryModel.find().populate({
    path: 'categoryId'
  });
  return res.status(200).json({ message: "Done", subcategory });
};
//============== Delete SubCategory ==============
export const deleteSubCategory = async (req, res, next) => {};
