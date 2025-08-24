const express = require('express');
const router = express.Router();
const marketPriceController = require('../controllers/marketPrice.controller');
const multer = require('multer');
const upload = multer({ dest: 'uploads/' });

// Rutas base
router.get('/', marketPriceController.list);
router.get('/:id', marketPriceController.getById);
router.post('/', marketPriceController.create);
router.delete('/:id', marketPriceController.remove);
router.post('/upload', upload.single('file'), marketPriceController.upload);

module.exports = router;
