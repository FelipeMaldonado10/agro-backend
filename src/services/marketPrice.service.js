const MarketPrice = require('../models/marketPrice.model');

exports.create = async (data) => {
  return await MarketPrice.create(data);
};

exports.list = async () => {
  return await MarketPrice.find();
};

exports.getById = async (id) => {
  return await MarketPrice.findById(id);
};

exports.update = async (id, data) => {
  return await MarketPrice.findByIdAndUpdate(id, data, { new: true });
};


exports.remove = async (id) => {
  return await MarketPrice.findByIdAndDelete(id);
};

exports.bulkInsert = async (data) => {
  // Espera columnas: producto, fecha, precio, mercado, departamento, ciudad
  await MarketPrice.insertMany(data.map(r => ({
    producto: r.producto,
    fecha: r.fecha,
    precio: Number(r.precio),
    ciudad: r.ciudad,
    mercado: r.mercado,
    departamento: r.departamento
  })));
};
