const Parcela = require('../models/parcela.model');
const Producto = require('../models/producto.model');
const MarketPrice = require('../models/marketPrice.model');

exports.getRecommendationsByUser = async (usuarioId, fechaSiembra = null) => {
  try {
    console.log('Iniciando recomendaciones para usuario:', usuarioId);
    
    // Verificar parcelas del usuario
    const parcelas = await Parcela.find({ usuario: usuarioId }).populate('ciudad');
    console.log('Parcelas encontradas:', parcelas.length);
    
    if (!parcelas.length) {
      throw new Error('No tienes parcelas registradas. Registra una parcela primero.');
    }

    // Verificar productos disponibles
    const productos = await Producto.find();
    console.log('Productos disponibles:', productos.length);
    
    if (!productos.length) {
      throw new Error('No hay productos disponibles en el sistema. Contacta al administrador para agregar productos.');
    }

    const recomendaciones = [];
    const fechaConsulta = fechaSiembra ? new Date(fechaSiembra) : new Date();

    for (const parcela of parcelas) {
      console.log(`Procesando parcela: ${parcela.nombre} - ${parcela.ciudad.nombre}`);
      
      const clima = parcela.datosClimaticos;
      const ciudadNombre = parcela.ciudad.nombre;
      const productosEvaluados = [];
      let productosConPrecios = 0;
      let productosSinPrecios = [];

      for (const producto of productos) {
        console.log(`Evaluando producto: ${producto.nombre}`);
        
        // Buscar precios históricos para este producto en esta ciudad
        const precios = await MarketPrice.find({
          producto: producto.nombre,
          ciudad: ciudadNombre,
          fecha: { $lte: fechaSiembra || new Date().toISOString().split('T')[0] }
        }).sort({ fecha: -1 }).limit(10);

        console.log(`Precios encontrados para ${producto.nombre}: ${precios.length}`);

        const valores = precios.map(p => p.precio);
        const promedio = valores.length ? valores.reduce((a,b) => a+b, 0) / valores.length : 0;
        const tendencia = valores.length > 1 ? (valores[0] - valores[valores.length-1]) : 0;

        if (valores.length === 0) {
          productosSinPrecios.push(producto.nombre);
        } else {
          productosConPrecios++;
        }

        // Calcular score de viabilidad
        let score = 0;
        let detalles = [];
        let alertas = [];

        // Verificar datos del producto
        if (!producto.humedad_optima || !producto.temperatura_optima) {
          alertas.push('Faltan datos óptimos del producto');
        }

        // Verificar datos climáticos
        if (!clima || !clima.humedad_relativa || !clima.temperatura) {
          alertas.push('Faltan datos climáticos de la parcela');
        }

        // Evaluación climática
        if (clima && producto.humedad_optima && producto.temperatura_optima && clima.humedad_relativa && clima.temperatura) {
          const difHumedad = Math.abs(clima.humedad_relativa - producto.humedad_optima);
          const difTemperatura = Math.abs(clima.temperatura - producto.temperatura_optima);
          
          if (difHumedad < 10) { 
            score += 3; 
            detalles.push(`Humedad favorable (${clima.humedad_relativa}% vs óptimo ${producto.humedad_optima}%)`); 
          } else if (difHumedad < 20) { 
            score += 1; 
            detalles.push(`Humedad aceptable (${clima.humedad_relativa}% vs óptimo ${producto.humedad_optima}%)`); 
          } else { 
            detalles.push(`Humedad no favorable (${clima.humedad_relativa}% vs óptimo ${producto.humedad_optima}%)`); 
          }

          if (difTemperatura < 3) { 
            score += 3; 
            detalles.push(`Temperatura favorable (${clima.temperatura}°C vs óptimo ${producto.temperatura_optima}°C)`); 
          } else if (difTemperatura < 5) { 
            score += 1; 
            detalles.push(`Temperatura aceptable (${clima.temperatura}°C vs óptimo ${producto.temperatura_optima}°C)`); 
          } else { 
            detalles.push(`Temperatura no favorable (${clima.temperatura}°C vs óptimo ${producto.temperatura_optima}°C)`); 
          }
        }

        // Evaluación de temporada
        if (producto.temporada) {
          const mesActual = fechaConsulta.getMonth() + 1;
          if (evaluarTemporada(producto.temporada, mesActual)) {
            score += 2;
            detalles.push('Temporada favorable para siembra');
          } else {
            detalles.push(`Fuera de temporada óptima (${producto.temporada})`);
          }
        }

        // Evaluación de precios
        if (promedio > 0) { 
          score += 2; 
          detalles.push(`Tiene historial de precios (promedio: $${Math.round(promedio)})`); 
        } else {
          alertas.push('No hay historial de precios para este producto en esta ciudad');
        }

        if (tendencia > 0) { 
          score += 1; 
          detalles.push(`Tendencia de precios al alza (+$${Math.round(tendencia)})`); 
        } else if (tendencia < 0) {
          detalles.push(`Tendencia de precios a la baja ($${Math.round(tendencia)})`);
        }

        // Calcular fecha estimada de cosecha
        const fechaCosecha = new Date(fechaConsulta);
        fechaCosecha.setDate(fechaCosecha.getDate() + (producto.tiempo_cosecha || 90));

        productosEvaluados.push({
          producto: producto.nombre,
          producto_id: producto._id,
          score,
          promedio_precio: Math.round(promedio),
          tendencia_precio: Math.round(tendencia),
          tiempo_cosecha: producto.tiempo_cosecha || 'No especificado',
          fecha_estimada_cosecha: fechaCosecha.toISOString().split('T')[0],
          temporada: producto.temporada || 'No especificada',
          caracteristicas: producto.caracteristicas,
          observaciones: producto.observaciones,
          detalles_evaluacion: detalles,
          alertas: alertas,
          datos_climaticos: {
            temperatura_actual: clima?.temperatura || 'No disponible',
            humedad_actual: clima?.humedad_relativa || 'No disponible',
            temperatura_optima: producto.temperatura_optima || 'No especificada',
            humedad_optima: producto.humedad_optima || 'No especificada'
          }
        });
      }

      // Ordenar por score y tomar los mejores 3
      const mejores = productosEvaluados
        .sort((a, b) => b.score - a.score)
        .slice(0, 3);

      // Agregar información de ranking a los mejores
      mejores.forEach((producto, index) => {
        producto.posicion_ranking = index + 1;
      });

      // Información de estado
      const estadoInfo = {
        total_productos_evaluados: productosEvaluados.length,
        productos_con_precios: productosConPrecios,
        productos_sin_precios: productosSinPrecios.length,
        lista_sin_precios: productosSinPrecios,
        datos_climaticos_disponibles: !!(clima && clima.temperatura && clima.humedad_relativa),
        ultima_actualizacion_clima: clima?.ultima_actualizacion || 'No disponible'
      };

      recomendaciones.push({
        parcela: {
          id: parcela._id,
          nombre: parcela.nombre,
          ciudad: ciudadNombre,
          coordenadas: parcela.ciudad.coordenadas
        },
        mejores_opciones: mejores,
        todos_los_productos: productosEvaluados.sort((a, b) => b.score - a.score),
        estado_datos: estadoInfo,
        alertas_generales: [
          ...(productosSinPrecios.length > 0 ? [`Sin precios históricos para: ${productosSinPrecios.join(', ')}`] : []),
          ...(!clima ? ['Faltan datos climáticos para esta parcela'] : []),
          ...(productosConPrecios === 0 ? ['No hay precios históricos para ningún producto en esta ciudad'] : [])
        ]
      });
    }

    console.log('Recomendaciones generadas exitosamente');
    return recomendaciones;

  } catch (error) {
    console.error('Error en getRecommendationsByUser:', error);
    throw new Error(`Error al generar recomendaciones: ${error.message}`);
  }
};

// Función auxiliar para evaluar temporada
function evaluarTemporada(temporadaTexto, mes) {
  if (!temporadaTexto) return false;
  
  const meses = {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6,
    julio: 7, agosto: 8, septiembre: 9, octubre: 10, noviembre: 11, diciembre: 12
  };
  
  const temporada = temporadaTexto.toLowerCase();
  const partes = temporada.split('-');
  
  if (partes.length === 2) {
    const mesInicio = meses[partes[0].trim()];
    const mesFin = meses[partes[1].trim()];
    
    if (mesInicio && mesFin) {
      if (mesInicio <= mesFin) {
        return mes >= mesInicio && mes <= mesFin;
      } else {
        return mes >= mesInicio || mes <= mesFin;
      }
    }
  }
  
  return false;
}

exports.getRecommendationByParcela = async (parcelaId, usuarioId, fechaSiembra = null) => {
  try {
    console.log('Generando recomendación para parcela específica:', parcelaId);
    
    // Verificar que la parcela existe y pertenece al usuario
    const parcela = await Parcela.findOne({ _id: parcelaId, usuario: usuarioId }).populate('ciudad');
    if (!parcela) {
      throw new Error('Parcela no encontrada o no pertenece al usuario.');
    }

    // Obtener todas las recomendaciones y filtrar por la parcela específica
    const recomendaciones = await exports.getRecommendationsByUser(usuarioId, fechaSiembra);
    const recomendacionParcela = recomendaciones.find(r => r.parcela.id.toString() === parcelaId);
    
    if (!recomendacionParcela) {
      throw new Error('No se pudo generar recomendación para esta parcela.');
    }

    return recomendacionParcela;
  } catch (error) {
    console.error('Error en getRecommendationByParcela:', error);
    throw new Error(`Error al generar recomendación para la parcela: ${error.message}`);
  }
};
