const router = require("express").Router();

const auth = require("../middleware/auth.js");
const itemCtrl = require("../controllers/items_ctrl.js");

router.route("/items").get(auth, itemCtrl.getItems).post(itemCtrl.createItems);
router.route("/testItems").get(itemCtrl.getTestItems);

module.exports = router;
