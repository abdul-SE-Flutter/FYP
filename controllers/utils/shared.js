const path = require("path");
const fs = require("fs");
const { Program } = require("../../models/program");
const { User } = require("../../models/user");
const review_model = require("../../models/review");
const mongoose = require("mongoose");
const programIDValidator = require("./IdValidator");
const { validationResult } = require("express-validator");
const jwt = require("jsonwebtoken");

exports.getPrograms = async (req, res, next) => {
  try {
    const programs = await Program.find();

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
    
    console.log(program);
    if (!program) {
      throw new Error(`program with id : ${programId} not found`);
    }

    const reviews = await review_model.find({ program: programId }).populate([{path : "creator" , select : "id username imageUrl "} ]);
    res.status(200).json({ message: "program found", data: program , reviews   });
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
  const role = req.body.role;
  const err = validationResult(req);
  try {
    if (!err.isEmpty()) {
         return res.status(400).json({ message: err.array()[0].msg})
    }
    const user = await User.findOne({ email: email });
    if (!user) {
      return res.status(400).json({message : "No user exists with this email"});
    }

    if(user.password!==password){
      return res.status(400).json({message : "Incorrect password"});
    }
    const token = jwt.sign(
      {
        email: user.email,
        userId: user._id.toString(),
      },
      "somesupersecretsecret",
      { expiresIn: "90d" }
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
