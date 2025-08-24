const mongoose = require('mongoose');

const MarketPriceSchema = new mongoose.Schema({
  producto: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Producto', 
    required: true 
  },
  ciudad: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Ciudad', 
    required: true 
  },
  fecha: { type: String, required: true },
  precio: { type: Number, required: true }
});

module.exports = mongoose.model('MarketPrice', MarketPriceSchema);
