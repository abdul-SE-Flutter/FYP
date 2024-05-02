const mongoose = require("mongoose");

const notiSchema = new mongoose.Schema({
    related_program : {type: mongoose.Types.ObjectId , ref: "Program" , required: true} ,
    regions : {type : [String ]} 
} ,{
  timestamps:true
});

module.exports = mongoose.model("Notification" , notiSchema);