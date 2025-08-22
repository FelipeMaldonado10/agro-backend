const express = require('express');
const router = express.Router();
const productoController = require('../controllers/producto.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rbac = require('../middlewares/rbac.middleware');

// Solo superadmin puede gestionar productos
router.use(authMiddleware, rbac('superadmin'));

router.post('/', productoController.crearProducto);
router.get('/', productoController.listarProductos);
router.get('/:id', productoController.obtenerProducto);
router.put('/:id', productoController.editarProducto);
router.delete('/:id', productoController.eliminarProducto);

module.exports = router;
