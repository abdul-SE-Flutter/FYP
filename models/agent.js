const mongoose = require("mongoose");
const id_validator = require("../controllers/utils/IdValidator");
const Schema = mongoose.Schema;

const agentSchema = new Schema({
  email: {
    type: String,
    default: "agent@gmail.com",
  },
  password: { type: String, default: "123456" },
  candidates: { type: [mongoose.Types.ObjectId] },
});

agentSchema.methods.addCandidate = function (id) {
  try {
    id_validator.validateID(id);
    this.candidates.push(id);
  } catch (err) {
    console.log(err);
  }
};

agentSchema.methods.getOneCandidate = function (id) {
  const index = this.candidates.findIndex(id);
  if (!index) {
    return false;
  }
  return this.candidates[index];
};

module.exports = mongoose.model("Agent", agentSchema);
