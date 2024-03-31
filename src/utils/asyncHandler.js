// const asyncHandler = (asyncFunction) => {
//   async (req, res, next) => {
//     try {
//       await asyncFunction(req, res, next);
//     } catch (error) {
//       res.status(error.code || 500).json({
//         success: false,
//         message: error.message,
//       });
//     }
//   };
// };

export { asyncHandler };

const asyncHandler = (requestHandler) => (res, req, next) => {
  Promise.resolve(requestHandler(res, req, next)).catch((err) => {
    console.error(err);
  });
};
