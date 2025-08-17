const User = require('../models/user.model');
const { hashPassword } = require('../utils/hash');

// Listar usuarios
exports.getAll = async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
};

// Crear usuario (por superadmin)
exports.create = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password || !rol) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    const existe = await User.findOne({ email });
    if (existe) return res.status(400).json({ message: 'Email ya registrado' });
    const hashed = await hashPassword(password);
    const user = new User({ nombre, email, password: hashed, rol });
    await user.save();
    res.status(201).json({ message: 'Usuario creado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al crear usuario', error: err.message });
  }
};

// Actualizar usuario
exports.update = async (req, res) => {
  try {
    const { nombre, email, password, rol, estado } = req.body;
    const update = { nombre, email, rol, estado };
    if (password) update.password = await hashPassword(password);
    const user = await User.findByIdAndUpdate(req.params.id, update, { new: true }).select('-password');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar usuario', error: err.message });
  }
};

// Eliminar usuario
exports.remove = async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
  res.json({ message: 'Usuario eliminado' });
};