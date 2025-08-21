const mongoose = require('mongoose');

const MarketPriceSchema = new mongoose.Schema({
  producto: { type: String, required: true },
  ciudad: { type: String, required: true },
  fecha: { type: String, required: true }, // YYYY-MM-DD
  precio: { type: Number, required: true }
});

module.exports = mongoose.model('MarketPrice', MarketPriceSchema);
