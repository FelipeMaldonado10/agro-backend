const User = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

// Registro
exports.register = async (req, res) => {
  try {
    const { nombre, email, password, rol } = req.body;
    if (!nombre || !email || !password) {
      return res.status(400).json({ message: 'Faltan campos obligatorios' });
    }
    const existe = await User.findOne({ email });
    if (existe) {
      return res.status(400).json({ message: 'El email ya está registrado' });
    }
    const hashed = await hashPassword(password);
    const user = new User({ nombre, email, password: hashed, rol });
    await user.save();
    res.status(201).json({ message: 'Usuario registrado correctamente' });
  } catch (err) {
    res.status(500).json({ message: 'Error en el registro', error: err.message });
  }
};

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const valid = await comparePassword(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Contraseña incorrecta' });
    }
    const token = generateToken(user);
    res.json({
      token,
      user: {
        id: user._id,
        nombre: user.nombre,
        email: user.email,
        rol: user.rol,
        estado: user.estado,
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Error en el login', error: err.message });
  }
};