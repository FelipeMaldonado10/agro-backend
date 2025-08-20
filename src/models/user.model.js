const mongoose = require('mongoose');

const roles = ['productor', 'admin', 'superadmin'];

const userSchema = new mongoose.Schema({
  nombre: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  rol: { type: String, enum: roles, default: 'productor' },
  estado: { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);