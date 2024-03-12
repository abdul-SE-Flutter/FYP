const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const messageSchema = new Schema({
  conversationId: { type: Schema.Types.ObjectId, ref: "Conversation" },
  senderId: { type: Schema.Types.ObjectId, required: true },
  message: { type: String, required: true },
});

module.exports = mongoose.model("Message", messageSchema);
