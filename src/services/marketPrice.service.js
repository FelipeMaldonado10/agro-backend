const MarketPrice = require('../models/marketPrice.model');

exports.create = async (data) => {
  return await MarketPrice.create(data);
};

exports.list = async () => {
  try {
    return await MarketPrice.find()
      .populate('producto', '_id nombre')
      .populate('ciudad', '_id nombre')
      .sort({ fecha: -1 })
      .lean();
  } catch (error) {
    console.error('Error en marketPrice.service.list:', error);
    throw error;
  }
};

exports.getById = async (id) => {
  return await MarketPrice.findById(id);
};

exports.update = async (id, data) => {
  return await MarketPrice.findByIdAndUpdate(id, data, { new: true });
};

exports.remove = async (id) => {
  return await MarketPrice.findByIdAndDelete(id);
};

exports.bulkInsert = async (data) => {
  try {
    // Solo inserta si producto y ciudad son ObjectId válidos
    const validData = data.filter(r =>
      typeof r.producto === 'string' && r.producto.match(/^[0-9a-fA-F]{24}$/) &&
      typeof r.ciudad === 'string' && r.ciudad.match(/^[0-9a-fA-F]{24}$/)
    );

    // Opcional: advertencias para IDs inválidos
    data.forEach(r => {
      if (r.producto && typeof r.producto === 'string' && !r.producto.match(/^[0-9a-fA-F]{24}$/)) {
        console.warn(`Invalid product ID format: ${r.producto}`);
      }
      if (r.ciudad && typeof r.ciudad === 'string' && !r.ciudad.match(/^[0-9a-fA-F]{24}$/)) {
        console.warn(`Invalid city ID format: ${r.ciudad}`);
      }
    });

    // Formatear datos si es necesario
    const formattedData = validData.map(r => ({
      producto: r.producto,
      ciudad: r.ciudad,
      fecha: r.fecha,
      precio: Number(r.precio)
    }));

    return await MarketPrice.insertMany(formattedData);
  } catch (error) {
    console.error('Error in bulkInsert:', error);
    throw error;
  }
};

