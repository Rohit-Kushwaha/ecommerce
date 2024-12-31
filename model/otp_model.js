const mongoose = require("mongoose");

const otpSchema = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 60,
    }, // Auto-delete after 1 minute
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("UserOtp", otpSchema);
