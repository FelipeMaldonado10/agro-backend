
const express = require('express');
const multer = require('multer');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });
const marketPriceController = require('../controllers/marketPrice.controller');

// POST /api/market-prices/upload - Subir archivo Excel/CSV
router.post('/upload', upload.single('file'), marketPriceController.upload);

// POST /api/market-prices - Agregar registro manual
router.post('/', marketPriceController.create);

// GET /api/market-prices - Listar todos los registros
router.get('/', marketPriceController.list);

// DELETE /api/market-prices/:id - Eliminar registro
router.delete('/:id', marketPriceController.remove);

module.exports = router;
