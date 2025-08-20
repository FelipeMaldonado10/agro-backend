const Parcela = require('../models/parcela.model');
const { fetchWeatherApi } = require('openmeteo');

// Función auxiliar para obtener datos del clima
async function obtenerDatosClimaticos(latitud, longitud) {
  try {
    const params = {
      latitude: latitud,
      longitude: longitud,
      hourly: [
        "temperature_2m",
        "relative_humidity_2m",
        "apparent_temperature",
        "rain",
        "precipitation",
        "temperature_80m",
        "soil_moisture_0_to_1cm",
        "soil_moisture_1_to_3cm",
        "soil_temperature_0cm",
        "soil_temperature_6cm",
        "wind_speed_180m"
      ],
      timezone: "auto"
    };

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

// Crear una nueva parcela
exports.crearParcela = async (req, res) => {
  try {
    const { nombre, ciudad, coordenadas } = req.body;
    
    // Obtener datos climáticos iniciales
    const datosClimaticos = await obtenerDatosClimaticos(coordenadas.latitud, coordenadas.longitud);

    const parcela = new Parcela({
      nombre,
      ciudad,
      coordenadas,
      datosClimaticos,
      usuario: req.user.id // Usando el ID del usuario del token decodificado
    });

    await parcela.save();
    res.status(201).json(parcela);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener todas las parcelas del usuario
exports.obtenerParcelas = async (req, res) => {
  try {
    const parcelas = await Parcela.find({ usuario: req.user.id });
    res.json(parcelas);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Obtener una parcela específica
exports.obtenerParcela = async (req, res) => {
  try {
    const parcela = await Parcela.findOne({ _id: req.params.id, usuario: req.user.id });
    if (!parcela) {
      return res.status(404).json({ mensaje: 'Parcela no encontrada' });
    }
    res.json(parcela);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Actualizar datos climáticos de una parcela
exports.actualizarDatosClimaticos = async (req, res) => {
  try {
    const parcela = await Parcela.findOne({ _id: req.params.id, usuario: req.user.id });
    if (!parcela) {
      return res.status(404).json({ mensaje: 'Parcela no encontrada' });
    }

    const datosClimaticos = await obtenerDatosClimaticos(parcela.coordenadas.latitud, parcela.coordenadas.longitud);
    parcela.datosClimaticos = datosClimaticos;
    await parcela.save();

    res.json(parcela);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Actualizar información de una parcela
exports.actualizarParcela = async (req, res) => {
  try {
    const { nombre, ciudad, coordenadas } = req.body;
    const parcela = await Parcela.findOne({ _id: req.params.id, usuario: req.user.id });
    
    if (!parcela) {
      return res.status(404).json({ mensaje: 'Parcela no encontrada' });
    }

    if (nombre) parcela.nombre = nombre;
    if (ciudad) parcela.ciudad = ciudad;
    if (coordenadas) {
      parcela.coordenadas = coordenadas;
      // Actualizar datos climáticos si cambian las coordenadas
      const datosClimaticos = await obtenerDatosClimaticos(coordenadas.latitud, coordenadas.longitud);
      parcela.datosClimaticos = datosClimaticos;
    }

    await parcela.save();
    res.json(parcela);
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};

// Eliminar una parcela
exports.eliminarParcela = async (req, res) => {
  try {
    const parcela = await Parcela.findOneAndDelete({ _id: req.params.id, usuario: req.user.id });
    if (!parcela) {
      return res.status(404).json({ mensaje: 'Parcela no encontrada' });
    }
    res.json({ mensaje: 'Parcela eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ mensaje: error.message });
  }
};