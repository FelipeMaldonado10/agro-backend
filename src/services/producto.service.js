const Producto = require('../models/producto.model');

exports.create = async (data) => {
  return await Producto.create(data);
};

exports.list = async () => {
  try {
    console.log('Producto.service.list: Buscando productos...');
    const productos = await Producto.find();
    console.log('Producto.service.list: Productos encontrados:', productos.length);
    console.log('Producto.service.list: Productos:', productos);
    return productos;
  } catch (error) {
    console.error('Producto.service.list: Error al buscar productos:', error);
    throw error;
  }
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
