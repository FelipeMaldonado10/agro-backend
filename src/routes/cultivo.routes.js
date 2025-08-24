const express = require('express');
const router = express.Router();
const cultivoController = require('../controllers/cultivo.controller');
const authMiddleware = require('../middlewares/auth.middleware');
const rbacMiddleware = require('../middlewares/rbac.middleware');

// Aplicar middleware de autenticación a todas las rutas
router.use(authMiddleware);

// Rutas para crear cultivos
router.post('/desde-recomendacion', 
  rbacMiddleware('productor', 'admin', 'superadmin'),
  cultivoController.crearCultivoDesdeRecomendacion
);

router.post('/manual',
  rbacMiddleware('productor', 'admin', 'superadmin'),
  cultivoController.crearCultivoManual
);

// Rutas para consultar cultivos
router.get('/mis-cultivos',
  rbacMiddleware('productor', 'admin', 'superadmin'),
  cultivoController.getCultivosUsuario
);

router.get('/parcela/:parcelaId',
  rbacMiddleware('productor', 'admin', 'superadmin'),
  cultivoController.getCultivosParcela
);

router.get('/parcela/:parcelaId/verificar-activos',
  rbacMiddleware('productor', 'admin', 'superadmin'),
  cultivoController.verificarCultivosActivos
);

router.get('/detalle/:cultivoId',
  rbacMiddleware('productor', 'admin', 'superadmin'),
  cultivoController.getCultivoDetalle
);

// Rutas para productos disponibles
router.get('/productos-disponibles',
  rbacMiddleware('productor', 'admin', 'superadmin'),
  cultivoController.getProductosDisponibles
);

// Rutas para actualizar cultivos
router.put('/:cultivoId/estado',
  rbacMiddleware('productor', 'admin', 'superadmin'),
  cultivoController.actualizarEstado
);

router.post('/:cultivoId/notas',
  rbacMiddleware('productor', 'admin', 'superadmin'),
  cultivoController.agregarNota
);

router.post('/:cultivoId/cosecha',
  rbacMiddleware('productor', 'admin', 'superadmin'),
  cultivoController.registrarCosecha
);

// Rutas para análisis
router.get('/:cultivoId/analisis',
  rbacMiddleware('productor', 'admin', 'superadmin'),
  cultivoController.getAnalisisComparativo
);

module.exports = router;
