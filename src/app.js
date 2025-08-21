require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Conexión a la base de datos
connectDB();

// Rutas
app.use('/api/auth', require('./routes/auth.routes'));
app.use('/api/users', require('./routes/user.routes'));
app.use('/api/parcelas', require('./routes/parcela.routes'));

app.use('/api/recomendaciones', require('./routes/recommendation.routes'));
app.use('/api/market-prices', require('./routes/marketPrice.routes'));
app.use('/api/productos', require('./routes/producto.routes'));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});