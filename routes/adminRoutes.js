const express = require("express");
const { body } = require("express-validator");
const programController = require("../controllers/admin");
const adminController = require("../controllers/adminUserController");
const router = express.Router();
const multer = require("multer");
const storage = require("../multer/useMulter").getStorage("images/posts");
function fileFilter(req, file, cb) {
  if (
    file.mimetype === "image/png" ||
    file.mimetype === "image/jpg" ||
    file.mimetype === "image/jpeg"
  ) {
    cb(null, true);
  } else {
    cb(null, false);
  }
}
router.post(
  "/program",
  multer({ storage: storage, fileFilter: fileFilter }).single("programImg"),
  programController.postProgram
);
router.delete("/program/:programId", programController.deleteProgram);
router.put(
  "/program/:programId",
  multer({ storage: storage, fileFilter: fileFilter }).single("programImg"),
  programController.updateProgram
);
router.get("/program/:programId", programController.getSingleProgram);
router.get("/programs", programController.getPrograms);

// Admins prevelage over users can delete users can see users
router.get("/getUsers", adminController.getUsers);
router.delete("/user/:id", adminController.removeUser);

module.exports = router;

// [
//     body("targetedRegions")
//       .isArray()
//       .withMessage(
//         "Targeted Regions must be an array of strings containing regions"
//       ),
//     body("maxAge").isNumeric().withMessage("Max age must be a number"),
//     body("lastDateToApply")
//       .isDate()
//       .withMessage("Last Date to apply must be type of Date"),
//   ],
