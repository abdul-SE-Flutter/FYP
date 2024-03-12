const { default: mongoose } = require("mongoose");
exports.validateID = (programId) => {
  if (!programId || !mongoose.Types.ObjectId.isValid(programId)) {
    const err = new Error("Id is incorrect or not defined");
    err.statusCode = 422;
    throw err;
  }
  return programId;
};
