const mongoose = require("mongoose");
const id_validator = require("../controllers/utils/IdValidator");
const Schema = mongoose.Schema;

const agentSchema = new Schema({
  email: {
    type: String,
    default: "agent@gmail.com",
  },
  password: { type: String, default: "123456" },
  candidates: { type: [mongoose.Types.ObjectId], ref: "User" },
});

module.exports = mongoose.model("Agent", agentSchema);
