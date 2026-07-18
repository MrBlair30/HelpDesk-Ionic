const express = require('express');
const cors = require('cors');
require('dotenv').config();

const incidentRoutes = require('./routes/incident.routes');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('Body:', req.body);
  next();
});

app.use('/api/incidents', incidentRoutes);

// Ruta de test
app.get('/', (req, res) => {
  res.send('API de HelpDesk funcionando');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en el puerto ${PORT}`);
});
