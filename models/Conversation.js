
const mongoose = require('mongoose');

const chatBoxSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  receiver: {
    type: mongoose.Types.ObjectId,
    ref: 'User',
    required: true,
  } ,

  latest_message : {type: String}
},{
  timestamps:true
});

module.exports= mongoose.model('Conversation', chatBoxSchema);
