const {
  Program,
  CollegeStudentProgram,
  UniversityStudentProgram,
  PostGraduateStudentProgram,
} = require("../../models/program");

const Noti = require("../../models/notification");

const path = require("path");
const programIDValidator = require("../utils/IdValidator");
const {
  getPrograms,
  getSingleProgram,
  clearFile,
  signWithEmailAndPassword,
} = require("../utils/shared");
const { validationResult } = require("express-validator");

exports.getPrograms = getPrograms;
exports.getSingleProgram = getSingleProgram;

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
      programLink,
      targetedRegions,
      lastDateToApply,
      maxAge,
      maxIncomeLimit,
      minQualification,
      description,
      title,
      category,
      durationOfProgram,
      amountOfScholarship,
      FAQs,
    } = req.body;

    const new_program = {
      programLink: programLink,
      category: category,
      FAQs: FAQs,
      targetedRegions: targetedRegions,
      lastDateToApply: lastDateToApply,
      maxAge: maxAge,
      maxIncomeLimit: maxIncomeLimit,
      amountOfScholarship: amountOfScholarship,
      minQualification: minQualification,
      description: description,
      title: title,
      durationOfProgram: durationOfProgram,
    };
    if (req.file) {
      new_program.imageUrl =
        "http://localhost:8080/images/posts/" + req.file.filename;
    }
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
        let universityStudentProgram;
        if (category === "international") {
          universityStudentProgram = new UniversityStudentProgram({
            ...new_program,
            mustHoldInternationalUniversityAcceptance:
              req.body.mustHoldInternationalUniversityAcceptance,
            targetedDisciplines: req.body.targetedDisciplines,
            minCGPA: req.body.minCGPA,
            requiresFirstDivison: req.body.requiresFirstDivison,
          });
        } else {
          universityStudentProgram = new UniversityStudentProgram({
            ...new_program,
            onlyForPublicUnis: req.body.onlyForPublicUnis,
            minCGPA: req.body.minCGPA,
            minSHCPrcntg: req.body.minSHCPrcntg,
            minSSCPrcntg: req.body.minSSCPrcntg,
            minSemester: req.body.minSemester,
            requiresUniversityRank: req.body.requiresUniversityRank,
            requiresFirstDivison: req.body.requiresFirstDivison,
          });
        }

        program = await universityStudentProgram.save();
        programSchema = universityStudentProgram;
        break;
      case "PostGraduateStudentProgram":
        let postGraduateStudentProgram;
        if (category === "international") {
          postGraduateStudentProgram = new PostGraduateStudentProgram({
            ...new_program,
            isPHD_program: req.body.isPHD_program,
            requiresFirstDivison: req.body.requiresFirstDivison,
            mustHoldInternationalUniversityAcceptance:
              req.body.mustHoldInternationalUniversityAcceptance,
            minCGPA: req.body.minCGPA,
            requiresEmployeeOfPublicSector:
              req.body.requiresEmployeeOfPublicSector,
            targetedDisciplines: req.body.targetedDisciplines,
          });
        } else {
          postGraduateStudentProgram = new PostGraduateStudentProgram({
            ...new_program,
            isPHD_program: req.body.isPHD_program,
            requiresFirstDivison: req.body.requiresFirstDivison,
            minCGPA: req.body.minCGPA,
            requiresEmployeeOfPublicSector:
              req.body.requiresEmployeeOfPublicSector,
          });
        }

        program = await postGraduateStudentProgram.save();
        programSchema = postGraduateStudentProgram;
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

     const noti = await new Noti({related_program : program._id , regions : targetedRegions}).save();
    res.status(201).json({
      message: `${minQualification} program posted to DB`,
      programId: program._id,
      success: true,
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
    res.status(200).json({
      message: "program deleted: program id is attached in data feild",
      data: program._id,
      success: true,
    });
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
    res.status(200).json({
      message: "program updated=> program id is attached in data feild",
      data: program._id,
      success: true,
    });
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



exports.signWithEmailAndPassword = signWithEmailAndPassword;
