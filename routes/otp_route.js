const router = require('express').Router();
const otpCtrl = require('../controllers/otp_ctrl.js');

router.post('/otp', otpCtrl.sendOtp);

module.exports = router;