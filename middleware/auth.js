const jwt = require("jsonwebtoken");

const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) return res.status(400).json({ msg: "Invalid authentication" });
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, data) => {
      if (err) return res.status(400).json({ msg: "Invalid authentication" });
      

      req.decodeToken = data;
      // console.log(data);
      next();
    });
  } catch (error) {
    return res.status(500).json({ msg: error.msg });
  }
};

module.exports = auth;
