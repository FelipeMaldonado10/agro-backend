const ciudadService = require('../services/ciudad.service');

exports.crearCiudad = async (req, res) => {
  try {
    const ciudad = await ciudadService.create(req.body);
    res.status(201).json(ciudad);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe una ciudad con ese nombre' });
    }
    res.status(500).json({ mensaje: error.message });
  }
};

exports.obtenerCiudades = async (req, res) => {
  try {
    const ciudades = await ciudadService.list();
    res.json(ciudades);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

exports.obtenerCiudad = async (req, res) => {
  try {
    const ciudad = await ciudadService.getById(req.params.id);
    if (!ciudad) {
      return res.status(404).json({ mensaje: 'Ciudad no encontrada' });
    }
    res.json(ciudad);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

exports.actualizarCiudad = async (req, res) => {
  try {
    const ciudad = await ciudadService.update(req.params.id, req.body);
    res.json(ciudad);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe una ciudad con ese nombre' });
    }
    res.status(500).json({ mensaje: error.message });
  }
};

exports.eliminarCiudad = async (req, res) => {
  try {
    await ciudadService.remove(req.params.id);
    res.json({ mensaje: 'Ciudad eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};