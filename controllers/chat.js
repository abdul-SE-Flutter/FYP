
const message_model = require("../models/message.js");
const chatBox_model = require("../models/Conversation.js");
const {User : user_model} = require("../models/user.js");
const { validationResult } = require("express-validator");

const sendMessage = async (req, res, next) => {
  const { senderId, receiverId, text } = req.body;

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({message : errors.array()[0].msg});
  }

  if (req.extractedUserId !== senderId) {
    return res.status(403).json({message : "Unauthorized user access"});
  }

  try {
    

  let user;
           user = await user_model.findById(req.extractedUserId);

  
  if(!user)
  {
   return res.status(400).json({message: "No such user exists" });
  }

  let receiver;
           receiver = await user_model.findById(receiverId);

  
  if(!receiver)
  {
      const error = new Error("Receiver does not exists");
      error.code = 403;
      return next(error);
  }


    let message;
    // Create a new message
    message = new message_model({
      sender: senderId,
      receiver: receiverId,
      text: text,
    });

    // Save the message to the database
    await message.save();


let chatBoxExists;
  chatBoxExists = await chatBox_model.findOne({
    $or: [
      { $and: [{ sender: senderId }, { receiver: receiverId }] },
      { $and: [{ sender: receiverId }, { receiver: senderId }] },
    ],
  });


if (!chatBoxExists) {
  chatBoxExists = new chatBox_model({
    sender: senderId,
    receiver: receiverId,
    latest_message : text
  });
}

else
{
  chatBoxExists.latest_message = text;
} 

  await chatBoxExists.save();

  

  res.status(201).json({ message: "Message sent successfully" , chatBoxId : chatBoxExists._id });


} catch (error) {
    return res.status(500).json({message : error.message});
  }

};

const getChatBetweenTwo = async (req, res, next) => {
  const userId = req.extractedUserId;
  const { senderId, receiverId } = req.params;

  if(userId!==senderId)
  {
   return res.status(403).josn({ message: "Unauthorized user access" })
  }

  try{

    const user = await user_model.findById(userId);
    const receiver = await user_model.findById(receiverId);
    if(!user){
        return res.status(400).json({message : "No such user exists"});
    }

    if(!receiver){
        return res.status(400).json({message : "No such receiver exists"});
    }

  let messages;
    messages = await message_model
      .find({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],  
        isDeletedFor : {$nin : [senderId]}
      })
      .sort("createdAt");

  res.status(200).json({ messages : messages.map((message)=> message.toObject({getters: true})) });
    }
  catch(err){
    return res.status(500).json({message: err.message});
  }

};

const getAllChats = async (req, res, next) => {
  const { userId } = req.params;

  try {
    
  let user;

  if (userId !== req.extractedUserId) {
   return res.status(403).json({message : "Unauthorized user access"})
  }
  
        user = await user_model.findById(userId);

  if(!user)
  {
    return res.status(400).json({message: "No such user exists"});
  }

  let chatList;
  try {
    chatList = await chatBox_model.find({
      //
      //
      $or: [{ sender: userId }, { receiver: userId }],
    }).populate({path :"sender" , select :"username profile_pic"}).
    populate({path :"receiver" , select :"username profile_pic"}).sort({updatedAt : -1});
  } catch (err) {
     return res.status(500).json({message: err.message});
  }
      
  res.status(200).json({ chatList: chatList.map((list)=>list.toObject({getters:true})) });

} catch (error) {
  return res.status(500).json({message: error.message});    
}

};


module.exports = {
  sendMessage,
  getChatBetweenTwo,
  getAllChats,
};