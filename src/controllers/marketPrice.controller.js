const marketPriceService = require('../services/marketPrice.service');
const xlsx = require('xlsx');
const MarketPrice = require('../models/marketPrice.model');
const Producto = require('../models/producto.model');
const Ciudad = require('../models/ciudad.model');

// Corrige registros corruptos en la base de datos (solo una vez por arranque)
async function fixCorruptMarketPrices() {
  const productos = await Producto.find().lean();
  const ciudades = await Ciudad.find().lean();

  // Corrige producto por nombre
  const corruptosProducto = await MarketPrice.find({ 'producto': { $type: 'string' } });
  for (const reg of corruptosProducto) {
    const prod = productos.find(p => p.nombre.toLowerCase() === reg.producto.toLowerCase());
    if (prod) {
      await MarketPrice.updateOne({ _id: reg._id }, { $set: { producto: prod._id } });
    }
  }
  // Corrige ciudad por nombre
  const corruptosCiudad = await MarketPrice.find({ 'ciudad': { $type: 'string' } });
  for (const reg of corruptosCiudad) {
    const ciu = ciudades.find(c => c.nombre.toLowerCase() === reg.ciudad.toLowerCase());
    if (ciu) {
      await MarketPrice.updateOne({ _id: reg._id }, { $set: { ciudad: ciu._id } });
    }
  }
}

// Ejecuta la corrección al iniciar el servidor
fixCorruptMarketPrices().catch(console.error);

exports.upload = async (req, res) => {
  try {
    const filePath = req.file.path;
    const workbook = xlsx.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Obtener todos los productos y ciudades
    const productos = await Producto.find().lean();
    const ciudades = await Ciudad.find().lean();

    // Procesar los datos para convertir nombres a IDs
    const data = await Promise.all(rawData.map(async (row) => {
      // Buscar el producto por nombre
      const producto = productos.find(p => p.nombre.toLowerCase() === row.producto.toLowerCase());
      if (!producto) {
        throw new Error(`Producto no encontrado: ${row.producto}`);
      }

      // Buscar la ciudad por nombre
      const ciudad = ciudades.find(c => c.nombre.toLowerCase() === row.ciudad.toLowerCase());
      if (!ciudad) {
        throw new Error(`Ciudad no encontrada: ${row.ciudad}`);
      }

      return {
        producto: producto._id,
        ciudad: ciudad._id,
        fecha: row.fecha,
        precio: Number(row.precio)
      };
    }));

    await marketPriceService.bulkInsert(data);
    res.json({ message: 'Datos importados correctamente', count: data.length });
  } catch (err) {
    console.error('Error al procesar el archivo:', err);
    res.status(500).json({ error: 'Error al procesar el archivo', details: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    // Si recibe nombre, lo convierte a ObjectId
    if (req.body.producto && typeof req.body.producto === 'string' && !req.body.producto.match(/^[0-9a-fA-F]{24}$/)) {
      const producto = await Producto.findOne({ nombre: { $regex: new RegExp(`^${req.body.producto}$`, 'i') } }).lean();
      if (producto) {
        req.body.producto = producto._id;
      } else {
        return res.status(400).json({ error: 'Producto no encontrado', details: `No se encontró un producto con el nombre: ${req.body.producto}` });
      }
    }
    if (req.body.ciudad && typeof req.body.ciudad === 'string' && !req.body.ciudad.match(/^[0-9a-fA-F]{24}$/)) {
      const ciudad = await Ciudad.findOne({ nombre: { $regex: new RegExp(`^${req.body.ciudad}$`, 'i') } }).lean();
      if (ciudad) {
        req.body.ciudad = ciudad._id;
      } else {
        return res.status(400).json({ error: 'Ciudad no encontrada', details: `No se encontró una ciudad con el nombre: ${req.body.ciudad}` });
      }
    }
    // Validar que producto y ciudad sean ObjectId
    if (!req.body.producto.match(/^[0-9a-fA-F]{24}$/) || !req.body.ciudad.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ error: 'producto y ciudad deben ser ObjectId válidos' });
    }

    const nuevo = await marketPriceService.create(req.body);
    res.json(nuevo);
  } catch (err) {
    console.error('Error creating market price:', err);
    res.status(500).json({ error: 'Error al agregar registro', details: err.message });
  }
};

exports.list = async (req, res) => {
  try {
    // Solo trae los registros donde producto y ciudad son ObjectId válidos
    const precios = await MarketPrice.find({
      producto: { $type: 'objectId' },
      ciudad: { $type: 'objectId' }
    })
      .populate('producto', 'nombre')
      .populate('ciudad', 'nombre')
      .sort('-fecha')
      .lean();

    // Busca registros corruptos para informar
    const corruptos = await MarketPrice.find({
      $or: [
        { producto: { $not: { $type: 'objectId' } } },
        { ciudad: { $not: { $type: 'objectId' } } }
      ]
    }).lean();

    if (corruptos.length > 0) {
      console.warn('Aún hay registros corruptos en MarketPrice (producto o ciudad no es ObjectId):');
      corruptos.forEach(c => {
        console.warn(JSON.stringify(c));
      });
    }

    console.log('Precios enviados al frontend:', precios.length);

    res.json(precios);
  } catch (err) {
    console.error('Error:', err);
    res.status(500).json({ error: 'Error al obtener precios', details: err.message });
  }
};

exports.getById = async (req, res) => {
  try {
    const precio = await MarketPrice.findById(req.params.id)
      .populate('producto', 'nombre')
      .populate('ciudad', 'nombre')
      .lean();
    
    if (!precio) {
      return res.status(404).json({ error: 'Precio no encontrado' });
    }
    
    res.json(precio);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener precio', details: err.message });
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

