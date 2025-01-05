const router = require("express").Router();
const userCtrl = require("../controllers/user_ctrl.js");
const auth = require("../middleware/auth.js");

router.post("/register", userCtrl.register);
router.post("/login", userCtrl.login);
router.get("/logout",auth, userCtrl.logout);
// router.get("/refresh_token",userCtrl.r);
router.get('/profile', auth, userCtrl.profile);

module.exports = router;
