const express = require("express");
const userController = require("../controllers/user/user");
const isAuth = require("../jwt/isAuth");
const router = express.Router();

router.get("/programs", userController.getPrograms);
router.get("/program/:programId", userController.getSingleProgram);
router.post("/hireExpert", isAuth, userController.hireExpert);
router.get("/get-experts", userController.getAppExpert);



module.exports = router;
