// Wraps an async controller. If it throws, the error goes to next(err).
//a higher-order function. It takes a function and returns a function.
const asyncHandler = (requestHandler) => {
  return (req, res, next) => {
    Promise.resolve(requestHandler(req, res, next)).catch(next);
  };
};

export { asyncHandler };