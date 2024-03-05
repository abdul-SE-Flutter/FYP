// const bcrypt = require('bcrypt');
const idValidator = require("./utils/IdValidator");
const {
  User,
  CollegeStudent,
  UniversityStudent,
  PostGraduateStudent,
} = require("../models/user");

const fs = require("fs");
const path = require("path");

const { validationResult } = require("express-validator");
const { default: mongoose } = require("mongoose");

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

exports.signWithEmailAndPassword = async (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;
  const err = validationResult(req);
  try {
    if (!err.isEmpty()) {
      const error = new Error(err.array()[0]?.msg);
      error.statusCode = 422;
      error.data = err;
      throw error;
    }
    const user = await User.findOne({ email: email, password: password });
    if (!user) {
      const error = new Error("Email or password could not matched...");
      error.statusCode = 422;
      error.data = err;
      throw error;
    }
    res.status(200).json(user._doc);
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

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
    res.status(200).json({ message: "User updated successfully" });
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

exports.deleteAccount = async (req, res, next) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user || !mongoose.Types.ObjectId.isValid(req.params.id)) {
      const error = new Error(
        `User with  id: [${req.params.id}] not found or id might be incorrect`
      );
      error.statusCode = 422;
      throw error;
    }

    if (user.imageUrl) {
      const image = path.basename(user.imageUrl);
      clearFile(
        path.join(__dirname, "..", "images", "user_profile_pics/") + image
      );
    }

    res.status(200).json({ message: "user deleted" });
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
