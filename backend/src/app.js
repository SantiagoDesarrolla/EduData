const express = require('express');
const cors = require('cors');
const app = express();
const routes = require('./routes'); // ✅ conecta todas las rutas

app.use(cors());
app.use(express.json());

// Montar rutas en /api
app.use('/api', routes);

// Ruta principal
app.get('/', (req, res) => {
  res.json({ message: 'API EduData Backend funcionando!', version: '1.0.0' });
});

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

module.exports = app;
