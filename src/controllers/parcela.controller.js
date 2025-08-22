
const parcelaService = require('../services/parcela.service');


    const responses = await fetchWeatherApi("https://api.open-meteo.com/v1/forecast", params);
    const response = responses[0];
    const hourly = response.hourly();

    // Obtener el último valor de cada variable
    const ultimoIndice = hourly.variables(0).valuesArray().length - 1;

    return {
      temperatura: hourly.variables(0).valuesArray()[ultimoIndice],
      humedad_relativa: hourly.variables(1).valuesArray()[ultimoIndice],
      temperatura_aparente: hourly.variables(2).valuesArray()[ultimoIndice],
      lluvia: hourly.variables(3).valuesArray()[ultimoIndice],
      precipitacion: hourly.variables(4).valuesArray()[ultimoIndice],
      temperatura_80m: hourly.variables(5).valuesArray()[ultimoIndice],
      humedad_suelo_0_1cm: hourly.variables(6).valuesArray()[ultimoIndice],
      humedad_suelo_1_3cm: hourly.variables(7).valuesArray()[ultimoIndice],
      temperatura_suelo_0cm: hourly.variables(8).valuesArray()[ultimoIndice],
      temperatura_suelo_6cm: hourly.variables(9).valuesArray()[ultimoIndice],
      velocidad_viento_180m: hourly.variables(10).valuesArray()[ultimoIndice],
      ultima_actualizacion: new Date()
    };
  } catch (error) {
    console.error('Error al obtener datos climáticos:', error);
    throw new Error('Error al obtener datos climáticos');
  }
}

const Ciudad = require('../models/ciudad.model');

// Crear una nueva parcela
exports.crearParcela = async (req, res) => {
  try {
    const { nombre, ciudadId } = req.body;
    
    // Verificar que la ciudad existe
    const ciudad = await Ciudad.findById(ciudadId);
    if (!ciudad) {
      return res.status(404).json({ mensaje: 'Ciudad no encontrada' });
    }

    // Obtener datos climáticos iniciales usando las coordenadas de la ciudad
    const datosClimaticos = await obtenerDatosClimaticos(ciudad.coordenadas.latitud, ciudad.coordenadas.longitud);

    const parcela = new Parcela({
      nombre,
      ciudad: ciudadId,
      datosClimaticos,
      usuario: req.user.id // Usando el ID del usuario del token decodificado
    });

    await parcela.save();

exports.crearParcela = async (req, res) => {
  try {
    const { nombre, ciudadId } = req.body;
    const parcela = await parcelaService.create({ nombre, ciudadId, usuarioId: req.user.id });

    res.status(201).json(parcela);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

exports.obtenerParcelas = async (req, res) => {
  try {

    const parcelas = await Parcela.find({ usuario: req.user.id });

    const parcelas = await parcelaService.listByUser(req.user.id);

    const parcelas = await Parcela.find({ usuario: req.user.id }).populate('ciudad');

    res.json(parcelas);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

exports.obtenerParcela = async (req, res) => {
  try {

    const parcela = await Parcela.findOne({ _id: req.params.id, usuario: req.user.id });
=======
    const parcela = await parcelaService.getById(req.params.id, req.user.id);

    const parcela = await Parcela.findOne({ _id: req.params.id, usuario: req.user.id }).populate('ciudad');

    if (!parcela) {
      return res.status(404).json({ mensaje: 'Parcela no encontrada' });
    }
    res.json(parcela);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

exports.actualizarDatosClimaticos = async (req, res) => {
  try {

    const parcela = await Parcela.findOne({ _id: req.params.id, usuario: req.user.id });

    const parcela = await Parcela.findOne({ _id: req.params.id, usuario: req.user.id }).populate('ciudad');

    if (!parcela) {
      return res.status(404).json({ mensaje: 'Parcela no encontrada' });
    }

    const datosClimaticos = await obtenerDatosClimaticos(parcela.ciudad.coordenadas.latitud, parcela.ciudad.coordenadas.longitud);
    parcela.datosClimaticos = datosClimaticos;
    await parcela.save();


    const parcela = await parcelaService.updateClima(req.params.id, req.user.id);

    res.json(parcela);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

exports.actualizarParcela = async (req, res) => {
  try {

    const { nombre, ciudad, coordenadas } = req.body;

    const { nombre, ciudadId } = req.body;

    const parcela = await Parcela.findOne({ _id: req.params.id, usuario: req.user.id });
    
    if (!parcela) {
      return res.status(404).json({ mensaje: 'Parcela no encontrada' });
    }

    if (nombre) parcela.nombre = nombre;
    if (ciudadId) {
      // Verificar que la ciudad existe
      const ciudad = await Ciudad.findById(ciudadId);
      if (!ciudad) {
        return res.status(404).json({ mensaje: 'Ciudad no encontrada' });
      }
      parcela.ciudad = ciudadId;
      // Actualizar datos climáticos con las coordenadas de la nueva ciudad
      const datosClimaticos = await obtenerDatosClimaticos(ciudad.coordenadas.latitud, ciudad.coordenadas.longitud);
      parcela.datosClimaticos = datosClimaticos;
    }

    await parcela.save();


    const parcela = await parcelaService.update(req.params.id, req.user.id, req.body);

    res.json(parcela);

    const parcelaActualizada = await Parcela.findById(parcela._id).populate('ciudad');
    res.json(parcelaActualizada);

  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

exports.eliminarParcela = async (req, res) => {
  try {
    await parcelaService.remove(req.params.id, req.user.id);
    res.json({ mensaje: 'Parcela eliminada correctamente' });
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};