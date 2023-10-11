import jwt from "jsonwebtoken";
import userModel from "../../DB/model/User.model.js";
import { ErrorClass } from "../utils/errorClass.js";
import { asyncHandler } from "../utils/errorHandling.js";
import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";
export const roles = {
  Admin: "Admin",
  User: "User",
  SuperAdmin: "SuperAdmin",
}
//Authentication middleware to verfiy token and add data of (user) in request
export const auth =  (accessRoles = []) => { return asyncHandler(async (req, res, next) => {
  // Get token from headers
  const { authorization } = req.headers;
  if (!authorization?.startsWith(process.env.BEARER_KEY)) {
    return next(
      new ErrorClass("authorization is required or in-valid BearerKey", StatusCodes.BAD_REQUEST)
    );
  }
  const token = authorization.split(process.env.BEARER_KEY)[1];
  if (!token) {
    return next(new ErrorClass("Token is required", StatusCodes.UNAUTHORIZED));
  }
  // Verify token
  const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
  // Find decoded ? and if it found without id
  if (!decoded?.id) {
    return next(new ErrorClass("In-valid token payload", StatusCodes.BAD_REQUEST));
  }
  //check if user is in DB?
  const user = await userModel.findById(decoded.id)
  if (!user) {
    return next(new ErrorClass("Not register account", StatusCodes.NOT_FOUND));
  }
  //Check expire sesion of user
  if (parseInt(user.changePasswordTime?.getTime()) / 1000 > decoded.iat) {
    return next(new ErrorClass("Token is Expired , please login again", StatusCodes.BAD_REQUEST));
  }
  if (!accessRoles.includes(user.role) ) {
    return next(new Error(`Not authorized account`, { cause: 403 }))
}
req.user = user;
req.time = decoded.iat;
if (req.user.isDeleted) {
  return next(
    new ErrorClass("This email is deleted Please login again", StatusCodes.UNAUTHORIZED)
  );
}
if (!req.user.confirmEmail) {
  return next(new ErrorClass("Confirm your email", StatusCodes.BAD_REQUEST));
}
    //To take data of user to next middleware
  //Add property (user) to request
  return next();
})};
