const User = require('../models/user.model');
const { hashPassword, comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');

exports.register = async ({ nombre, email, password, rol }) => {
  if (!nombre || !email || !password) throw new Error('Faltan campos obligatorios');
  const existe = await User.findOne({ email });
  if (existe) throw new Error('El email ya está registrado');
  const hashed = await hashPassword(password);
  const user = new User({ nombre, email, password: hashed, rol });
  await user.save();
  return user;
};

exports.login = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error('Usuario no encontrado');
  const valid = await comparePassword(password, user.password);
  if (!valid) throw new Error('Contraseña incorrecta');
  const token = generateToken(user);
  return {
    token,
    user: {
      id: user._id,
      nombre: user.nombre,
      email: user.email,
      rol: user.rol,
      estado: user.estado,
    },
  };
};
