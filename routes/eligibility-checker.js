const express = require("express");
const eligibilityCheckerController = require("../controllers/user/eligibility-checker");
const router = express.Router();

router.post("/checkEligibility", eligibilityCheckerController.checkEligibility);
module.exports = router;
