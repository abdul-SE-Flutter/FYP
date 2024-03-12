const express = require("express");
const { body } = require("express-validator");
const adminController = require("../controllers/admin/admin");
const adminUserController = require("../controllers/admin/adminUserController");
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
  adminController.postProgram
);
router.delete("/program/:programId", adminController.deleteProgram);

router.put(
  "/program/:programId",
  multer({ storage: storage, fileFilter: fileFilter }).single("programImg"),
  adminController.updateProgram
);
router.get("/program/:programId", adminController.getSingleProgram);
router.get("/programs", adminController.getPrograms);

// Admins prevelage over users can delete users can see users
router.get("/getUsers", adminUserController.getUsers);
router.delete("/user/:id", adminUserController.removeUser);

router.post(
  "/signin",
  [
    body("email")
      .isEmail()
      .trim()
      .escape()
      .withMessage("email not valid or inncorrect"),
  ],
  adminController.signWithEmailAndPassword
);
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
