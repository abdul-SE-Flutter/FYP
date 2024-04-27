const Agent = require("../models/agent");
const { validationResult } = require("express-validator");
const { User } = require("../models/user");
const jwt = require("jsonwebtoken");

exports.signIn = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    const err = new Error("email or password is incorrect");
    if (!errors.isEmpty()) {
      err.statusCode = 422;
      throw err;
    }
    const agent = await Agent.findOne({
      email: req.body.email,
      password: req.body.password,
    });
    if (!agent) {
      err.statusCode = 404;
      throw err;
    }

    const token = jwt.sign(
      {
        email: agent.email,
        userId: agent._id.toString(),
      },
      "somesupersecretsecret",
      { expiresIn: "90d" }
    );
    res.status(200).json({
      user: agent._doc,
      token: token,
      success: true,
      userId: agent._id.toString(),
    });


  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.getCandidates = async (req, res, next) => {
  try {
    const agent = await Agent.findOne().populate("candidates");
    if (!agent.candidates.length != 0) {
      const err = new Error("Could not found any candidate");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({
      message: "Found candidates",
      data: {
        agent_id: agent._id,
        candidates: agent.candidates,
      },
    });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.signUpAgent = async (req, res, next) => {
  const {email , password} = req.body;

  const agent = new Agent({
    email,
    password
  });

  await agent.save();

  res.status(200).json({
    message: "signUp success : _id is attached",
    data: agent._id,
  });
}
