const Parcela = require('../models/parcela.model');
const Ciudad = require('../models/ciudad.model');
const { fetchWeatherApi } = require('openmeteo');

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
    throw new Error('Error al obtener datos climáticos');
  }
}

exports.create = async ({ nombre, ciudadId, usuarioId }) => {
  const ciudad = await Ciudad.findById(ciudadId);
  if (!ciudad) throw new Error('Ciudad no encontrada');
  const datosClimaticos = await obtenerDatosClimaticos(ciudad.coordenadas.latitud, ciudad.coordenadas.longitud);
  const parcela = new Parcela({ nombre, ciudad: ciudadId, datosClimaticos, usuario: usuarioId });
  await parcela.save();
  return parcela;
};

exports.listByUser = async (usuarioId) => {
  return await Parcela.find({ usuario: usuarioId }).populate('ciudad');
};

exports.getById = async (id, usuarioId) => {
  return await Parcela.findOne({ _id: id, usuario: usuarioId }).populate('ciudad');
};

exports.updateClima = async (id, usuarioId) => {
  const parcela = await Parcela.findOne({ _id: id, usuario: usuarioId }).populate('ciudad');
  if (!parcela) throw new Error('Parcela no encontrada');
  const datosClimaticos = await obtenerDatosClimaticos(parcela.ciudad.coordenadas.latitud, parcela.ciudad.coordenadas.longitud);
  parcela.datosClimaticos = datosClimaticos;
  await parcela.save();
  return parcela;
};

exports.update = async (id, usuarioId, { nombre, ciudadId }) => {
  const parcela = await Parcela.findOne({ _id: id, usuario: usuarioId });
  if (!parcela) throw new Error('Parcela no encontrada');
  if (nombre) parcela.nombre = nombre;
  if (ciudadId) {
    const ciudad = await Ciudad.findById(ciudadId);
    if (!ciudad) throw new Error('Ciudad no encontrada');
    parcela.ciudad = ciudadId;
    const datosClimaticos = await obtenerDatosClimaticos(ciudad.coordenadas.latitud, ciudad.coordenadas.longitud);
    parcela.datosClimaticos = datosClimaticos;
  }
  await parcela.save();
  return await Parcela.findById(parcela._id).populate('ciudad');
};

exports.remove = async (id, usuarioId) => {
  return await Parcela.findOneAndDelete({ _id: id, usuario: usuarioId });
};
