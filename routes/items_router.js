const router = require('express').Router();

const auth = require('../middleware/auth.js');
const itemCtrl = require('../controllers/items_ctrl.js');

router.get('/items', itemCtrl.getItems);
router.post('/createItems', itemCtrl.createItems);

module.exports = router;