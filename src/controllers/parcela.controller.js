
const parcelaService = require('../services/parcela.service');

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
    const parcelas = await parcelaService.listByUser(req.user.id);
    res.json(parcelas);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

exports.obtenerParcela = async (req, res) => {
  try {
    const parcela = await parcelaService.getById(req.params.id, req.user.id);
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
    const parcela = await parcelaService.updateClima(req.params.id, req.user.id);
    res.json(parcela);
  } catch (error) {
    res.status(400).json({ mensaje: error.message });
  }
};

exports.actualizarParcela = async (req, res) => {
  try {
    const parcela = await parcelaService.update(req.params.id, req.user.id, req.body);
    res.json(parcela);
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