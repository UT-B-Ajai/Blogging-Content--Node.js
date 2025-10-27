exports.successResponse = (res, data = null, message = "Success", code = 200) => {
  return res.status(code).json({
    status: true,
    code,
    message,
    data,
  });
};

exports.errorResponse = (res, message = "Something went wrong", code = 500, errors = null) => {
  return res.status(code).json({
    status: false,
    code,
    message,
    errors,
  });
};
