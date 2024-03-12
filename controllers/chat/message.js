const Message = require("../../models/message");
const { validateID } = require("../utils/IdValidator");
exports.sendMessage = async (req, res, next) => {
  try {
    const { message, senderId, conversationId } = req.body;
    if (message && senderId && conversationId) {
      const newMessage = new Message({
        conversationId: conversationId,
        senderId: senderId,
        message: message,
      });
      await newMessage.save();
      res.status(200).json({ message: "Message posted to DB" });
      require("../../socket").getIO().emit("newMessage", {
        message: "Some message received",
        data: message,
      });
    } else {
      res.status(409).json({
        message: "All feilds {message, senderId, conversationId} are required",
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getMessages = async (req, res, next) => {
  try {
    const id = validateID(req.params.conversationId);
    const messages = await Message.find({ conversationId: id });
    if (!messages) {
      const err = new Error("Could not find conversation");
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({ message_count: messages.length, data: messages });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};
