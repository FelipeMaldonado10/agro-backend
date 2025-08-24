const cultivoService = require('../services/cultivo.service');
const productoService = require('../services/producto.service');

// Crear cultivo desde recomendación
exports.crearCultivoDesdeRecomendacion = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const {
      parcelaId,
      productoId,
      cantidad_sembrada,
      area_sembrada,
      unidad_area,
      fecha_siembra,
      datos_recomendacion
    } = req.body;

    // Validaciones básicas
    if (!parcelaId || !productoId || !cantidad_sembrada || !area_sembrada) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: parcelaId, productoId, cantidad_sembrada, area_sembrada'
      });
    }

    if (cantidad_sembrada <= 0 || area_sembrada <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad sembrada y el área deben ser mayores a 0'
      });
    }

    const cultivo = await cultivoService.crearCultivoDesdeRecomendacion({
      usuarioId,
      parcelaId,
      productoId,
      cantidad_sembrada: Number(cantidad_sembrada),
      area_sembrada: Number(area_sembrada),
      unidad_area: unidad_area || 'm2',
      fecha_siembra: fecha_siembra ? new Date(fecha_siembra) : new Date(),
      datos_recomendacion
    });

    res.status(201).json({
      success: true,
      message: 'Cultivo creado exitosamente desde recomendación',
      data: cultivo
    });

  } catch (error) {
    console.error('Error en crearCultivoDesdeRecomendacion:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Crear cultivo manual
exports.crearCultivoManual = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const {
      parcelaId,
      productoId,
      cantidad_sembrada,
      area_sembrada,
      unidad_area,
      fecha_siembra
    } = req.body;

    // Validaciones básicas
    if (!parcelaId || !productoId || !cantidad_sembrada || !area_sembrada) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: parcelaId, productoId, cantidad_sembrada, area_sembrada'
      });
    }

    if (cantidad_sembrada <= 0 || area_sembrada <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad sembrada y el área deben ser mayores a 0'
      });
    }

    const cultivo = await cultivoService.crearCultivoManual({
      usuarioId,
      parcelaId,
      productoId,
      cantidad_sembrada: Number(cantidad_sembrada),
      area_sembrada: Number(area_sembrada),
      unidad_area: unidad_area || 'm2',
      fecha_siembra: fecha_siembra ? new Date(fecha_siembra) : new Date()
    });

    res.status(201).json({
      success: true,
      message: 'Cultivo creado exitosamente',
      data: cultivo
    });

  } catch (error) {
    console.error('Error en crearCultivoManual:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener todos los cultivos del usuario
exports.getCultivosUsuario = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { estado, parcelaId, activos } = req.query;

    const filtros = {};
    if (estado) filtros.estado = estado;
    if (parcelaId) filtros.parcelaId = parcelaId;
    if (activos === 'true') filtros.activos = true;

    const cultivos = await cultivoService.getCultivosByUsuario(usuarioId, filtros);

    res.json({
      success: true,
      message: 'Cultivos obtenidos exitosamente',
      data: cultivos,
      total: cultivos.length
    });

  } catch (error) {
    console.error('Error en getCultivosUsuario:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener cultivos de una parcela específica
exports.getCultivosParcela = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { parcelaId } = req.params;

    if (!parcelaId) {
      return res.status(400).json({
        success: false,
        message: 'ID de parcela requerido'
      });
    }

    const cultivos = await cultivoService.getCultivosByParcela(parcelaId, usuarioId);

    res.json({
      success: true,
      message: 'Cultivos de la parcela obtenidos exitosamente',
      data: cultivos,
      total: cultivos.length
    });

  } catch (error) {
    console.error('Error en getCultivosParcela:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener detalle de un cultivo específico
exports.getCultivoDetalle = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { cultivoId } = req.params;

    if (!cultivoId) {
      return res.status(400).json({
        success: false,
        message: 'ID de cultivo requerido'
      });
    }

    const cultivo = await cultivoService.getCultivoById(cultivoId, usuarioId);

    res.json({
      success: true,
      message: 'Detalle del cultivo obtenido exitosamente',
      data: cultivo
    });

  } catch (error) {
    console.error('Error en getCultivoDetalle:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Actualizar estado del cultivo
exports.actualizarEstado = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { cultivoId } = req.params;
    const { estado, motivo } = req.body;

    if (!cultivoId || !estado) {
      return res.status(400).json({
        success: false,
        message: 'ID de cultivo y nuevo estado requeridos'
      });
    }

    const estadosValidos = ['sembrado', 'en_crecimiento', 'listo_cosecha', 'cosechado', 'finalizado'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({
        success: false,
        message: `Estado no válido. Estados permitidos: ${estadosValidos.join(', ')}`
      });
    }

    const cultivo = await cultivoService.actualizarEstadoCultivo(
      cultivoId, 
      usuarioId, 
      estado, 
      motivo || ''
    );

    res.json({
      success: true,
      message: 'Estado del cultivo actualizado exitosamente',
      data: cultivo
    });

  } catch (error) {
    console.error('Error en actualizarEstado:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Agregar nota al cultivo
exports.agregarNota = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { cultivoId } = req.params;
    const { contenido, tipo } = req.body;

    if (!cultivoId || !contenido) {
      return res.status(400).json({
        success: false,
        message: 'ID de cultivo y contenido de la nota requeridos'
      });
    }

    const tiposValidos = ['observacion', 'tratamiento', 'riego', 'fertilizacion', 'alerta', 'otro'];
    const tipoNota = tipo && tiposValidos.includes(tipo) ? tipo : 'observacion';

    const cultivo = await cultivoService.agregarNota(
      cultivoId, 
      usuarioId, 
      contenido, 
      tipoNota
    );

    res.json({
      success: true,
      message: 'Nota agregada exitosamente',
      data: cultivo
    });

  } catch (error) {
    console.error('Error en agregarNota:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Registrar resultado de cosecha
exports.registrarCosecha = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { cultivoId } = req.params;
    const {
      cantidad_cosechada,
      unidad,
      precio_venta_real,
      costos_produccion,
      fecha_cosecha_real,
      observaciones
    } = req.body;

    if (!cultivoId || !cantidad_cosechada || !precio_venta_real) {
      return res.status(400).json({
        success: false,
        message: 'ID de cultivo, cantidad cosechada y precio de venta requeridos'
      });
    }

    if (cantidad_cosechada <= 0 || precio_venta_real <= 0) {
      return res.status(400).json({
        success: false,
        message: 'La cantidad cosechada y el precio deben ser mayores a 0'
      });
    }

    const datosReales = {
      cantidad_cosechada: Number(cantidad_cosechada),
      unidad: unidad || 'kg',
      precio_venta_real: Number(precio_venta_real),
      costos_produccion: Number(costos_produccion) || 0,
      fecha_cosecha_real: fecha_cosecha_real ? new Date(fecha_cosecha_real) : new Date(),
      observaciones: observaciones || ''
    };

    const cultivo = await cultivoService.registrarResultadoCosecha(
      cultivoId, 
      usuarioId, 
      datosReales
    );

    res.json({
      success: true,
      message: 'Resultado de cosecha registrado exitosamente',
      data: cultivo
    });

  } catch (error) {
    console.error('Error en registrarCosecha:', error);
    res.status(400).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener análisis comparativo (estimado vs real)
exports.getAnalisisComparativo = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { cultivoId } = req.params;

    if (!cultivoId) {
      return res.status(400).json({
        success: false,
        message: 'ID de cultivo requerido'
      });
    }

    const analisis = await cultivoService.getAnalisisComparativo(cultivoId, usuarioId);

    res.json({
      success: true,
      message: 'Análisis comparativo generado exitosamente',
      data: analisis
    });

  } catch (error) {
    console.error('Error en getAnalisisComparativo:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Obtener productos disponibles para cultivo manual
exports.getProductosDisponibles = async (req, res) => {
  try {
    console.log('Cultivo.controller.getProductosDisponibles: Iniciando búsqueda de productos...');
    const productos = await productoService.list();
    console.log('Cultivo.controller.getProductosDisponibles: Productos obtenidos:', productos.length);

    res.json({
      success: true,
      message: 'Productos disponibles obtenidos exitosamente',
      data: productos
    });

  } catch (error) {
    console.error('Error en getProductosDisponibles:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

// Verificar si una parcela tiene cultivos activos
exports.verificarCultivosActivos = async (req, res) => {
  try {
    const usuarioId = req.user.id;
    const { parcelaId } = req.params;

    if (!parcelaId) {
      return res.status(400).json({
        success: false,
        message: 'ID de parcela requerido'
      });
    }

    const cultivos = await cultivoService.getCultivosByParcela(parcelaId, usuarioId);
    const cultivosActivos = cultivos.filter(c => 
      ['sembrado', 'en_crecimiento', 'listo_cosecha'].includes(c.estado)
    );

    res.json({
      success: true,
      data: {
        tiene_cultivos_activos: cultivosActivos.length > 0,
        cultivos_activos: cultivosActivos,
        total_cultivos: cultivos.length,
        ultimo_cultivo: cultivos.length > 0 ? cultivos[0] : null
      }
    });

  } catch (error) {
    console.error('Error en verificarCultivosActivos:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

module.exports = exports;
