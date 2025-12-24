const errorHandler = (err, req, res, next) => {
  const errCode = err.statusCode || 500;
  console.error(err.stack);
  if (req.originalUrl.startsWith("/api/")) {
    res.status(errCode).json({
      status: errCode,
      message: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "production" ? "" : err.stack,
    });
  } else {
    res.status(errCode).render("error", {
      status: errCode,
      message: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "production" ? "" : err.stack,
    });
  }
};
export default errorHandler;
