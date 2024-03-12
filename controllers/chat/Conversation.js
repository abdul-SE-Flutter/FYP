const Conversation = require("../../models/Conversation");
const { validateID } = require("../utils/IdValidator");
const Agent = require("../../models/agent");
const Message = require("../../models/message");
const mongoose = require("mongoose");

exports.addConversation = async (req, res, next) => {
  try {
    const id = validateID(req.body.userId);
    const conversation = await Conversation.findOne({ candidateId: id });
    if (!conversation) {
      const agentId = await Agent.findOne().select("_id").exec();
      const newConversation = new Conversation({
        candidateId: id,
        agentId: agentId,
      });
      await newConversation.save();
      res
        .status(200)
        .json({ message: "Conversation created", data: newConversation._id });
    } else {
      res.status(200).json({
        message: "Conversation already exists",
        data: conversation._id,
      });
    }
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.getSingleConversation = async (req, res, next) => {
  try {
    const id = validateID(req.params.userId);
    const conversation = await Conversation.findOne({ candidateId: id });
    const messages = await Message.find({ conversationId: conversation._id });
    if (!conversation) {
      const err = new Error(
        "could not find any conversation with specified id"
      );
      err.statusCode = 404;
      throw err;
    }
    res.status(200).json({ messages: "Retrieved all mesages", data: messages });
  } catch (err) {
    if (!err.statusCode) err.statusCode = 500;
    next(err);
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find()
      .select("candidateId agentId")
      .populate({
        path: "candidateId",
        select: "username email imageUrl",
      });
    res.status(200).json(conversations);
  } catch (err) {
    err.statusCode = 500;
    next(err);
  }
};
