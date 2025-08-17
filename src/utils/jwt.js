const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, rol: user.rol, email: user.email, nombre: user.nombre },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

module.exports = { generateToken };