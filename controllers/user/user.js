const {
  Program,
  CollegeStudentProgram,
  UniversityStudentProgram,
  MSStudentProgram,
  PhdStudentProgram,
} = require("../../models/program");
const id_validator = require("../utils/IdValidator");
exports.getPrograms = async (req, res, next) => {
  try {
    const programs = await Program.find();
    if (programs.length !== 0) {
      res
        .status(200)
        .json({ count: programs.length, data: { ...programs._doc } });
    } else {
      const err = new Error("No program added yet! Please visit later");
      err.statusCode = 404;
      throw err;
    }
  } catch (error) {
    if (!error.statusCode) error.statusCode = 500;
    next(error);
  }
};

exports.getSingleProgram = (req, res, next) => {
  try {
    const id = id_validator.validateID(req.params.programId);
    const program = Program.findById(id);
    if (!program) {
      const err = new Error("Requeted program could not found in database");
      err.statusCode = 404;
      throw err;
    }

    res
      .status(200)
      .json({ message: "requested program attached", program: program });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    throw err;
  }
};
