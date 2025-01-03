const router = require("express").Router();
const placeCtrl = require("../controllers/place_ctrl.js");
const auth = require("../middleware/auth.js");

router
  .route("/places")
  .get(auth, placeCtrl.getPlace)
  .post(placeCtrl.createPlace);

router
  .route("/products/:id")
  .put(placeCtrl.updateProducts)
  .delete(placeCtrl.deleteProducts);

module.exports = router;
