const express = require('express');
const mssql = require('mssql');
const config = require('./config/db'); // Apunta correctamente a la carpeta config/

const app = express();

// Middlewares
app.use(express.json());
app.use(express.static('public'));

// Función para asegurar que la base de datos y la tabla existan en cualquier PC nueva
async function asegurarBaseDeDatosYTablas() {
  // Creamos una copia temporal de tu config apuntando a 'master'
  const configMaster = { ...config, database: 'master' };
  let pool;

  try {
    console.log("🔌 Conectando temporalmente a SQL Server (master) para verificar estructura...");
    pool = await mssql.connect(configMaster);

    // 1. Crear la base de datos si no existe
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TodoDB')
      BEGIN
        CREATE DATABASE TodoDB;
      END
    `);
    
    // Desconectamos de master y reconectamos apuntando a tu base real TodoDB
    await mssql.close();
    pool = await mssql.connect(config);

    // 2. Crear la tabla Tareas e insertar la semilla inicial si está en blanco
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tareas')
      BEGIN
        CREATE TABLE Tareas (
          id INT IDENTITY(1,1) PRIMARY KEY,
          descripcion VARCHAR(255) NOT NULL
        );
        INSERT INTO Tareas (descripcion) VALUES ('Bienvenido a tu app en Docker');
      END
    `);

    console.log("✅ Base de datos 'TodoDB' y tabla 'Tareas' verificadas/creadas con éxito.");
    await mssql.close(); // Cerramos la conexión inicial para dejar los pools libres para las rutas

  } catch (err) {
    console.error("⚠️ Error inicializando la base de datos física (Reintentando...):", err.message);
    if (pool) await mssql.close();
    // Lanzamos el error para que rompa el inicio y la propiedad 'restart: always' de tu docker-compose reinicie la app
    throw err; 
  }
}

// Ruta GET: Obtener todas las tareas
app.get('/api/tareas', async (req, res) => {
  try {
    const pool = await mssql.connect(config);
    const result = await pool.request().query('SELECT * FROM Tareas');
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

// Puerto de escucha - Esperamos a que la base de datos esté lista antes de abrir el puerto
const PORT = process.env.PORT || 3000;

asegurarBaseDeDatosYTablas()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ No se pudo inicializar la app debido a la base de datos.");
  });
