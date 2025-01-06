const router = require("express").Router();
const {chatCtrl} = require("../controllers/chat_ctrl.js");

router.route("/userSearch").post(chatCtrl.userSearch);
router.route("/getMessage").post(chatCtrl.getMessage);
router.route("/chattedUser").post(chatCtrl.getChattedUser);

module.exports = router;