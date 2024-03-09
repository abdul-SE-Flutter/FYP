const express = require("express");
const userController = require("../controllers/user/user");
const router = express.Router();
router.get("/programs", userController.getPrograms);
router.get("/program/:programId", userController.getSingleProgram);
router.post("/hire/expert/:userId",userController.hireExpert);
module.exports = router;
