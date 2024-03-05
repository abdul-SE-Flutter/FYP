const express = require("express");
const { check } = require("express-validator");

const { User } = require("../models/user");
const userController = require("../controllers/auth");
const router = express.Router();
const multer = require("multer");
const storage = require("../multer/useMulter").getStorage(
  "images/user_profile_pics"
);

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
  "/register",
  multer({ storage: storage, fileFilter: fileFilter }).single("user_image"),
  check("email", "Invalid Email address")
    .isEmail()
    .escape()
    .custom(async (value) => {
      const user = await User.findOne({ email: value });
      if (user) {
        throw new Error("Email already exists");
      }
      return value;
    }),

  userController.signup
);

router.post(
  "/login",
  [check("email").isEmail().escape().withMessage("Invalid Email address")],
  userController.signWithEmailAndPassword
);

router.put(
  "/update/:id",
  multer({ storage: storage, fileFilter: fileFilter }).single("user_image"),
  userController.updateUser
);

router.delete("/delete/:id", userController.deleteAccount);

module.exports = router;
