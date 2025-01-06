// models/message_model.js
const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    senderId: { type: String, required: true },
    receiverId: { type: String, required: true },
    message: { type: String, },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Message", messageSchema);
