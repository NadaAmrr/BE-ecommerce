import {
  ReasonPhrases,
  StatusCodes,
  getReasonPhrase,
  getStatusCode,
} from "http-status-codes";
import jwt from "jsonwebtoken";
import sendEmail from "../../../utils/email.js";
import { createHtml, linkBtn } from "../../../utils/emailHTML.js";
import {
  compare,
  decryptData,
  encryptData,
  hash,
} from "../../../utils/HashAndEncrypt.js";
import {
  generateToken,
  verifyToken,
  accessTokenFun,
  refreshTokenFun,
} from "../../../utils/generateAndVerifyToken.js";
import { nanoid } from "nanoid";
import { ErrorClass } from "../../../utils/errorClass.js";
import userModel from "../../../../DB/model/User.model.js";
//============== Signup ==============
export const signup = async (req, res, next) => {
  const { userName, email, password } = req.body;
  //---------- Check Email
  if (await userModel.findOne({ email: email.toLowerCase() })) {
    new ErrorClass(
      `this email ${email} already exists`,
      StatusCodes.BAD_REQUEST
    );
  }
  //---------- Generate tokens
  //-----Generate token for confirm email
  const token = generateToken({
    payload: { email },
    signature: process.env.EMAIL_SIGNATURE,
    expiresIn: 60 * 15,
  });
  //-----Generate token for New confirm email
  const tokenNewReq = generateToken({
    payload: { email },
    signature: process.env.EMAIL_SIGNATURE,
    expiresIn: "2d",
  });
  //-----Generate token for unsubscribe
  const tokenUnsubscribe = generateToken({
    payload: { email },
    signature: process.env.EMAIL_SIGNATURE,
    expiresIn: "1m",
  });

  //---------- Send confirmation email
  const sentEmail = await sendEmail({
    to: email,
    subject: "Confirm Email",
    html: createHtml(
      `${linkBtn(
        `${req.protocol}://${req.headers.host}/auth/confirmEmail/${token}`,
        "Verify Email address",
        "Use the following button to confirm your email"
      )}`,
      `${linkBtn(
        `${req.protocol}://${req.headers.host}/auth/requestNewConfirmEmail/${tokenNewReq}`,
        "New verify Email address",
        "If you have trouble using the button above, please click the following button"
      )}`,
      `${linkBtn(
        `${req.protocol}://${req.headers.host}/auth/unsubscribe/${tokenUnsubscribe}`,
        "unsubscribe",
        "If you did not create account, please click in the unsubscribe button"
      )}`,
      "Email Confirmation"
    ),
  });
  if (!sentEmail) {
    return next(new ErrorClass("Email rejected", StatusCodes.BAD_REQUEST));
  }
  //---------- Hash password
  const hashpassword = hash({ plaintext: password });
  //---------- Create user
  //-----Create User
  const user = await userModel.create({
    userName,
    email,
    password: hashpassword,
  });
  return res.status(201).json({ message: "Created", user });
};
//============== Confirm Email ==============
export const confirmEmail = async (req, res, next) => {
  const { token } = req.params;
  const decoded = jwt.verify(token, process.env.EMAIL_SIGNATURE);
  //---------- Update confirm Email to be true
  const user = await userModel.findOneAndUpdate(
    { email: decoded.email },
    {
      confirmEmail: true,
    },
    {
      new: true,
    }
  );
  console.log(user);
  return user
    ? //  res.redirect("")
      res.status(200).json({ message: "Done", confirmEmail: user.confirmEmail })
    : next(new ErrorClass("Not register account", StatusCodes.NOT_FOUND));
};
//============== New Confirm Email ==============
export const newConfirmEmail = async (req, res, next) => {
  const { token } = req.params;

  const decoded = jwt.verify(token, process.env.EMAIL_SIGNATURE);

  const user = await userModel.findOne({ email: decoded.email });

  if (!user) {
    return res.send("<a>Ops you look like do not have account</a>");
  }
  // user is confirmed email?
  if (user.confirmEmail) {
    return res.send("<a>Go to login page</a>");
  }
  // generate token
  const newtoken = jwt.sign(
    { id: user._id, email: user.email },
    process.env.EMAIL_SIGNATURE,
    { expiresIn: 60 * 3 }
  );
  //send email
  await sendEmail({
    to: user.email,
    subject: "Confirm Email",
    html: createHtml(
      `${linkBtn(
        `${req.protocol}://${req.headers.host}/auth/confirmEmail/${newtoken}`,
        "Verify Email address"
      )}`,
      ``,
      ``,
      "New Email Confirmation"
    ),
  });
  return res.send(`<p>Check your inbox now</p>`);
};
//============== login ==============
export const login = async (req, res, next) => {
  const { email, password } = req.body;
  // Find user by email
  const user = await userModel.findOne({ email });
  //check user
  if (!user) {
    return next(new ErrorClass("In-valid login data", StatusCodes.NOT_FOUND));
  }
  //check if user is email confirmed true?
  if (!user.confirmEmail) {
    return next(
      new ErrorClass("You have to confirm your Email", StatusCodes.NOT_FOUND)
    );
  }
  // password matched ?
  if (!compare({ plaintext: password, hashValue: user.password })) {
    return next(new ErrorClass("In-valid login data", StatusCodes.BAD_REQUEST));
  }
  const accessToken = accessTokenFun({
    id: user._id,
    email: user.email,
    role: user.role,
  });
  const refreshToken = refreshTokenFun({ id: user._id, email: user.email });

  user.status = "online";
  await user.save();
  return res
    .status(StatusCodes.OK)
    .json({ message: "Done", accessToken, refreshToken });
};
//============== unsubscribe ==============
export const unsubscribe = async (req, res, next) => {
  const { token } = req.params;

  const decoded = jwt.verify(token, process.env.EMAIL_SIGNATURE);

  if (!decoded?.email) {
    return next(new ErrorClass("In-valid Payload", StatusCodes.BAD_REQUEST));
  }
  // Find user by email
  const user = await userModel.findOne({ email: decoded.email });
  if (!user) {
    return next(
      new ErrorClass("Not register account", StatusCodes.UNAUTHORIZED)
    );
  }
  // check if email confirmed
  if (!user.confirmEmail) {
    const deleteUser = await userModel.deleteOne({ _id: decoded.id });

    return res.send({ message: "Account deleted", deleteUser });
  } else if (user.confirmEmail) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      message: "You Can not deleted your account and your account confirmed",
    });
  }
};
//============== Forget password ==============
export const forgetPassword = async (req, res, next) => {
  const { email } = req.body;
  //Find user (email)
  const user = await userModel.findOne({ email });
  // check user
  if (!user) {
    return next(new ErrorClass("invalid user data", StatusCodes.BAD_REQUEST));
  }
  //check if user is email confirmed true?
  if (!user.confirmEmail) {
    return next(
      new ErrorClass("You have to confirm your Email", StatusCodes.NOT_FOUND)
    );
  }
  //Expire date for code OTP
  const expiresAt = Date.now() + 120000; // 2 minutes from now
  //Generate code
  const code = nanoid(6);
  // Send code
  const sentEmail = await sendEmail({
    to: user.email,
    subject: "Forget password",
    html: createHtml(
      `${linkBtn(
        ``,
        `${code}`,
        `${code} Do not share this OTP with anyone, It will expired`
      )}`,
      ``,
      ``,
      "Forget password"
    ),
  });
  if (!sentEmail) {
    return next(new ErrorClass("Email rejected", StatusCodes.BAD_REQUEST));
  }
  await userModel.updateOne({ email }, { code, expCode: expiresAt });
  res.status(StatusCodes.ACCEPTED).json({ message: "Check your email" });
};
//============== Reset password ==============
export const resetPassword = async (req, res, next) => {
  let { code, password, email } = req.body;
  //Find user(email)
  let user = await userModel.findOne({ email });
  if (!user) {
    return next(
      new ErrorClass("invalid user information", StatusCodes.BAD_REQUEST)
    );
  }
  //check if user is email confirmed true?
  if (!user.confirmEmail) {
    return next(
      new ErrorClass("You have to confirm your Email", StatusCodes.BAD_REQUEST)
    );
  }
  //Check if code is expired
  if (Date.now() > user.expCode.getTime()) {
    return next(
      new ErrorClass("invalid code or expired code", StatusCodes.BAD_REQUEST)
    );
  }
  //check code
  if (code != user.code) {
    return next(new ErrorClass("in-valid code", StatusCodes.NOT_ACCEPTABLE));
  }
  //Hash new password
  password = hash({ plaintext: password });
  //create new code
  const newCode = nanoid(6);
  //update user
  await userModel.updateOne(
    { _id: user._id },
    { password, code: newCode, changePasswordTime: Date.now() }
  );
  res.status(StatusCodes.ACCEPTED).json({ message: "done" });
};
//============== New Refresh Token ==============
export const refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken?.startsWith(process.env.BEARER_KEY)) {
    return next(
      new ErrorClass(
        "authorization is required or in-valid BearerKey",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  const token = refreshToken.split(process.env.BEARER_KEY)[1];
  if (!token) {
    return next(
      new ErrorClass(
        "Access Denied. No refresh token provided",
        StatusCodes.BAD_REQUEST
      )
    );
  }
  const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
  if (!decoded) {
    return next(
      new ErrorClass("In-valid refresh token", StatusCodes.BAD_REQUEST)
    );
  }
  const accessToken = accessTokenFun({ id: decoded._id, email: decoded.email });
  res.status(StatusCodes.ACCEPTED).json({ accessToken });
  res.header("authorization", `Hamada__${accessToken}`);
};
