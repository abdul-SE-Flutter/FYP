const { getPrograms, getSingleProgram } = require("../utils/shared");
const id_validator = require("../../controllers/utils/IdValidator");
require("dotenv").config();
const {User} = require("../../models/user");
const ChatBox = require("../../models/Conversation");
const { Stripe } = require("stripe");
const { createConfirmedPaymentIntent } = require("../../services/stripe");
exports.getPrograms = getPrograms;

exports.getSingleProgram = getSingleProgram;

exports.hireExpert = async (req, res, next) => {
  try {
    const userId = req.userId;
    const {paymentMethodId , expertId} = req.body;
    const id = id_validator.validateID(userId);
      
    const user = await User.findById(userId);
    if(!user){
      return res.status(400).json({message : "No such user exists"});
    }


    if(!['CollegeStudent', 'UniversityStudent', 'PostGraduateStudent'].includes(user.role)){
      return res.status(400).
      json({message : "Only students can hire experts , not admin or agent(expert)"});
    }

    const expert = await User.findById(expertId);
    if(!expert){
      return res.status(400).json({message : "No such expert exists"});
    }

    const chatBox = await ChatBox.findOne({
        sender : userId,
        receiver : expertId
    });

    if(chatBox){
      return res.status(400).json({message : "You have already hired this expert"});
    }


    const resp = await createConfirmedPaymentIntent("1000" , userId , paymentMethodId);
    if(resp?.error){
      return res.status(400).json({message : resp.error.message});
    }

    if(resp.paymentIntent.status!=="succeeded"){
      return res.status(400).json({message : "Payment unsuccessfull"});
    }

    const newChatBox =  new ChatBox({
        sender : userId,
        receiver : expertId
    });

    await newChatBox.save();

    return res.status(201).json({message : "Expert hired! , you can now chat with this expert"});
    

  } catch (err) {
    if (!err.satusCode) err.satusCode = 500;
    next(err);
  }
};

exports.getAppExpert=async(req , res)=>{
  try {
        const experts = await User.find({role:"Agent"});
        return res.status(200).json({experts});
  } catch (error) {
    return res.status(500).json({message: error.message});
  }
}