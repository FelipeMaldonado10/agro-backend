

const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// GET y POST /api/recomendaciones - Obtener recomendaciones para todas las parcelas del usuario o una específica
router.get('/', authMiddleware, recommendationController.getRecommendations);
router.post('/', authMiddleware, recommendationController.getRecommendations);

// GET /api/recomendaciones/parcela/:parcelaId - Obtener recomendación para una parcela específica (legacy)
router.get('/parcela/:parcelaId', authMiddleware, recommendationController.getRecommendationByParcela);

module.exports = router;
