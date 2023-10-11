import slugify from "slugify";
import categoryModel from "../../../../DB/model/Category.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import cloudinary from "../../../utils/cloudinary.js";
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";
//============== Create Category ==============
export const createCategory = async (req, res, next) => {
  const { name } = req.body;
  //-----Must be a unique name
  if (await categoryModel.findOne({ name , createdBy: req.user._id})) {
    return  next( new ErrorClass(
      `Duplicated category name ${name}`,
      StatusCodes.CONFLICT
    ));
  }
  //-----Upload image in cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.file.path,
    {folder:`${process.env.APP_NAME}/category`}
  ); 
  //-----Create category
  const category = await categoryModel.create({
    name,
    slug: slugify(name, "-"),
    image: { secure_url, public_id },
    createdBy: req.user._id
  });
  return res.status(201).json({ message: "Created", category });
};
//============== Update Category ==============
export const updateCategory = async (req, res, next) => {
  if (!req.body.name && !req.file) {
    return next( new ErrorClass(`You are not updating`, StatusCodes.BAD_REQUEST));
  } 
  //----------Find Category
  const category = await categoryModel.findById(req.params.categoryId);
  if (!category) {
    return next(new ErrorClass(
      `Category not found or in-valid category id`,
      StatusCodes.BAD_REQUEST
    ));
  }
  //----------Check name
  if (req.body.name) {
    //-----Check if old name != new name
    if (category.name == req.body.name) {
      return next(
        next( new ErrorClass(
          `Cannot update category with the same name`,
          StatusCodes.BAD_REQUEST
        )
      ));
    }
    //-----Check if other category have the same name
    if (await categoryModel.findOne({ name: req.body.name })) {
      return  next( new ErrorClass(
        `Duplicated category name ${req.body.name}`,
        StatusCodes.CONFLICT
      ));
    }
    category.name = req.body.name;
    //-----slug
    category.slug = slugify(req.body.name, "-");
  }
  //----------file
  if (req.file) {
    //-----Upload image in cloudinary
    const { secure_url, public_id } = await cloudinary.uploader.upload(
      req.file.path,
      { folder: `${process.env.APP_NAME}/category`}
    );
    //-----Delete old image from cloudinary
    await cloudinary.uploader.destroy(
      category.image.public_id
    );
    category.image = { secure_url, public_id }
  } 
  //----------updated By
  category.updatedBy = req.user._id
  //----------Update category
  await category.save()
  return res.status(200).json({ message: "Updated", category });
};
//============== Get Category ==============
export const getCategory = async (req, res, next) => {
  //----------Find Category
  const category = await categoryModel.find().populate([
    {
      path: 'subcategory'
    }
  ])
  return res.status(200).json({ message: "Done", category });
};
//============== Delete Category ==============
export const deleteCategory = async (req, res, next) => {
};