const Cultivo = require('../models/cultivo.model');
const Parcela = require('../models/parcela.model');
const Producto = require('../models/producto.model');
const MarketPrice = require('../models/marketPrice.model');

// Crear un nuevo cultivo desde recomendación
exports.crearCultivoDesdeRecomendacion = async (datosReq) => {
  try {
    const {
      usuarioId,
      parcelaId,
      productoId,
      cantidad_sembrada,
      area_sembrada,
      unidad_area = 'm2',
      fecha_siembra,
      datos_recomendacion
    } = datosReq;

    console.log('Datos recibidos en servicio:', {
      usuarioId,
      parcelaId,
      productoId,
      cantidad_sembrada,
      area_sembrada
    });

    // Validar que la parcela existe y pertenece al usuario
    console.log('Buscando parcela con ID:', parcelaId, 'para usuario:', usuarioId);
    
    const parcela = await Parcela.findOne({ 
      _id: parcelaId, 
      usuario: usuarioId 
    }).populate('ciudad');
    
    console.log('Parcela encontrada:', parcela ? 'Sí' : 'No');
    
    if (!parcela) {
      // Buscar la parcela sin filtro de usuario para verificar si existe
      const parcelaExiste = await Parcela.findById(parcelaId);
      if (!parcelaExiste) {
        throw new Error('Parcela no encontrada');
      } else {
        console.log('Parcela existe pero pertenece a usuario:', parcelaExiste.usuario);
        throw new Error('Parcela no pertenece al usuario');
      }
    }

    // Validar que el producto existe
    const producto = await Producto.findById(productoId);
    if (!producto) {
      throw new Error('Producto no encontrado');
    }

  // Se permite crear múltiples cultivos activos en la misma parcela

    // Calcular estimaciones
    const estimaciones = await calcularEstimaciones(
      producto,
      parcela.ciudad.nombre,
      cantidad_sembrada,
      area_sembrada,
      unidad_area,
      fecha_siembra
    );

    // Obtener condiciones climáticas actuales
    const condiciones_siembra = {
      temperatura: parcela.datosClimaticos?.temperatura || null,
      humedad: parcela.datosClimaticos?.humedad_relativa || null,
      precipitacion: parcela.datosClimaticos?.precipitacion || null,
      velocidad_viento: parcela.datosClimaticos?.velocidad_viento_180m || null,
      fecha_registro: new Date()
    };

    // Crear el cultivo
    const nuevoCultivo = new Cultivo({
      parcela: parcelaId,
      usuario: usuarioId,
      producto: productoId,
      cantidad_sembrada,
      area_sembrada,
      unidad_area,
      fecha_siembra: fecha_siembra || new Date(),
      estimacion_produccion: estimaciones,
      origen: 'recomendacion',
      datos_recomendacion,
      condiciones_siembra,
      estado: 'sembrado'
    });

    const cultivoGuardado = await nuevoCultivo.save();
    
    // Populate para devolver datos completos
    const cultivoCompleto = await Cultivo.findById(cultivoGuardado._id)
      .populate('parcela')
      .populate('producto')
      .populate('usuario', 'nombre email');

    return cultivoCompleto;

  } catch (error) {
    console.error('Error en crearCultivoDesdeRecomendacion:', error);
    throw new Error(`Error al crear cultivo: ${error.message}`);
  }
};

// Crear cultivo manual (selección libre de producto)
exports.crearCultivoManual = async (datosReq) => {
  try {
    const {
      usuarioId,
      parcelaId,
      productoId,
      cantidad_sembrada,
      area_sembrada,
      unidad_area = 'm2',
      fecha_siembra
    } = datosReq;

    // Validaciones similares
    const parcela = await Parcela.findOne({ 
      _id: parcelaId, 
      usuario: usuarioId 
    }).populate('ciudad');
    
    if (!parcela) {
      throw new Error('Parcela no encontrada o no pertenece al usuario');
    }

    const producto = await Producto.findById(productoId);
    if (!producto) {
      throw new Error('Producto no encontrado');
    }

  // Se permite crear múltiples cultivos activos en la misma parcela

    // Calcular estimaciones
    const estimaciones = await calcularEstimaciones(
      producto,
      parcela.ciudad.nombre,
      cantidad_sembrada,
      area_sembrada,
      unidad_area,
      fecha_siembra
    );

    // Condiciones climáticas
    const condiciones_siembra = {
      temperatura: parcela.datosClimaticos?.temperatura || null,
      humedad: parcela.datosClimaticos?.humedad_relativa || null,
      precipitacion: parcela.datosClimaticos?.precipitacion || null,
      velocidad_viento: parcela.datosClimaticos?.velocidad_viento_180m || null,
      fecha_registro: new Date()
    };

    const nuevoCultivo = new Cultivo({
      parcela: parcelaId,
      usuario: usuarioId,
      producto: productoId,
      cantidad_sembrada,
      area_sembrada,
      unidad_area,
      fecha_siembra: fecha_siembra || new Date(),
      estimacion_produccion: estimaciones,
      origen: 'seleccion_manual',
      condiciones_siembra,
      estado: 'sembrado'
    });

    const cultivoGuardado = await nuevoCultivo.save();
    
    const cultivoCompleto = await Cultivo.findById(cultivoGuardado._id)
      .populate('parcela')
      .populate('producto')
      .populate('usuario', 'nombre email');

    return cultivoCompleto;

  } catch (error) {
    console.error('Error en crearCultivoManual:', error);
    throw new Error(`Error al crear cultivo manual: ${error.message}`);
  }
};

// Obtener cultivos por usuario
exports.getCultivosByUsuario = async (usuarioId, filtros = {}) => {
  try {
    const query = { usuario: usuarioId };
    
    // Aplicar filtros opcionales
    if (filtros.estado) {
      query.estado = filtros.estado;
    }
    if (filtros.parcelaId) {
      query.parcela = filtros.parcelaId;
    }
    if (filtros.activos) {
      query.estado = { $in: ['sembrado', 'en_crecimiento', 'listo_cosecha'] };
    }

    const cultivos = await Cultivo.find(query)
      .populate('parcela', 'nombre ciudad')
      .populate('producto', 'nombre caracteristicas tiempo_cosecha')
      .populate({
        path: 'parcela',
        populate: {
          path: 'ciudad',
          model: 'Ciudad'
        }
      })
      .sort({ fecha_siembra: -1 });

    return cultivos;

  } catch (error) {
    console.error('Error en getCultivosByUsuario:', error);
    throw new Error(`Error al obtener cultivos: ${error.message}`);
  }
};

// Obtener cultivos por parcela
exports.getCultivosByParcela = async (parcelaId, usuarioId) => {
  try {
    const cultivos = await Cultivo.find({ 
      parcela: parcelaId, 
      usuario: usuarioId 
    })
      .populate('producto', 'nombre caracteristicas tiempo_cosecha')
      .sort({ fecha_siembra: -1 });

    return cultivos;

  } catch (error) {
    console.error('Error en getCultivosByParcela:', error);
    throw new Error(`Error al obtener cultivos de la parcela: ${error.message}`);
  }
};

// Obtener detalle de un cultivo específico
exports.getCultivoById = async (cultivoId, usuarioId) => {
  try {
    const cultivo = await Cultivo.findOne({ 
      _id: cultivoId, 
      usuario: usuarioId 
    })
      .populate('parcela')
      .populate('producto')
      .populate({
        path: 'parcela',
        populate: {
          path: 'ciudad',
          model: 'Ciudad'
        }
      });

    if (!cultivo) {
      throw new Error('Cultivo no encontrado o no pertenece al usuario');
    }

    return cultivo;

  } catch (error) {
    console.error('Error en getCultivoById:', error);
    throw new Error(`Error al obtener detalle del cultivo: ${error.message}`);
  }
};

// Actualizar estado del cultivo
exports.actualizarEstadoCultivo = async (cultivoId, usuarioId, nuevoEstado, motivo = '') => {
  try {
    const cultivo = await Cultivo.findOne({ 
      _id: cultivoId, 
      usuario: usuarioId 
    });

    if (!cultivo) {
      throw new Error('Cultivo no encontrado o no pertenece al usuario');
    }

    const estadoAnterior = cultivo.estado;
    cultivo.estado = nuevoEstado;
    
    // Agregar al historial
    cultivo.historial_estados.push({
      estado_anterior: estadoAnterior,
      estado_nuevo: nuevoEstado,
      fecha_cambio: new Date(),
      motivo
    });

    await cultivo.save();

    return await this.getCultivoById(cultivoId, usuarioId);

  } catch (error) {
    console.error('Error en actualizarEstadoCultivo:', error);
    throw new Error(`Error al actualizar estado: ${error.message}`);
  }
};

// Agregar nota al cultivo
exports.agregarNota = async (cultivoId, usuarioId, contenido, tipo = 'observacion') => {
  try {
    const cultivo = await Cultivo.findOne({ 
      _id: cultivoId, 
      usuario: usuarioId 
    });

    if (!cultivo) {
      throw new Error('Cultivo no encontrado o no pertenece al usuario');
    }

    cultivo.notas.push({
      contenido,
      tipo,
      fecha: new Date()
    });

    await cultivo.save();

    return await this.getCultivoById(cultivoId, usuarioId);

  } catch (error) {
    console.error('Error en agregarNota:', error);
    throw new Error(`Error al agregar nota: ${error.message}`);
  }
};

// Registrar resultado real de cosecha
exports.registrarResultadoCosecha = async (cultivoId, usuarioId, datosReales) => {
  try {
    const {
      cantidad_cosechada,
      unidad,
      precio_venta_real,
      costos_produccion = 0,
      fecha_cosecha_real,
      observaciones = ''
    } = datosReales;

    const cultivo = await Cultivo.findOne({ 
      _id: cultivoId, 
      usuario: usuarioId 
    });

    if (!cultivo) {
      throw new Error('Cultivo no encontrado o no pertenece al usuario');
    }

    // Calcular valores derivados
    const ingresos_reales = cantidad_cosechada * precio_venta_real;
    const ganancia_neta = ingresos_reales - costos_produccion;
    const rendimiento_real = cantidad_cosechada / cultivo.area_sembrada;

    // Actualizar resultado real
    cultivo.resultado_real = {
      cantidad_cosechada,
      unidad,
      precio_venta_real,
      ingresos_reales,
      fecha_cosecha_real: fecha_cosecha_real || new Date(),
      costos_produccion,
      ganancia_neta,
      rendimiento_real,
      observaciones
    };

    // Cambiar estado a cosechado
    const estadoAnterior = cultivo.estado;
    cultivo.estado = 'cosechado';
    
    cultivo.historial_estados.push({
      estado_anterior: estadoAnterior,
      estado_nuevo: 'cosechado',
      fecha_cambio: new Date(),
      motivo: 'Cosecha registrada'
    });

    await cultivo.save();

    return await this.getCultivoById(cultivoId, usuarioId);

  } catch (error) {
    console.error('Error en registrarResultadoCosecha:', error);
    throw new Error(`Error al registrar cosecha: ${error.message}`);
  }
};

// Obtener análisis comparativo (estimado vs real)
exports.getAnalisisComparativo = async (cultivoId, usuarioId) => {
  try {
    const cultivo = await this.getCultivoById(cultivoId, usuarioId);

    if (!cultivo.resultado_real) {
      throw new Error('No hay datos reales de cosecha para comparar');
    }

    const estimado = cultivo.estimacion_produccion;
    const real = cultivo.resultado_real;

    const analisis = {
      cultivo_info: {
        id: cultivo._id,
        producto: cultivo.producto.nombre,
        parcela: cultivo.parcela.nombre,
        fecha_siembra: cultivo.fecha_siembra,
        fecha_cosecha_estimada: estimado.fecha_cosecha_estimada,
        fecha_cosecha_real: real.fecha_cosecha_real
      },
      comparacion_cantidad: {
        estimada: estimado.cantidad_estimada,
        real: real.cantidad_cosechada,
        diferencia: real.cantidad_cosechada - estimado.cantidad_estimada,
        porcentaje_variacion: estimado.cantidad_estimada > 0 
          ? ((real.cantidad_cosechada - estimado.cantidad_estimada) / estimado.cantidad_estimada) * 100 
          : 0
      },
      comparacion_ingresos: {
        estimados: estimado.ingresos_estimados,
        reales: real.ingresos_reales,
        diferencia: real.ingresos_reales - estimado.ingresos_estimados,
        porcentaje_variacion: estimado.ingresos_estimados > 0 
          ? ((real.ingresos_reales - estimado.ingresos_estimados) / estimado.ingresos_estimados) * 100 
          : 0
      },
      comparacion_rendimiento: {
        estimado: estimado.rendimiento_por_area,
        real: real.rendimiento_real,
        diferencia: real.rendimiento_real - estimado.rendimiento_por_area,
        porcentaje_variacion: estimado.rendimiento_por_area > 0 
          ? ((real.rendimiento_real - estimado.rendimiento_por_area) / estimado.rendimiento_por_area) * 100 
          : 0
      },
      ganancia_neta: real.ganancia_neta,
      costos_produccion: real.costos_produccion,
      observaciones: real.observaciones
    };

    return analisis;

  } catch (error) {
    console.error('Error en getAnalisisComparativo:', error);
    throw new Error(`Error al generar análisis: ${error.message}`);
  }
};


// Función auxiliar para calcular estimaciones con predicción de precio para la fecha de cosecha

async function calcularEstimaciones(producto, ciudadNombre, cantidadSembrada, areaSembrada, unidadArea, fechaSiembra) {
  try {
    // Mostrar datos de entrada
    console.log('[Estimaciones] Datos recibidos:', {
      producto: producto.nombre,
      ciudadNombre,
      cantidadSembrada,
      areaSembrada,
      unidadArea,
      fechaSiembra
    });

    // Calcular fecha de cosecha estimada
    const fechaCosechaEstimada = new Date(fechaSiembra || new Date());
    fechaCosechaEstimada.setDate(
      fechaCosechaEstimada.getDate() + (producto.tiempo_cosecha || 90)
    );
    const fechaCosechaISO = fechaCosechaEstimada.toISOString().split('T')[0];



    // Buscar precios históricos por producto y ciudad, si no hay, buscar solo por producto
    let precios = await MarketPrice.find({
      producto: producto._id,
      ciudad: ciudadNombre,
      fecha: { $lte: fechaCosechaISO }
    }).sort({ fecha: 1 });

    if (precios.length === 0) {
      console.warn(`[Estimaciones] No hay datos históricos para el producto '${producto.nombre}' en la ciudad '${ciudadNombre}'. Buscando datos globales del producto...`);
      precios = await MarketPrice.find({
        producto: producto._id,
        fecha: { $lte: fechaCosechaISO }
      }).sort({ fecha: 1 });
      if (precios.length === 0) {
        console.warn(`[Estimaciones] No hay datos históricos para el producto '${producto.nombre}' en ninguna ciudad hasta la fecha ${fechaCosechaISO}.`);
      } else {
        console.info(`[Estimaciones] Se usaron datos históricos globales del producto '${producto.nombre}' (todas las ciudades).`);
      }
    } else {
      console.info(`[Estimaciones] Se usaron datos históricos para el producto '${producto.nombre}' en la ciudad '${ciudadNombre}'.`);
    }
    console.log(`[Estimaciones] Precios históricos encontrados: ${precios.length}`);


    let precioEstimado = 0;
    let metodoPrecio = '';
    if (precios.length >= 2) {
      // Regresión lineal simple (Y = b0 + b1*X)
      const baseDate = new Date(precios[0].fecha);
      const xs = precios.map(p => (new Date(p.fecha) - baseDate) / (1000 * 60 * 60 * 24));
      const ys = precios.map(p => Number(p.precio));
      const xMean = xs.reduce((a, b) => a + b, 0) / xs.length;
      const yMean = ys.reduce((a, b) => a + b, 0) / ys.length;
      let num = 0, den = 0;
      for (let i = 0; i < xs.length; i++) {
        num += (xs[i] - xMean) * (ys[i] - yMean);
        den += (xs[i] - xMean) ** 2;
      }
      const beta1 = den !== 0 ? num / den : 0;
      const beta0 = yMean - beta1 * xMean;
      const diasHastaCosecha = (fechaCosechaEstimada - baseDate) / (1000 * 60 * 60 * 24);
      precioEstimado = beta0 + beta1 * diasHastaCosecha;
      metodoPrecio = `regresión lineal: Y = ${beta0.toFixed(2)} + ${beta1.toFixed(4)}*X, X=${diasHastaCosecha.toFixed(2)}`;
      // Solo usar el promedio si todos los precios son exactamente iguales
      if (ys.every(y => y === ys[0])) {
        precioEstimado = yMean;
        metodoPrecio = 'promedio (todos los precios iguales)';
      }
      // Si el precio proyectado es negativo, mostrarlo igualmente (puedes ajustar esto si lo prefieres)
      console.log(`[Estimaciones] Regresión lineal: β0=${beta0.toFixed(2)}, β1=${beta1.toFixed(4)}, X=${diasHastaCosecha.toFixed(2)} => Precio proyectado: ${precioEstimado}`);
    } else if (precios.length === 1) {
      precioEstimado = Number(precios[0].precio);
      metodoPrecio = 'único precio histórico';
    } else {
      precioEstimado = 0;
      metodoPrecio = 'sin datos';
    }
    console.log(`[Estimaciones] Precio estimado: ${precioEstimado} (método: ${metodoPrecio})`);

    // Calcular rendimiento estimado por área
    let rendimientoPorArea = 2; // kg por m2 por defecto
    if (unidadArea === 'hectarea') {
      rendimientoPorArea = 20000; // kg por hectárea por defecto
    }
    if (producto.rendimiento_estimado) {
      rendimientoPorArea = producto.rendimiento_estimado;
    }
    console.log(`[Estimaciones] Rendimiento por área usado: ${rendimientoPorArea}`);

    // Calcular cantidad estimada basada en el área
    const cantidadEstimada = areaSembrada * rendimientoPorArea;
    // Calcular ingresos estimados
    const ingresosEstimados = cantidadEstimada * precioEstimado;

    console.log('[Estimaciones] Resultado:', {
      cantidadEstimada,
      precioEstimado,
      ingresosEstimados,
      fechaCosechaEstimada,
      rendimientoPorArea
    });

    return {
      cantidad_estimada: Math.round(cantidadEstimada * 100) / 100,
      unidad: 'kg',
      precio_estimado_por_unidad: Math.round(precioEstimado * 100) / 100,
      ingresos_estimados: Math.round(ingresosEstimados * 100) / 100,
      fecha_cosecha_estimada: fechaCosechaEstimada,
      rendimiento_por_area: rendimientoPorArea
    };
  } catch (error) {
    console.error('Error en calcularEstimaciones:', error);
    // Devolver estimaciones básicas en caso de error
    return {
      cantidad_estimada: 0,
      unidad: 'kg',
      precio_estimado_por_unidad: 0,
      ingresos_estimados: 0,
      fecha_cosecha_estimada: new Date(),
      rendimiento_por_area: 0
    };
  }
}

// Exportar la función para uso externo
exports.calcularEstimaciones = calcularEstimaciones;

module.exports = exports;
