const express = require('express');
const router = express.Router();
const Producto = require('../models/producto.model');

// Endpoint temporal para crear productos de prueba
router.post('/seed', async (req, res) => {
  try {
    // Limpiar productos existentes
    await Producto.deleteMany({});
    console.log('Productos existentes eliminados');

    const productos = [
      {
        nombre: "Tomate",
        humedad_optima: 75,
        temperatura_optima: 25,
        temporada: "marzo-julio",
        tiempo_cosecha: 90,
        caracteristicas: {
          sensibilidad_lluvia: "Media",
          sensibilidad_temperatura: "Alta",
          sensibilidad_humedad: "Media",
          otros: "Requiere tutorado y podas regulares"
        },
        observaciones: "Cultivo de alta demanda en el mercado"
      },
      {
        nombre: "Maíz",
        humedad_optima: 60,
        temperatura_optima: 28,
        temporada: "marzo-agosto",
        tiempo_cosecha: 120,
        caracteristicas: {
          sensibilidad_lluvia: "Baja",
          sensibilidad_temperatura: "Media",
          sensibilidad_humedad: "Baja",
          otros: "Resistente a sequías moderadas"
        },
        observaciones: "Cultivo básico con buena rentabilidad"
      },
      {
        nombre: "Papa",
        humedad_optima: 80,
        temperatura_optima: 18,
        temporada: "enero-abril",
        tiempo_cosecha: 100,
        caracteristicas: {
          sensibilidad_lluvia: "Alta",
          sensibilidad_temperatura: "Alta",
          sensibilidad_humedad: "Alta",
          otros: "Requiere clima fresco y húmedo"
        },
        observaciones: "Cultivo de alta demanda pero sensible"
      },
      {
        nombre: "Frijol",
        humedad_optima: 70,
        temperatura_optima: 22,
        temporada: "febrero-mayo",
        tiempo_cosecha: 75,
        caracteristicas: {
          sensibilidad_lluvia: "Media",
          sensibilidad_temperatura: "Media",
          sensibilidad_humedad: "Media",
          otros: "Mejora la fertilidad del suelo"
        },
        observaciones: "Excelente fuente de proteína"
      },
      {
        nombre: "Cebolla",
        humedad_optima: 65,
        temperatura_optima: 20,
        temporada: "abril-agosto",
        tiempo_cosecha: 110,
        caracteristicas: {
          sensibilidad_lluvia: "Media",
          sensibilidad_temperatura: "Baja",
          sensibilidad_humedad: "Media",
          otros: "Resistente a plagas"
        },
        observaciones: "Buena rentabilidad y larga conservación"
      },
      {
        nombre: "Zanahoria",
        humedad_optima: 70,
        temperatura_optima: 20,
        temporada: "marzo-junio",
        tiempo_cosecha: 85,
        caracteristicas: {
          sensibilidad_lluvia: "Media",
          sensibilidad_temperatura: "Media",
          sensibilidad_humedad: "Media",
          otros: "Requiere suelo suelto y profundo"
        },
        observaciones: "Cultivo con demanda constante"
      }
    ];

    // Insertar nuevos productos
    const productosCreados = await Producto.insertMany(productos);
    console.log(`${productosCreados.length} productos creados exitosamente`);

    res.json({
      success: true,
      message: `${productosCreados.length} productos creados exitosamente`,
      data: productosCreados
    });

  } catch (error) {
    console.error('Error en seed:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

module.exports = router;
