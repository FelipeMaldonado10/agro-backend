
const userService = require('../services/user.service');

exports.getAll = async (req, res) => {
  try {
    const users = await userService.getAll();
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios', error: err.message });
  }
};

exports.create = async (req, res) => {
  try {
    const user = await userService.create(req.body);
    res.status(201).json({ message: 'Usuario creado', user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await userService.update(req.params.id, req.body);
    res.json(user);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.remove = async (req, res) => {
  try {
    await userService.remove(req.params.id);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};