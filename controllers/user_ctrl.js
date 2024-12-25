const Users = require('../model/user_model.js');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userCtrl = {
    register: async (req, res) => {
        try {
            const { name, email, password } = req.body;
            const user = await Users.findOne({ email });
            if (user) return res.status(400).json({ msg: "The email already exists" });
            if (password.length < 6) {
                return res.status(400).json({ msg: "Password is at least 6 chracters long" });
            }
            // Password Encryption
            const passwordHash = await bcrypt.hash(password, 10);

            const newUser = Users({
                name, email, password: passwordHash
            })
            // Save to mongoDB
            await newUser.save();
            // Create json web token to authenticate
            const accessToken = createAccessToken({ id: newUser._id });
            const refreshToken = createRefreshToken({ id: newUser._id });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token'
            });
            res.json({ accessToken });
            // res.json({ msg: "Register success!" });
        } catch (error) {
            return res.status(500).json({ msg: error.msg });
        }
    },

    refreshToken: (req, res) => {
        try {
            const rf_token = req.cookies.refreshToken; // Correct usage
            if (!rf_token) {
                return res.status(400).json({ msg: "Please login or Register" });
            }
            jwt.verify(rf_token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
                if (err) return res.status(400).json({ msg: "Please login or Register" });
                const accessToken = createAccessToken({ id: user.id });
                res.json({ user, accessToken });
            });
            // res.json({rf_token});

        } catch (error) {
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

            /// If login success create access token and refresh token
            const accessToken = createAccessToken({ id: user._id });
            const refreshToken = createRefreshToken({ id: user._id });

            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                path: '/user/refresh_token'
            });
            res.json({ accessToken });
            // res.json({msg: "Login Success"});
        } catch (error) {
            return res.status(500).json({ msg: error.msg });
        }
    },

    logout: async (req, res) => {
        try {
            res.clearCookie('refreshToken', { path: '/user/refresh_token' });
            return res.json({ msg: "Logged out" });
        } catch (error) {
            return res.status(500).json({ msg: error.msg });

        }
    },

    getUser:async (req, res)=> {
    try {
        const user = await Users.findById(req.user.id).select('-password');// user kyu aaya
        if(!user) return res.status(400).json({msg:"User does not exist."});
        res.json(user);
    }catch(error){
        return res.status(500).json({msg:error.msg});
    }
    }
}

const createAccessToken = (user) => {
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
}
const createRefreshToken = (user) => {
    return jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
}

module.exports = userCtrl;