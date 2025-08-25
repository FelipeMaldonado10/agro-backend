const mongoose = require('mongoose');

const MarketPriceSchema = new mongoose.Schema({
  producto: { type: mongoose.Schema.Types.ObjectId, ref: 'Producto', required: true },
  fecha: { type: String, required: true }, // YYYY-MM-DD
  precio: { type: Number, required: true }
});

module.exports = mongoose.model('MarketPrice', MarketPriceSchema);
module.exports = mongoose.model('MarketPrice', MarketPriceSchema);
