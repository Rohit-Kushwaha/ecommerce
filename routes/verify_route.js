const router = require("express").Router();
const verifyCtrl = require("../controllers/verify_ctrl.js");
const auth = require("../middleware/auth.js");

router.post("/verify", verifyCtrl.verifyOtp);
router.get("/refresh_token", verifyCtrl.refreshToken);

module.exports = router;
