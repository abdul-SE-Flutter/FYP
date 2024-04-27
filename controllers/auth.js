// const bcrypt = require('bcrypt');
const idValidator = require("./utils/IdValidator");
const {
  User,
  CollegeStudent,
  UniversityStudent,
  PostGraduateStudent,
} = require("../models/user");
const email_chekcer = require("../services/email");
const {
  deleteAccount,
  clearFile,
  signWithEmailAndPassword,
} = require("./utils/shared");
const path = require("path");

const { validationResult } = require("express-validator");

exports.signup = async (req, res, next) => {
  const err = validationResult(req);
  try {
    if (!err.isEmpty()) {
      const error = new Error(err.array()[0].msg);
      error.statusCode = 422;
      error.data = err;
      throw error;
    }
    let cgpa;
    let SSC_prcntg;

    const {
      username,
      hasFirstDivisionThroughtAcademicia,
      age,
      email,
      password,
      province,
      hasOtherScholarship,
      monthlyIncome,
      role,
    } = req.body;

    if(role==="Admin"){
      return res.status(400).json({message : "Admin cannot register with this api" });
    }

    // const result = await email_chekcer.checkEmail(email);
    // if (!result) {
    //   const err = new Error("Email not exists");
    //   err.statusCode = 422;
    //   throw err;
    // }

    const newUser = {
      username: username,
      age: age,
      email: email,
      password: password,
      province: province,
      hasOtherScholarship: hasOtherScholarship,
      monthlyIncome: monthlyIncome,
      hasFirstDivisionThroughtAcademicia: hasFirstDivisionThroughtAcademicia,
      role: role,
    };

    if (req.file) {
      console.log("Uploaded image is : ", req.file);
      newUser.imageUrl =
        "http://localhost:8080/images/user_profile_pics/" + req.file.filename;
    }

    console.log("Image in binary not loaded : ", req.file);
    switch (role) {
      case "CollegeStudent":
        SSC_prcntg = req.body.SSC_prcntg;
        const collegeStudent = new CollegeStudent({ ...newUser, SSC_prcntg });
        await collegeStudent.save();
        break;
      case "UniversityStudent":
        const HSC_prcntg = req.body.HSC_prcntg;
        SSC_prcntg = req.body.SSC_prcntg;
        const semester = req.body.semester;
        cgpa = req.body.cgpa;
        const universityStudent = new UniversityStudent({
          ...newUser,
          HSC_prcntg,
          semester,
          SSC_prcntg,
          cgpa,
        });
        await universityStudent.save();
        break;
      case "PostGraduateStudent":
        cgpa = req.body.cgpa;
        const hasCompletedMS = req.body.hasCompletedMS;
        const isEmployeeOfPublicSector = req.body.isEmployeeOfPublicSector;
        const postGraduateStudent = new PostGraduateStudent({
          ...newUser,
          cgpa,
          hasCompletedMS,
          isEmployeeOfPublicSector,
        });
        await postGraduateStudent.save();
        break;
    }

    res.status(200).json({
      message: `${role} posted to DB`,
      success: true,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    if (req.file) {
      clearFile(
        path.join(__dirname, "..", "images", "user_profile_pics/") +
          req.file.filename
      );
    }
    next(err);
  }
};

exports.signWithEmailAndPassword = signWithEmailAndPassword;

exports.updateUser = async (req, res, next) => {
  try {
    idValidator.validateID(req.params.id);
    const user = await User.findById(req.params.id);

    if (!user) {
      const err = new Error("User not found");
      err.statusCode = 404;
      throw err;
    }

    Object.assign(user, req.body);
    await user.save();

    let imageUrl = user.imageUrl || null;
    if (req.file) {
      imageUrl =
        "http://localhost:8080/images/user_profile_pics/" + req.file.filename;
      if (user.imageUrl) {
        clearFile(
          path.join(__dirname, "..", "images", "user_profile_pics/") +
            path.basename(user.imageUrl)
        );
      }
    }

    if (imageUrl) {
      user.imageUrl = imageUrl;
      await user.save();
    }
    res
      .status(200)
      .json({ message: "User updated successfully", data: { ...user._doc } });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    if (req.file) {
      clearFile(
        path.join(__dirname, "..", "images", "user_profile_pics/") +
          req.file.filename
      );
    }
    next(err);
  }
};

exports.createAdmin=async(req ,res)=>{
    const {username,email,password , role}=req.body;
    try {
      

    const user = await new User({username,email,password,role:role}).save();
    res.status(200).json({message: role + " created successfully",data:{...user._doc}});
  } catch (error) {
      return res.status(500).json({message : error.message});   
  }
}
exports.deleteAccount = deleteAccount;
