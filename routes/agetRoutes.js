const express = require("express");
const router = express.Router();
const agentController = require("../controllers/agent");
const { body } = require("express-validator");
router.post(
  "/signIn",
  body("email").isEmail().trim().escape(),
  agentController.signIn
);
router.get("/candidates", agentController.getCandidates);
module.exports = router;
