const router = require('express').Router();
const notification = require('../controllers/notification_ctrl.js');

// router.post('/otp', otpCtrl.sendOtp);
router.post('/notification', notification.sendNotification);

module.exports = router;