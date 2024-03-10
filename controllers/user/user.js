const { getPrograms, getSingleProgram } = require("../utils/shared");
const id_validator = require("../../controllers/utils/IdValidator");
const Agent = require("../../models/agent");

exports.getPrograms = getPrograms;

exports.getSingleProgram = getSingleProgram;

exports.hireExpert = async (req, res, next) => {
  try {
    const id = id_validator.validateID(req.params.userId);
    const agent = await Agent.findOne();
    agent.candidates.push(id);
  } catch (err) {
    if (!err.satusCode) err.satusCode = 500;
    next(err);
  }
};
