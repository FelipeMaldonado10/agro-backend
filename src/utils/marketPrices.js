const fs = require('fs');
const csv = require('csv-parser');

/**
 * Lee y procesa un archivo CSV de precios históricos agrícolas.
 * @param {string} filePath Ruta al archivo CSV.
 * @returns {Promise<Array>} Array de objetos con los datos procesados.
 */
function readMarketPricesCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        resolve(results);
      })
      .on('error', (err) => reject(err));
  });
}

/**
 * Ejemplo de uso: Procesar precios históricos y filtrar por producto y fecha
 */
async function getRecommendations({ filePath, producto, fecha }) {
  const precios = await readMarketPricesCSV(filePath);
  // Filtrar por producto y fecha
  const filtrados = precios.filter(p => 
    p.producto.toLowerCase() === producto.toLowerCase() &&
    p.fecha <= fecha // Suponiendo formato YYYY-MM-DD
  );
  // Calcular promedio, tendencia, etc.
  const valores = filtrados.map(p => Number(p.precio));
  const promedio = valores.length ? valores.reduce((a,b) => a+b, 0) / valores.length : 0;
  return {
    producto,
    fecha,
    promedio,
    tendencia: valores.length > 1 ? (valores[valores.length-1] - valores[0]) : 0,
    recomendacion: promedio > 0 ? 'Plantación recomendada' : 'No hay datos suficientes'
  };
}

module.exports = {
  readMarketPricesCSV,
  getRecommendations
};
