const Otp = require("../model/otp_model.js");
const Users = require("../model/user_model.js");
const jwt = require("jsonwebtoken");

const verifyCtrl = {
  verifyOtp: async (req, res) => {
    try {
      const { email, otp } = req.body;
      const user = await Otp.find({ email });
      const userN = await Users.findOne({ email });

      if (!user) return res.status(400).json({ msg: "User not found" });
      if (!otp) return res.status(400).json({ msg: "Otp not found" });
      // Check OTP expiration
      const currentTime = new Date();
      const otpAge = (currentTime - user[0].createdAt) / 1000; // Age in seconds
      if (otpAge > 60) {
        return res.status(400).json({ msg: "OTP expired" });
      }

      if (user[0].otp === otp) {
        // Create json web token to authenticate
        const accessToken = createAccessToken({
          id: userN._id,
          email: userN.email,
          name: userN.name,
        });
        const refreshToken = createRefreshToken({
          id: userN._id,
          email: userN.email,
          name: userN.name,
        });

        res.cookie("refreshToken", refreshToken, {
          httpOnly: true,
          path: "/user/refresh_token",
        });

        return res.json({ accessToken });
      }

      res.status(400).json({ msg: "Otp not verified" });
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

module.exports = verifyCtrl;
