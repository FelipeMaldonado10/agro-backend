const express = require('express');
const router = express.Router();
const ciudadController = require('../controllers/ciudad.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rbac = require('../middlewares/rbac.middleware');

// Rutas públicas
router.get('/', ciudadController.obtenerCiudades);
router.get('/:id', ciudadController.obtenerCiudad);

// Rutas protegidas - Solo admin y superadmin pueden gestionar ciudades
router.use(authMiddleware);
router.post('/', rbac('admin', 'superadmin'), ciudadController.crearCiudad);
router.put('/:id', rbac('admin', 'superadmin'), ciudadController.actualizarCiudad);
router.delete('/:id', rbac('admin', 'superadmin'), ciudadController.eliminarCiudad);

module.exports = router;