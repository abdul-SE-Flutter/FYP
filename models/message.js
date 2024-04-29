
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  receiver: {
    type: mongoose.Types.ObjectId,
    ref: 'user',
    required: true,
  },
  text: {
    type: String,
  }
} , {
  timestamps:true
});

module.exports= mongoose.model('Message', messageSchema);
