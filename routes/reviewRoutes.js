const express = require("express");


const { giveReview } = require("../controllers/user/review.js");
const  authMW = require("../jwt/isAuth");


const router = express.Router();


router.post("/add" , authMW , giveReview );

module.exports = router;