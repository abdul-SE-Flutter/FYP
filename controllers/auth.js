// const bcrypt = require('bcrypt');
const idValidator = require("./utils/IdValidator");
const {
  User,
  CollegeStudent,
  UniversityStudent,
  PostGraduateStudent,
} = require("../models/user");
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
    const {
      username,
      age,
      email,
      password,
      province,
      hasOtherScholership,
      monthlyIcome,
      role,
    } = req.body;

    const newUser = {
      username: username,
      age: age,
      email: email,
      password: password,
      province: province,
      hasOtherScholership: hasOtherScholership,
      monthlyIcome: monthlyIcome,
      role: role,
    };

    if (req.file) {
      newUser.imageUrl =
        "http://localhost:8080/images/user_profile_pics/" + req.file.filename;
    }
    switch (role) {
      case "CollegeStudent":
        const SSC_prcntg = req.body.SSC_prcntg;
        const collegeStudent = new CollegeStudent({ ...newUser, SSC_prcntg });
        await collegeStudent.save();
        break;
      case "UniversityStudent":
        const HSC_prcntg = req.body.HSC_prcntg;
        const currentCGPA = req.body.currentCGPA;
        const semester = req.body.semester;
        const universityStudent = new UniversityStudent({
          ...newUser,
          HSC_prcntg,
          currentCGPA,
          semester,
        });
        await universityStudent.save();
        break;
      case "PostGraduateStudent":
        const cgpa = req.body.cgpa;
        const isPHD = req.body.isPHD;
        const postGraduateStudent = new PostGraduateStudent({
          ...newUser,
          cgpa,
          isPHD,
        });
        await postGraduateStudent.save();
        break;
    }

    res.status(200).json({
      message: `${role} posted to DB`,
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

exports.deleteAccount = deleteAccount;
