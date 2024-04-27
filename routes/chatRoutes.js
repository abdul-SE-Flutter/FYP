
const express = require("express");
const  authMW  = require("../jwt/isAuth");
const { getChatBetweenTwo, sendMessage, getAllChats } = require("../controllers/chat");
const router = express.Router();

router.post("/message/send" , authMW ,sendMessage);
router.get("/:senderId/:receiverId" , authMW , getChatBetweenTwo);
router.get("/convos/all/:userId" , authMW  , getAllChats);


module.exports = router;
