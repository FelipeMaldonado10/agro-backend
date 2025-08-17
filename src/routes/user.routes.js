const express = require('express');
const router = express.Router();
const userCtrl = require('../controllers/user.controller');
const auth = require('../middlewares/auth.middleware');
const rbac = require('../middlewares/rbac.middleware');

// Todas las rutas requieren autenticación y rol superadmin
router.use(auth, rbac('superadmin'));

router.get('/', userCtrl.getAll);
router.post('/', userCtrl.create);
router.put('/:id', userCtrl.update);
router.delete('/:id', userCtrl.remove);

module.exports = router;