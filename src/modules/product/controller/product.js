import slugify from "slugify";
import brandModel from "../../../../DB/model/Brand.model.js";
import categoryModel from "../../../../DB/model/Category.model.js";
import subcategoryModel from "../../../../DB/model/Subcategory.model.js";
import productModel from "../../../../DB/model/Product.model.js";
import { ErrorClass } from "../../../utils/errorClass.js";
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";
import cloudinary from "../../../utils/cloudinary.js";
import { nanoid } from "nanoid";
import { ApiFeatures } from "../../../utils/apiFeatures.js";
//============== Create product ==============
export const createProduct = async (req, res, next) => {
  const { name, categoryId, subcategoryId, brandId, discount, price } =
    req.body;
  if (!(await categoryModel.findById(categoryId))) {
    return next(
      new ErrorClass(`In-valid category ID`, StatusCodes.BAD_REQUEST)
    );
  }
  if (!(await subcategoryModel.findOne({ _id: subcategoryId, categoryId }))) {
    return next(
      new ErrorClass(
        `In-valid category or subcategory ID`,
        StatusCodes.BAD_REQUEST
      )
    );
  }
  if (!(await brandModel.findById(brandId))) {
    return next(
      new ErrorClass(
        `In-valid category or subcategory or brand ID`,
        StatusCodes.BAD_REQUEST
      )
    );
  }
  req.body.slug = slugify(name, {
    replacement: "-",
    trim: true,
    lower: true,
  });
  req.body.finalPrice = Number.parseFloat(price -( price * ((discount || 0) / 100))).toFixed(2);
  req.body.customId = nanoid();
  //-----Upload mainImage in cloudinary
  const { secure_url, public_id } = await cloudinary.uploader.upload(
    req.files.mainImage[0].path,
    { folder: `${process.env.APP_NAME}/product/${req.body.customId}` }
  );
  req.body.mainImage = { secure_url, public_id };
  //-----Upload subImages in cloudinary
  if (req.files.subImages) {
    req.body.subImages = [];
    for (const file of req.files.subImages) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        file.path,
        { folder: `${process.env.APP_NAME}/product/${req.body.customId}` }
      );
      req.body.subImages.push({ secure_url, public_id });
    }
  }
  //--------Create product
  req.body.createdBy = req.user._id
  const product = await productModel.create(req.body);
  return res
    .status(201)
    .json({ message: "Done", product, QRCode: req.body.QRCode });
};
//============== Products ==============
export const products = async (req, res, next) => {
  const apiFeature = new ApiFeatures(productModel.find().populate([{path:"review"}]), req.query).paginate().filter().search().select()
  const products = await apiFeature.mongooseQuery
  for (let i = 0; i < products.length; i++) {
      let calcRating = 0;
      for (let j = 0; j < products[i].review.length; j++) {
          calcRating += products[i].review[j].rating
      }
      const convObject = products[i].toObject()
      convObject.rating = calcRating / products[i].review.length
      products[i] = convObject

  }
  return res.status(200).json({ message: "Done", products })
}
//=============== Update products
export const updateProduct = async (req, res, next) => {
  const { productId } = req.params;
  const product = await productModel.findById(productId)
  if (!product) {
      return next(new Error("In-valid product ID", { cause: 404 }))
  }
  const { name, price, discount, categoryId, subcategoryId, brandId } = req.body;
  if (categoryId && subcategoryId) {
      if (!await subcategoryModel.findOne({ _id: subcategoryId, categoryId })) {
          return next(new Error("In-valid category or subcategory IDs", { cause: 400 }))
      }
  }
  if (brandId) {
      if (!await brandModel.findById(brandId)) {
          return next(new Error("In-valid category or subcategory ids", { cause: 400 }))
      }
  }
  if (name) {
      req.body.slug = slugify(name, {
          replacement: '-',
          trim: true,
          lower: true
      })
  }
  req.body.finalPrice = (price || discount) ? (price || product.price) - ((price || product.price) * ((discount || product.discount) / 100)) : product.finalPrice;
  if (req.files?.mainImage?.length) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(req.files?.mainImage[0].path, { folder: `${process.env.APP_NAME}/product/${product.customId}` })
      req.body.mainImage = { secure_url, public_id }
      await cloudinary.uploader.destroy(product.mainImage.public_id)
  }
  if (req.files?.subImages?.length) {
      req.body.subImages = []
      for (const file of req.files.subImages) {
          const { secure_url, public_id } = await cloudinary.uploader.upload(file.path, { folder: `${process.env.APP_NAME}/product/${product.customId}/subImages` })
          req.body.subImages.push({ secure_url, public_id })
      }
  }
  req.body.updatedBy = req.user._id

  await productModel.updateOne({ _id: productId }, req.body )
  return res.status(200).json({ message: "Done" })
}
