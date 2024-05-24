const express = require("express");


const { giveReview } = require("../controllers/user/review.js");
const  isAuth = require("../jwt/isAuth");


const router = express.Router();


router.post("/add" , isAuth , giveReview );

module.exports = router;