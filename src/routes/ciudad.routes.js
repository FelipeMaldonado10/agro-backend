const express = require('express');
const router = express.Router();
const ciudadController = require('../controllers/ciudad.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rbac = require('../middlewares/rbac.middleware');

// Todas las rutas requieren autenticación
router.use(authMiddleware);

// Rutas que requieren rol de administrador
router.post('/', rbac('admin', 'superadmin'), ciudadController.crearCiudad);
router.put('/:id', rbac('admin', 'superadmin'), ciudadController.actualizarCiudad);
router.delete('/:id', rbac('admin', 'superadmin'), ciudadController.eliminarCiudad);

// Rutas accesibles para todos los usuarios autenticados
router.get('/', ciudadController.obtenerCiudades);
router.get('/:id', ciudadController.obtenerCiudad);

module.exports = router;