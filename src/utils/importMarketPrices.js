const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const MarketPrice = require('../models/marketPrice.model');

async function importCSVToMongo(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', async () => {
        try {
          // Limpia la colección antes de importar
          await MarketPrice.deleteMany({});
          // Inserta los datos
          await MarketPrice.insertMany(results.map(r => ({
            producto: r.producto,
            fecha: r.fecha,
            precio: Number(r.precio),
            mercado: r.mercado,
            departamento: r.departamento
          })));
          resolve('Importación exitosa');
        } catch (err) {
          reject(err);
        }
      })
      .on('error', (err) => reject(err));
  });
}

// Ejecutar el script manualmente
if (require.main === module) {
  // Solo usa la URI remota definida en .env
  const mongoUri = process.env.MONGO_URI;
  mongoose.connect(mongoUri)
    .then(async () => {
      const filePath = process.argv[2] || './data/precios_historicos.csv';
      try {
        const result = await importCSVToMongo(filePath);
        console.log(result);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        mongoose.disconnect();
      }
    });
}

module.exports = importCSVToMongo;
