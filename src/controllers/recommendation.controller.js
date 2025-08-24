const recommendationService = require('../services/recommendation.service');

// Obtener recomendaciones - Endpoint principal
exports.getRecommendations = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }

    // Obtener parámetros tanto de query como de body
    const parcela_id = req.body?.parcela_id || req.query?.parcela_id;
    const fecha_siembra = req.body?.fecha_siembra || req.query?.fecha_siembra;
    
    console.log('Solicitud de recomendaciones:', {
      userId,
      parcela_id,
      fecha_siembra,
      method: req.method
    });

    let recomendaciones;

    if (parcela_id) {
      // Recomendación para parcela específica
      recomendaciones = await recommendationService.getRecommendationByParcela(
        parcela_id, 
        userId, 
        fecha_siembra
      );
      
      if (!recomendaciones) {
        return res.status(404).json({ 
          error: 'No se encontraron recomendaciones para esta parcela.' 
        });
      }

      // Convertir a array para mantener consistencia
      recomendaciones = [recomendaciones];
    } else {
      // Recomendaciones para todas las parcelas del usuario
      recomendaciones = await recommendationService.getRecommendationsByUser(
        userId, 
        fecha_siembra
      );
    }

    if (!recomendaciones || recomendaciones.length === 0) {
      return res.status(404).json({ 
        error: 'No se encontraron recomendaciones. Verifica que tengas parcelas registradas.' 
      });
    }

    res.json({
      success: true,
      usuario_id: userId,
      fecha_siembra: fecha_siembra || 'Fecha actual',
      total_parcelas: recomendaciones.length,
      recomendaciones: recomendaciones,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error en getRecommendations:', error);
    res.status(500).json({ 
      error: error.message,
      timestamp: new Date().toISOString() 
    });
  }
};

// Obtener recomendación para una parcela específica (endpoint heredado)
exports.getRecommendationByParcela = async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({ error: 'Usuario no autenticado' });
    }
    
    const { parcelaId } = req.params;
    const fecha_siembra = req.query?.fecha_siembra || req.body?.fecha_siembra;
    
    console.log('Recomendación para parcela específica:', { parcelaId, userId, fecha_siembra });
    
    const result = await recommendationService.getRecommendationByParcela(parcelaId, userId, fecha_siembra);
    
    if (!result) {
      return res.status(404).json({ error: 'Parcela no encontrada' });
    }
    
    res.json({
      success: true,
      ...result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error en getRecommendationByParcela:', error);
    res.status(500).json({ error: error.message });
  }
};
