const path = require("path");
const fs = require("fs");
const { Program } = require("../../models/program");
const { User } = require("../../models/user");
const mongoose = require("mongoose");
const programIDValidator = require("./IdValidator");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");
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
      data: programs,
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.getSingleProgram = async (req, res, next) => {
  try {
    const programId = programIDValidator.validateID(req.params.programId);
    const program = await Program.findById(programId);
    // console.log({ ...program._doc });
    console.log(program);
    if (!program) {
      throw new Error(`program with id : ${programId} not found`);
    }
    res.status(200).json({ message: "program found", data: program });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
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

      this.clearFile(
        path.join(__dirname, "..", "..", "images", "user_profile_pics/") + image
      );
    }

    res.status(200).json({ message: "user deleted" });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.clearFile = (pathToFile) => {
  fs.unlink(pathToFile, (err) => {
    if (err) {
      console.log("failed to delete file");
    }
  });
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
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      "somesupersecretsecret",
      { expiresIn: "1h" }
    );
    res.status(200).json({
      user: user._doc,
      token: token,
      success: true,
      userId: user._id.toString(),
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
