const router = require('express').Router();
const categoryCtrl = require('../controllers/category_ctrl.js');
const auth = require('../middleware/auth.js');
const authAdmin = require('../middleware/auth_admin.js');

router.get('/category', categoryCtrl.getCategory);
router.post('/category', auth, authAdmin, categoryCtrl.createCategory);
router.route('/category/:id').delete(
    auth, authAdmin, categoryCtrl.deleteCategory
);
router.route('/category/:id').put(
    auth, authAdmin, categoryCtrl.updateCategories
);

module.exports = router;
