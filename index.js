const express = require('express');
const mssql = require('mssql');
const config = require('./config/db'); // Apunta correctamente a la carpeta config/

const app = express();

// Middlewares
app.use(express.json());
app.use(express.static('public'));

// Ruta GET: Obtener todas las tareas
app.get('/api/tareas', async (req, res) => {
  try {
    const pool = await mssql.connect(config);
    const result = await pool.request().query('SELECT * FROM Tareas');
    // Devuelve el recordset o un arreglo vacío
    res.json(result.recordset || []);
  } catch (err) {
    console.error('❌ ERROR SQL (GET /api/tareas):', err.message);
    res.status(500).json([]);
  }
});

// Ruta POST: Guardar una nueva tarea
app.post('/api/tareas', async (req, res) => {
  try {
    const { descripcion } = req.body;
    if (!descripcion) {
      return res.status(400).json({ error: 'La descripción es requerida' });
    }
    const pool = await mssql.connect(config);
    await pool.request()
      .input('descripcion', mssql.VarChar, descripcion)
      .query('INSERT INTO Tareas (descripcion) VALUES (@descripcion)');
    
    res.status(201).json({ message: 'Tarea creada con éxito' });
  } catch (err) {
    console.error('❌ ERROR SQL (POST /api/tareas):', err.message);
    res.status(500).json({ error: err.message });
  }
});

// Puerto de escucha
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
