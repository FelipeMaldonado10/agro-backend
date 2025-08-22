
const Ciudad = require('../models/ciudad.model');

// Crear una nueva ciudad
exports.crearCiudad = async (req, res) => {
  try {
    const { nombre, coordenadas } = req.body;
    const ciudad = new Ciudad({
      nombre,
      coordenadas
    });

    await ciudad.save();
    res.status(201).json(ciudad);
  } catch (error) {
    if (error.code === 11000) { // Error de duplicado

      return res.status(400).json({ mensaje: 'Ya existe una ciudad con ese nombre' });
    }
    res.status(500).json({ mensaje: error.message });
  }
};


// Obtener todas las ciudades
exports.obtenerCiudades = async (req, res) => {
  try {
    const ciudades = await Ciudad.find().sort('nombre');

    res.json(ciudades);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};


// Obtener una ciudad específica
exports.obtenerCiudad = async (req, res) => {
  try {
    const ciudad = await Ciudad.findById(req.params.id);

    if (!ciudad) {
      return res.status(404).json({ mensaje: 'Ciudad no encontrada' });
    }
    res.json(ciudad);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};


// Actualizar una ciudad
exports.actualizarCiudad = async (req, res) => {
  try {
    const { nombre, coordenadas } = req.body;
    const ciudad = await Ciudad.findById(req.params.id);
    
    if (!ciudad) {
      return res.status(404).json({ mensaje: 'Ciudad no encontrada' });
    }

    if (nombre) ciudad.nombre = nombre;
    if (coordenadas) ciudad.coordenadas = coordenadas;

    await ciudad.save();

    res.json(ciudad);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ mensaje: 'Ya existe una ciudad con ese nombre' });
    }
    res.status(500).json({ mensaje: error.message });
  }
};


// Eliminar una ciudad
exports.eliminarCiudad = async (req, res) => {
  try {
    const ciudad = await Ciudad.findByIdAndDelete(req.params.id);
    if (!ciudad) {
      return res.status(404).json({ mensaje: 'Ciudad no encontrada' });
    }

    res.json({ mensaje: 'Ciudad eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};