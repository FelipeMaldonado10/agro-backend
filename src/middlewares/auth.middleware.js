const jwt = require('jsonwebtoken');


const auth = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) {
    console.warn('[Auth] Token requerido pero no enviado');
    return res.status(401).json({ message: 'Token requerido' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded || !decoded.id || !decoded.rol) {
      console.warn('[Auth] Token decodificado pero faltan campos:', decoded);
      return res.status(401).json({ message: 'Token inválido (faltan datos de usuario)' });
    }
    req.user = decoded; // { id, rol, email }
    next();
  } catch (err) {
    console.error('[Auth] Token inválido:', err.message);
    return res.status(401).json({ message: 'Token inválido' });
  }
};

module.exports = auth;