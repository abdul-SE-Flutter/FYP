const express = require("express");
const conversationController = require("../controllers/chat/Conversation");
const mesagesController = require("../controllers/chat/message");
const router = express.Router();

router.post("/add/conversation", conversationController.addConversation);
router.get(
  "/get/conversation/:userId",
  conversationController.getSingleConversation
);
router.get(
  "/get/conversation/:userId",
  conversationController.getSingleConversation
);
router.get("/conversations", conversationController.getConversations);
router.post("/send/message", mesagesController.sendMessage);
router.get("/get/messages/:conversationId", mesagesController.getMessages);

module.exports = router;
