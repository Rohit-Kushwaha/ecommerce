const Users = require("../model/user_model.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const userCtrl = {
  register: async (req, res) => {
    try {
      const { name, email, password, image } = req.body;
      const user = await Users.findOne({ email });
      if (user)
        return res.status(400).json({ msg: "The email already exists" });
      if (password.length < 6) {
        return res
          .status(400)
          .json({ msg: "Password is at least 6 chracters long" });
      }
      // Password Encryption
      const passwordHash = await bcrypt.hash(password, 10);

      const newUser = new Users({
        name,
        email,
        password: passwordHash,
        img: image,
      });
      // Save to mongoDB
      await newUser.save();
      res.status(201).json({ msg: "User created" });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: error.msg });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await Users.findOne({ email });
      if (!user) {
        return res.status(400).json({ msg: "User does not exist." });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ msg: "Incorrect password" });

      if (!user.isVerified) {
        const user = await Users.findOne({ email });
        return res.status(200).json({
          id: user._id,
          name: user.name,
          email: user.email,
          isVerified: user.isVerified,
        });
      }

      /// If login success create access token and refresh token
      // const accessToken = createAccessToken({ id: user._id });  req.user.id
      const accessToken = createAccessToken({
        id: user._id,
        email: user.email,
        name: user.name,
      });
      const refreshToken = createRefreshToken({
        id: user._id,
        email: user.email,
        name: user.name,
      });

      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        path: "/user/refresh_token",
      });
      res.json({ accessToken, id: user._id });
    } catch (error) {
      console.log(error);
      return res.status(500).json({ msg: error.msg });
    }
  },

  logout: async (req, res) => {
    try {
      res.clearCookie("refreshToken", { path: "/user/refresh_token" });
      return res.json({ msg: "Logged out" });
    } catch (error) {
      return res.status(500).json({ msg: error.msg });
    }
  },

  profile: async (req, res) => {
    try {
      const user = await Users.findById(req.decodeToken.id).select("-password");
      if (!user) return res.status(400).json({ msg: "User does not exist." });
      res.json(user);
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

module.exports = userCtrl;
