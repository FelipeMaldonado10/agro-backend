
const express = require('express');
const router = express.Router();
const MarketPrice = require('../models/marketPrice.model');
const Producto = require('../models/producto.model');
const Parcela = require('../models/parcela.model');

/**
 * GET /api/recomendaciones?ciudad=Bogota&fecha=2025-08-20
 * Devuelve las 3 mejores opciones de cultivo según clima, producto y precios históricos
 */
router.get('/', async (req, res) => {
  const { ciudad, fecha } = req.query;
  if (!ciudad || !fecha) {
    return res.status(400).json({ error: 'Faltan parámetros: ciudad y fecha son requeridos.' });
  }
  try {
    // Obtener todos los productos
    const productos = await Producto.find();
    if (!productos.length) {
      return res.status(404).json({ error: 'No hay productos registrados.' });
    }

    // Buscar parcela para obtener datos climáticos
    const parcela = await Parcela.findOne({ ciudad });
    const clima = parcela ? parcela.datosClimaticos : null;

    // Evaluar cada producto
    const resultados = await Promise.all(productos.map(async (prod) => {
      // Buscar precios históricos
      const precios = await MarketPrice.find({
        producto: prod.nombre,
        ciudad,
        fecha: { $lte: fecha }
      }).sort({ fecha: 1 });
      const valores = precios.map(p => p.precio);
      const promedio = valores.length ? valores.reduce((a,b) => a+b, 0) / valores.length : 0;
      const tendencia = valores.length > 1 ? (valores[valores.length-1] - valores[0]) : 0;

      // Verificar datos faltantes
      let faltan = [];
      if (!clima) faltan.push('clima');
      if (!valores.length) faltan.push('precios');
      if (!prod.humedad_optima || !prod.temperatura_optima || !prod.tiempo_cosecha) faltan.push('características producto');

      // Evaluar viabilidad (simplificado)
      let score = 0;
      if (clima && prod.humedad_optima && prod.temperatura_optima) {
        // Ejemplo: sumar puntos si clima se acerca a óptimo
        if (clima.humedad_relativa && Math.abs(clima.humedad_relativa - prod.humedad_optima) < 10) score += 1;
        if (clima.temperatura && Math.abs(clima.temperatura - prod.temperatura_optima) < 3) score += 1;
      }
      if (promedio > 0) score += 1;
      if (tendencia > 0) score += 1;

      return {
        producto: prod.nombre,
        promedio,
        tendencia,
        clima,
        faltan,
        score,
        observaciones: prod.observaciones,
        tiempo_cosecha: prod.tiempo_cosecha,
        caracteristicas: prod.caracteristicas
      };
    }));

    // Ordenar por score y devolver las 3 mejores
    const mejores = resultados.sort((a, b) => b.score - a.score).slice(0, 3);
        res.json({ ciudad, fecha, mejores, todos: resultados });
      } catch (err) {
        res.status(500).json({ error: 'Error procesando datos', details: err.message });
      }
    });

    module.exports = router;
