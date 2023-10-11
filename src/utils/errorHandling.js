//Error handling function
export const asyncHandler = (fn) => {
  return (req, res, next) => {
    return fn(req, res, next).catch((error) => {
      if (process.env.MOOD == 'DEV') {
        return res.status(500).json({ message: "Catch error" , error , stack:error.stack});
      }
      if (error.message === "jwt expired") {
        return res.status(401).json({ message: "Invalid account or token is expired" });
      }
      return next(new Error(error) );
    });
  };
};
//Error handling global middleware
export const globalErrorHandling = (error, req, res, next) => {
  return res
    .status(error.status || 400)
    .json({
      message: "G Error",
      messageError: error.message,
      // stack: error.stack,
    });
};
