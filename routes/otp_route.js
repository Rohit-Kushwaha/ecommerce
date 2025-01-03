const router = require('express').Router();
const otpCtrl = require('../controllers/otp_ctrl.js');

router.post('/otp', otpCtrl.sendOtp);
router.post('/verify', otpCtrl.verifyOtp);

module.exports = router;