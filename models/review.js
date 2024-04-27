const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
    rating : {type: Number , required: true} ,
    description : {type: String , required: true}  ,
    creator : {type: mongoose.Types.ObjectId , ref: "User" , required: true} ,
    program : {type: mongoose.Types.ObjectId , required: true , ref :"Program"}
} ,{
  timestamps:true
});

module.exports = mongoose.model("review" , reviewSchema);