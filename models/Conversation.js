const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const conversationSchema = new Schema({
  candidateId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  agentId: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Agent",
  },
});

module.exports = mongoose.model("Conversation", conversationSchema);
