const express = require("express");
const userController = require("../controllers/user/user");
const isAuth = require("../jwt/isAuth");
const {getPopularProgramsByReviews , getLatestPrograms} = require("../controllers/utils/shared");
const router = express.Router();

router.get("/programs", userController.getPrograms);
router.get("/program/:programId", userController.getSingleProgram);
router.post("/hireExpert", isAuth, userController.hireExpert);
router.get("/get-experts", userController.getAppExpert);

router.get("/popular-programs" , getPopularProgramsByReviews );
router.get("/latest-programs" , getLatestPrograms );



module.exports = router;
