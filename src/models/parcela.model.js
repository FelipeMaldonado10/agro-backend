const mongoose = require('mongoose');

const parcelaSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true 
  },
  ciudad: { 
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ciudad',
    required: true 
  },
  datosClimaticos: {
    temperatura: Number,
    humedad_relativa: Number,
    temperatura_aparente: Number,
    lluvia: Number,
    precipitacion: Number,
    temperatura_80m: Number,
    humedad_suelo_0_1cm: Number,
    humedad_suelo_1_3cm: Number,
    temperatura_suelo_0cm: Number,
    temperatura_suelo_6cm: Number,
    velocidad_viento_180m: Number,
    ultima_actualizacion: { type: Date, default: Date.now }
  },
  usuario: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true 
  },
  productos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Producto'
  }]
}, { timestamps: true });

module.exports = mongoose.model('Parcela', parcelaSchema);