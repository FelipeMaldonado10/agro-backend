
const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const marketPriceController = require('../controllers/marketPrice.controller');

// POST /api/market-prices/upload - Subir archivo Excel/CSV

router.post('/upload', upload.single('file'), async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
    // Espera columnas: producto, fecha, precio, mercado, departamento
    await MarketPrice.insertMany(data.map(r => ({
      producto: r.producto,
      fecha: r.fecha,
      precio: Number(r.precio),
      ciudad: r.ciudad
    })));
    res.json({ message: 'Datos importados correctamente', count: data.length });
  } catch (err) {
    res.status(500).json({ error: 'Error al procesar el archivo', details: err.message });
  }
});

// POST /api/market-prices - Agregar registro manual
router.post('/', async (req, res) => {
  try {
    const { producto, fecha, precio, ciudad } = req.body;
    if (!producto || !fecha || !precio || !ciudad) {
      return res.status(400).json({ error: 'producto, fecha, precio y ciudad son requeridos' });
    }
    const nuevo = await MarketPrice.create({ producto, fecha, precio, ciudad });
    res.json(nuevo);
  } catch (err) {
    res.status(500).json({ error: 'Error al agregar registro', details: err.message });
  }
});


// GET /api/market-prices - Listar todos los registros
router.get('/', async (req, res) => {
  try {
    const precios = await MarketPrice.find()
      .populate('producto', 'nombre') // Solo traer el nombre del producto
      .populate('ciudad', 'nombre')   // Solo traer el nombre de la ciudad
      .sort({ fecha: -1 });
    res.json(precios);
  } catch (err) {
    res.status(500).json({ error: 'Error al listar registros', details: err.message });
  }
});
router.get('/', marketPriceController.list);

// DELETE /api/market-prices/:id - Eliminar registro
router.delete('/:id', marketPriceController.remove);

module.exports = router;
