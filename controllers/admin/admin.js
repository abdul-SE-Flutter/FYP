const {
  Program,
  CollegeStudentProgram,
  UniversityStudentProgram,
  PostGraduateStudentProgram,
} = require("../../models/program");

const Noti = require("../../models/notification");
const {User} = require("../../models/user");

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
      eligibilityCriteria,
      termsAndConditions
    } = req.body;

    const new_program = {
      programLink: programLink,
      category: category,
      // FAQs: FAQs,
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

     const noti = await new Noti({related_program : program._id , regions : targetedRegions.split(",")}).save();
    res.status(201).json({
      message: `${minQualification} program posted to DB`,
      programId: program._id,
      success: true,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    console.log(err.message);
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
         return res.status(400).json({message : `program with id : ${programId} not found`});
    }
    if (program.imageUrl) {
      clearFile(
        path.join(__dirname, "..", "images", "posts/") +
          path.basename(program.imageUrl)
      );
    }
    res.status(201).json({
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

exports.getAllUsers=async(req ,res)=>{
  try {
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(400).json({message : "No such user exists"});
    }
        if(user.role!=="Admin"){
          return res.status(400).json({message : "You are not admin , cannot perform this action"});
        }

        const users = await User.find({role: {$ne : "Admin"}}).select("id role username");
        res.status(200).json({
          message: "All users",
          users: users,
          success: true,
        });

  } catch (err) {
     return res.status(500).json({ message: err.message });
  }
}

exports.deleteAUser=async(req ,res)=>{
  try {
    const {uid} = req.params;
    const userId = req.userId;
    const user = await User.findById(userId);
    if (!user) {
        return res.status(400).json({message : "No such user exists"});
    }
        if(user.role!=="Admin"){
          return res.status(400).json({message : "You are not admin , cannot perform this action"});
        }
        
        const userToDel = await User.findOne({role: {$ne : "Admin"} , _id :uid });
        await userToDel.deleteOne();
        res.status(201).json({
           message : "User deleted successfully"
        });

  } catch (err) {
     return res.status(500).json({ message: err.message });
  }
}


exports.editProgram=async(req ,res)=>{
  try {
     
    let wtf = req.body.targetedDisciplines;
    if (Array.isArray(wtf)) {
      // Filter out any null values
      const filteredArray = wtf.filter(item => item !== null);
  
      // Check if the filtered array has any elements
      if (filteredArray.length > 0) {
          // Save the filtered array to the database
          wtf = filteredArray;
          
      } else {
          // Handle the case where there are no valid strings to save
          wtf = [];
      }
  } else {
      // Handle the case where 'wtf' is not an array
      wtf = [];
  }
  

    const requestBody = {
      lastDateToApply: req.body.lastDateToApply,
      maxAge: req.body.maxAge,
      maxIncomeLimit: req.body.maxIncomeLimit,
      amountOfScholarship: req.body.amountOfScholarship,
      minQualification: req.body.minQualification,
      durationOfProgram: req.body.durationOfProgram,
      targetedRegions: Array.isArray(req.body?.targetedRegions) ? req.body.targetedRegions : req.body?.targetedRegions?.includes(",") ? req.body?.targetedRegions?.split(",") : !req.body?.targetedRegions ? undefined : req.body?.targetedRegions  ,
      description: req.body.description,
      title: req.body.title,
      category: req.body.category,
      eligibilityCriteria: req.body?.EligibilityCriteria?.includes(",") ? req.body.EligibilityCriteria.split(",") : !req.body.EligibilityCriteria ? undefined: [req.body.EligibilityCriteria] ,
      termsAndConditions: req.body?.termsAndConditions?.includes(",") ? req.body.termsAndConditions.split(",") : !req.body.termsAndConditions ? undefined: [req.body.termsAndConditions] ,
      // FAQs: req.body.FAQs,
      isPHD_program: req.body.isPHD_program,
      requiresFirstDivison: req.body.requiresFirstDivison,
      mustHoldInternationalUniversityAcceptance: req.body.mustHoldInternationalUniversityAcceptance,
      minCGPA: req.body.minCGPA,
      requiresEmployeeOfPublicSector: req.body.requiresEmployeeOfPublicSector,
      targetedDisciplines: wtf  ,
      programLink: req.body.programLink,
      durationOfProgram: req.body.durationOfProgram,
      amountOfScholarship: req.body.amountOfScholarship,
      requiresUniversityRank: req.body.requiresUniversityRank
      ,
      minSSCPrcntg: req.body.minSSCPrcntg,
      minSHCPrcntg: req.body.minSHCPrcntg,
      minSemester: req.body.minSemester
      
    };

    console.log(requestBody);

    const programId = req.params.programId;

    const userId = req.userId;

    const user = await User.findById(userId);
    if (!user) {
        return res.status(400).json({message : "No such user exists"});
    }
        if(user.role!=="Admin"){
          return res.status(400).json({message : "You are not admin , cannot perform this action"});
        }

        const program = await Program.findById(programId);
        if (!program) {
            return res.status(400).json({message : "No such program exists"});
        }

        program.lastDateToApply = requestBody.lastDateToApply;
        program.maxAge = requestBody.maxAge;
        program.maxIncomeLimit = requestBody.maxIncomeLimit;
        program.amountOfScholarship = requestBody.amountOfScholarship;
        program.minQualification = requestBody.minQualification;
        program.durationOfProgram = requestBody.durationOfProgram;
        program.targetedRegions = requestBody.targetedRegions;
        program.description = requestBody.description;
        program.title = requestBody.title;
        program.category = requestBody.category;
        program.eligibilityCriteria = requestBody.eligibilityCriteria;
        program.termsAndConditions = requestBody.termsAndConditions;
        program.FAQs = requestBody.FAQs;
        program.isPHD_program = requestBody.isPHD_program;
        program.requiresFirstDivison = requestBody.requiresFirstDivison;
        program.mustHoldInternationalUniversityAcceptance = requestBody.mustHoldInternationalUniversityAcceptance;
        program.minCGPA = requestBody.minCGPA;
        program.requiresEmployeeOfPublicSector = requestBody.requiresEmployeeOfPublicSector;
        program.targetedDisciplines = requestBody.targetedDisciplines;
        program.programLink = requestBody.programLink;
        program.durationOfProgram = requestBody.durationOfProgram;
        program.amountOfScholarship = requestBody.amountOfScholarship;
        program.requiresUniversityRank = requestBody.requiresUniversityRank;
        program.minSSCPrcntg = requestBody.minSSCPrcntg;
        program.minSHCPrcntg = requestBody.minSHCPrcntg;
        program.minSemester = requestBody.minSemester;

        await program.save();

        
        res.status(201).json({message : "Program updated successfully"});

  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ message: error.message });
    
  }
}


exports.signWithEmailAndPassword = signWithEmailAndPassword;
