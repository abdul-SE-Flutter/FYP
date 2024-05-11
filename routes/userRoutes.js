const express = require("express");
const userController = require("../controllers/user/user");
const isAuth = require("../jwt/isAuth");
const {getPopularProgramsByReviews , getLatestPrograms} = require("../controllers/utils/shared");
const router = express.Router();

const multerUploadPfp = require("../uploader/multerUploaderPfp");

router.get("/programs", userController.getPrograms);
router.get("/program/:programId", userController.getSingleProgram);
router.post("/hireExpert", isAuth, userController.hireExpert);
router.get("/get-experts", userController.getAppExpert);
router.get("/get-expert/:id", userController.getExpertById);

router.get("/popular-programs" , getPopularProgramsByReviews );
router.get("/latest-programs" , getLatestPrograms );

router.get("/get-notifications" , isAuth , userController.getNotificationByRegion);
router.get("/my-details" , isAuth , userController.getMyDetails);
router.patch("/update-profile-details" , isAuth , userController.updateMyDetails);
router.patch("/update-profile-pic", multerUploadPfp.single("image") ,  isAuth  , userController.updateProfilePic );



module.exports = router;
