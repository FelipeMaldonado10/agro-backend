const marketPriceService = require('../services/marketPrice.service');
const xlsx = require('xlsx');

exports.upload = async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    await marketPriceService.bulkInsert(data);
    res.json({ message: 'Datos importados correctamente', count: data.length });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar el archivo', details: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const nuevo = await marketPriceService.create(req.body);
    res.json(nuevo);
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar registro', details: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    const precios = await marketPriceService.list();
    res.json(precios);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar registros', details: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await marketPriceService.remove(req.params.id);
    res.json({ message: 'Registro eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar registro', details: err.message });
  }
};
