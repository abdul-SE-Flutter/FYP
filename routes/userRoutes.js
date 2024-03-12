const express = require("express");
const userController = require("../controllers/user/user");
const router = express.Router();
router.get("/programs", userController.getPrograms);
router.get("/program/:programId", userController.getSingleProgram);
router.post("/hireExpert", userController.hireExpert);
module.exports = router;
