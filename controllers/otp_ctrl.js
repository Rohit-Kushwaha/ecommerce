const User = require("../model/user_model.js");
const Otp = require("../model/otp_model");
const nodemailer = require("nodemailer");

const otpCtrl = {
  sendOtp: async (req, res) => {
    try {
      const { email } = req.body;
      const userMail = await User.findOne({ email });

      if (!userMail) return res.status(400).json({ msg: "Email not found" });
      var otpSend = otpSent();
      // I need to check if email exist in otp collection then update otp
      // only else save email in otp collection

      // if (!userOtpMail) {
      //     // first time there is no email in otp collection so need to save email
      //     const otp = new Otp({
      //         email: userMail,
      //         otp: otpSend
      //     });
      //     await otp.save();
      // } else {
      //     // Update the existing OTP for the email
      //    await Otp.findOneAndUpdate({email:email},{otp:otpSend});

      // };

      const newOtp = await Otp.findOneAndUpdate(
        { email: email },
        { otp: otpSend },
        { upsert: true }
      );

      const transporter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false, // true for port 465, false for other ports
        auth: {
          user: "rohitkushwaha25982@gmail.com",
          pass: "jaxf etxe uyhx aupt",
        },
      });
      const info = await transporter.sendMail({
        from: "connectSphere@noreply.com", // sender address
        // to: `${email}`, // list of receivers
        to: "rohitkushwaha25982@gmail.com",
        subject: "Your Otp for login is this", // Subject line
        text: "From Connect Sphere", // plain text body
        html: `<b>${otpSend}</b>`, // html body
      });
      console.log("Message sent: %s", info.messageId);

      res.json({
        otp: "Otp sent succesfully",
      });

      return true;
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },
};

function otpSent() {
  var otp = Math.floor(Math.random() * 9000 + 1000);
  return otp;
}

module.exports = otpCtrl;
