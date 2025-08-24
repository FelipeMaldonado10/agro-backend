const User = require('../models/user.model');
const { hashPassword } = require('../utils/hash');

exports.getAll = async () => {
  return await User.find().select('-password');
};

exports.create = async ({ nombre, email, password, rol }) => {
  if (!nombre || !email || !password || !rol) throw new Error('Faltan campos obligatorios');
  const existe = await User.findOne({ email });
  if (existe) throw new Error('Email ya registrado');
  const hashed = await hashPassword(password);
  const user = new User({ nombre, email, password: hashed, rol });
  await user.save();
  return user;
};

exports.update = async (id, { nombre, email, password, rol, estado }) => {
  const update = { nombre, email, rol, estado };
  if (password) update.password = await hashPassword(password);
  const user = await User.findByIdAndUpdate(id, update, { new: true }).select('-password');
  if (!user) throw new Error('Usuario no encontrado');
  return user;
};

exports.remove = async (id) => {
  const user = await User.findByIdAndDelete(id);
  if (!user) throw new Error('Usuario no encontrado');
  return user;
};
