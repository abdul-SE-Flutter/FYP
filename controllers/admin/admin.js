const {
  Program,
  CollegeStudentProgram,
  UniversityStudentProgram,
  MSStudentProgram,
  PhdStudentProgram,
} = require("../../models/program");
const programIDValidator = require("../utils/IdValidator");
const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");

exports.postProgram = async (req, res, next) => {
  const errors = validationResult(req);
  try {
    if (!errors.isEmpty()) {
      const error = new Error(err.array()[0].msg);
      error.statusCode = 422;
      error.data = err;
      throw error;
    }

    const {
      targetedRegions,
      lastDateToApply,
      maxAge,
      onlyForPublicUnis,
      maxIncomeLimit,
      amountOfScholarship,
      minQualification,
      description,
      title,
      durationOfProgram,
    } = req.body;

    const new_program = {
      targetedRegions: targetedRegions,
      lastDateToApply: lastDateToApply,
      maxAge: maxAge,
      onlyForPublicUnis: onlyForPublicUnis,
      maxIncomeLimit: maxIncomeLimit,
      amountOfScholarship: amountOfScholarship,
      minQualification: minQualification,
      description: description,
      title: title,
      durationOfProgram: durationOfProgram,
    };
    let program;
    let programSchema;
    switch (minQualification) {
      case "CollegeStudentProgram":
        const collegeStudentProgram = new CollegeStudentProgram({
          ...new_program,
          minSHCPrcntg: req.body.minSHCPrcntg,
        });
        program = await collegeStudentProgram.save();
        programSchema = collegeStudentProgram;
        break;
      case "UniversityStudentProgram":
        const universityStudentProgram = new UniversityStudentProgram({
          ...new_program,
          minCGPA: req.body.minCGPA,
          minSHCPrcntg: req.body.minSHCPrcntg,
          minSSCPrcntg: req.body.minSSCPrcntg,
          minSemester: req.body.minSemester,
        });

        program = await universityStudentProgram.save();
        programSchema = universityStudentProgram;
        break;
      case "MSStudentProgram":
        const msStudentProgram = new MSStudentProgram({
          ...new_program,
          minCGPA: req.body.minCGPA,
          requiredEmployeeOfPublicSector:
            req.body.requiredEmployeeOfPublicSector,
        });
        program = await msStudentProgram.save();
        programSchema = msStudentProgram;
        break;
      case "PhdStudentProgram":
        const phdSyudentProgram = new PhdStudentProgram({
          ...new_program,
          requiredEmployeeOfPublicSector:
            req.body.requiredEmployeeOfPublicSector,
          minCGPA: req.body.minCGPA,
          firstDivisionThroughtAcademicia:
            req.body.firstDivisionThroughtAcademicia,
        });
        program = await phdSyudentProgram.save();
        programSchema = phdSyudentProgram;
        break;
      default:
        const err = new Error(
          "Please re-enter program details some feilds might be missing or user role might be incorectly defined"
        );
        err.statusCode = 422;
        throw err;
    }
    if (program && req.file) {
      programSchema.imageUrl =
        "http://localhost:8080/images/posts/" + req.file.filename;
      await programSchema.save();
    }
    res.status(201).json({
      message: `${minQualification} program posted to DB`,
      programId: program._id,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    if (req.file) {
      clearFile(
        path.join(__dirname, "..", "images", "posts/") + req.file.filename
      );
    }
    next(err);
  }
};

exports.deleteProgram = async (req, res, next) => {
  try {
    const programId = programIDValidator.validateID(req.params.programId);
    const program = await Program.findByIdAndDelete(programId);
    if (!program) {
      const err = new Error(`program with id : ${programId} not found`);
      err.statusCode = 404;
      throw err;
    }
    if (program.imageUrl) {
      clearFile(
        path.join(__dirname, "..", "images", "posts/") +
          path.basename(program.imageUrl)
      );
    }
    res
      .status(200)
      .json({ message: "program deleted", programId: program._id });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.updateProgram = async (req, res, next) => {
  try {
    const programId = programIDValidator.validateID(req.params.programId);
    const program = await Program.findByIdAndUpdate(programId);
    Object.assign(program, req.body); // Update program fields
    if (!program) {
      throw new Error(`program with id : ${programId} not found`);
    }
    let imageUrl = program.imageUrl || null;

    if (req.file) {
      imageUrl = "http://localhost:8080/images/posts/" + req.file.filename;
      if (program.imageUrl) {
        clearFile(
          path.join(__dirname, "..", "..", "images", "posts/") +
            path.basename(program.imageUrl)
        );
      }
    }
    if (imageUrl) {
      program.imageUrl = imageUrl;
    }
    await program.save();
    res
      .status(200)
      .json({ message: "program updated", programId: program._id });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    if (req.file) {
      clearFile(
        path.join(__dirname, "..", "..", "images", "posts/") + req.file.filename
      );
    }
    next(err);
  }
};

exports.getSingleProgram = async (req, res, next) => {
  try {
    const programId = programIDValidator.validateID(req.params.programId);
    const result = await Program.findById(programId);
    if (!result) {
      throw new Error(`program with id : ${programId} not found`);
    }
    res
      .status(200)
      .json({ message: "program found", data: { ...result._doc } });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.getPrograms = async (req, res, next) => {
  try {
    const programs = await Program.find();
    if (!programs || programs.length == 0) {
      const err = new Error("Could not find any program in database");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({
      count: programs.length,
      data: { ...programs._doc },
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

const clearFile = (pathToFile) => {
  fs.unlink(pathToFile, (err) => {
    if (err) {
      console.log("failed to delete file");
    }
  });
};
