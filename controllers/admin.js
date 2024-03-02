const {
  Program,
  CollegeStudentProgram,
  UniversityStudentProgram,
  MSStudentProgram,
  PhdStudentProgram,
} = require("../models/program");
const programIDValidator = require("../controllers/utils/IdValidator");
const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");

exports.postProgrma = async (req, res, next) => {
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
    switch (minQualification) {
      case "CollegeStudentProgram":
        const collegeStudentProgram = new CollegeStudentProgram({
          ...new_program,
          minSHCPrcntg: req.body.minSHCPrcntg,
        });
        program = await collegeStudentProgram.save();

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
        break;
      case "MSStudentProgram":
        const msStudentProgram = new MSStudentProgram({
          ...new_program,
          minCGPA: req.body.minCGPA,
          requiredEmployeeOfPublicSector:
            req.body.requiredEmployeeOfPublicSector,
        });
        program = await msStudentProgram.save();
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
        break;
      default:
        const err = new Error(
          "Please re-enter program details some feilds might be missing or user role might be incorectly defined"
        );
        err.statusCode = 422;
        throw err;
    }

    res.status(201).json({
      message: `${minQualification} program posted to DB`,
      programId: program._id,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.deleteProgram = async (req, res, next) => {
  try {
    const programId = programIDValidator.validateID(req.params.programId);
    const success = await Program.findByIdAndDelete(programId);
    if (!success) {
      throw new Error(`program with id : ${programId} not found`);
    }
    res
      .status(200)
      .json({ message: "program deleted", programId: success._id });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.updateProgram = async (req, res, next) => {
  try {
    const programId = programIDValidator.validateID(req.params.programId);
    const success = await Program.findByIdAndUpdate(programId, req.body);
    if (!success) {
      throw new Error(`program with id : ${programId} not found`);
    }
    res
      .status(200)
      .json({ message: "program updated", programId: success._id });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
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
      const err = new Error("Could not find any program");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({
      count: programs.length,
      data: programs,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
