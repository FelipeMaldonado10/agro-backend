const mongoose = require('mongoose');

const productoSchema = new mongoose.Schema({
  nombre: { type: String, required: true, unique: true },
  humedad_optima: { type: Number, required: true },
  temperatura_optima: { type: Number, required: true },
  temporada: { type: String, required: true }, // Ejemplo: "marzo-julio"
  tiempo_cosecha: { type: Number, required: true }, // días desde siembra hasta cosecha
  rendimiento_estimado: { type: Number, required: true }, // kg por m2
  caracteristicas: {
    sensibilidad_lluvia: { type: String },
    sensibilidad_temperatura: { type: String },
    sensibilidad_humedad: { type: String },
    otros: { type: String }
  },
  observaciones: { type: String }
});

module.exports = mongoose.model('Producto', productoSchema);
