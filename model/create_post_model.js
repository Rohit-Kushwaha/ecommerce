const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    user_id: {type: mongoose.Schema.ObjectId, ref:'User', required: true},
    image: { type: String, required: true },
    postTitle: { type: String, required: true },
    username: { type: String, required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Post", messageSchema);
