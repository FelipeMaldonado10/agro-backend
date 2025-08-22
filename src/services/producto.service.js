const Producto = require('../models/producto.model');

exports.create = async (data) => {
  return await Producto.create(data);
};

exports.list = async () => {
  return await Producto.find();
};

exports.update = async (id, data) => {
  return await Producto.findByIdAndUpdate(id, data, { new: true });
};

exports.getById = async (id) => {
  return await Producto.findById(id);
};

exports.remove = async (id) => {
  return await Producto.findByIdAndDelete(id);
};
