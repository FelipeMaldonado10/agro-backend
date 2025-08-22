const Ciudad = require('../models/ciudad.model');

exports.create = async (data) => {
  return await new Ciudad(data).save();
};

exports.list = async () => {
  return await Ciudad.find().sort('nombre');
};

exports.getById = async (id) => {
  return await Ciudad.findById(id);
};

exports.update = async (id, data) => {
  const ciudad = await Ciudad.findById(id);
  if (!ciudad) throw new Error('Ciudad no encontrada');
  if (data.nombre) ciudad.nombre = data.nombre;
  if (data.coordenadas) ciudad.coordenadas = data.coordenadas;
  await ciudad.save();
  return ciudad;
};

exports.remove = async (id) => {
  return await Ciudad.findByIdAndDelete(id);
};
