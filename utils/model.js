const mongoose = require('mongoose');
const userSchema = new mongoose.Schema({
  name: String,
  id: String,
  room: String,
});
const User = mongoose.model('User', userSchema);

const chatSchema = new mongoose.Schema({
  sId: { type: String },
  msg: { type: String, required: true },
  room: { type: Number, required: true },
  userId: { type: String, ref: 'User', required: true },
});
const Chat = mongoose.model('Chat', chatSchema);

module.exports = { User, Chat };
