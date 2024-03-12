const Agent = require("../models/agent");
const { validationResult } = require("express-validator");
const { User } = require("../models/user");

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

    res.status(200).json({
      message: "sigIn success : _id is attached",
      data: agent._id,
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
