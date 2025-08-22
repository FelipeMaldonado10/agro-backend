const mongoose = require('mongoose');

const ciudadSchema = new mongoose.Schema({
  nombre: { 
    type: String, 
    required: true,
    unique: true
  },
  coordenadas: {
    latitud: { type: Number, required: true },
    longitud: { type: Number, required: true }
  }
}, { timestamps: true });

module.exports = mongoose.model('Ciudad', ciudadSchema);