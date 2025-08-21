const express = require('express');
const router = express.Router();
const parcelaController = require('../controllers/parcela.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rbac = require('../middlewares/rbac.middleware');

// Todas las rutas requieren autenticación y rol de productor
router.use(authMiddleware, rbac('productor', 'admin', 'superadmin'));

// Crear una nueva parcela
router.post('/', parcelaController.crearParcela);

// Obtener todas las parcelas del usuario
router.get('/', parcelaController.obtenerParcelas);

// Obtener una parcela específica
router.get('/:id', parcelaController.obtenerParcela);

// Actualizar datos climáticos de una parcela
router.put('/:id/clima', parcelaController.actualizarDatosClimaticos);

// Actualizar información de una parcela
router.put('/:id', parcelaController.actualizarParcela);

// Eliminar una parcela
router.delete('/:id', parcelaController.eliminarParcela);

module.exports = router;