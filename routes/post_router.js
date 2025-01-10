const router = require("express").Router();
const postCtrl = require("../controllers/post_ctrl.js");
const auth = require("../middleware/auth.js");

router.post( "/createPost", auth, postCtrl.createPost);
router.get( "/getPost", auth, postCtrl.getPost);

module.exports = router;
