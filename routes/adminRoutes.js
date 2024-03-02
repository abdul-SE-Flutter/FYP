const express = require("express");
const { body } = require("express-validator");
const programController = require("../controllers/admin");
const adminController = require("../controllers/adminUserController");
const router = express.Router();

router.post("/program", programController.postProgrma);
router.delete("/program/:programId", programController.deleteProgram);
router.put("/program/:programId", programController.updateProgram);
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
