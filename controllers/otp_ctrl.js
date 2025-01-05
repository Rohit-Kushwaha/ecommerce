const Users = require("../model/user_model.js");
const Otp = require("../model/otp_model");
const nodemailer = require("nodemailer");
const jwt = require("jsonwebtoken");

const otpCtrl = {
  sendOtp: async (req, res) => {
    try {
      const { email } = req.body;
      const userEmail = await Users.findOne({ email });

      if (!userEmail) return res.status(400).json({ msg: "User not found" });

      const otpUser = await Otp.findOne({ email });

      var otpSend = otpSent();

      if (otpUser) {
        // if exist just need to update
        await Otp.findOneAndUpdate({ email: otpUser.email }, { otp: otpSend });
      } else {
        // first time there is no email in otp collection so need to save email
        const otp = new Otp({ email: email, otp: otpSend });
        await otp.save();
      }

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

      res.json({
        msg: "Otp sent succesfully",
      });
      return true;
    } catch (error) {
      res.status(500).json({ msg: error.message });
    }
  },

  verifyOtp: async (req, res) => {
    try {
      const { email, otp } = req.body;
      const otpUser = await Otp.findOne({ email });
      const registerUser = await Users.findOne({ email });

      if (!otpUser) return res.status(400).json({ msg: "Email not found" });

      // Check OTP expiration
      const currentTime = new Date();
      const otpAge = (currentTime - otpUser.updatedAt) / 1000; // Age in seconds

      if (otpAge > 120) {
        return res.status(400).json({ msg: "OTP expired" });
      }

      if (otpUser.otp == otp) {
        // Create json web token to authenticate
        const accessToken = createAccessToken({
          id: registerUser._id,
          email: registerUser.email,
          name: registerUser.name,
        });
        const refreshToken = createRefreshToken({
          id: registerUser._id,
          email: registerUser.email,
          name: registerUser.name,
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          path: "/user/refresh_token",
        });

        const userVerified = await Users.findOneAndUpdate(
          { email: registerUser.email },
          { isVerified: true }
        );

        await userVerified.save();

        return res.json({ accessToken });
      }

      res.status(400).json({ msg: "Otp not correct" });
    } catch (error) {
      return res.status(500).json({ msg: error.message });
    }
  },

  refreshToken: (req, res) => {
    try {
      const rf_token = req.cookies.refreshToken; // Correct usage
      if (!rf_token) {
        return res.status(400).json({ msg: "Please login or Register" });
      }
      jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, data) => {
        if (err)
          return res.status(400).json({ msg: "Please login or Register" });
        const accessToken = createAccessToken({ id: user.id });
        res.json({ data, accessToken });
      });
    } catch (error) {
      return res.status(500).json({ msg: error.msg });
    }
  },
};

const createAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "1d" });
};
const createRefreshToken = (user) => {
  return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: "7d" });
};

function otpSent() {
  var otp = Math.floor(Math.random() * 9000 + 1000);
  return otp;
}

module.exports = otpCtrl;
