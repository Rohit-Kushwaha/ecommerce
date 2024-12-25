const router = require('express').Router();
const productCtrl = require('../controllers/product_ctrl.js');
const auth = require('../middleware/auth.js');
const authAdmin = require('../middleware/auth_admin.js');

router.route('/products')
    .get(productCtrl.getProducts)
    .post(productCtrl.createProducts)

router.route('/products/:id')
    .put(productCtrl.updateProducts)
    .delete(productCtrl.deleteProducts)


module.exports = router;