
const productoService = require('../services/producto.service');

exports.crearProducto = async (req, res) => {
  try {
    const nuevo = await productoService.create(req.body);
    res.status(201).json(nuevo);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.listarProductos = async (req, res) => {
  try {
    const productos = await productoService.list();
    res.json(productos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.obtenerProducto = async (req, res) => {
  try {
    const producto = await productoService.getById(req.params.id);
    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(producto);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.editarProducto = async (req, res) => {
  try {
    const actualizado = await productoService.update(req.params.id, req.body);
    res.json(actualizado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.eliminarProducto = async (req, res) => {
  try {
    await productoService.remove(req.params.id);
    res.json({ mensaje: 'Producto eliminado' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
