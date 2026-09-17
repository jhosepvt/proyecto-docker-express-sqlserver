const mssql = require('mssql');

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'Jhosep26_DockerPass!',
  server: process.env.DB_SERVER || 'sqlserver',
  database: process.env.DB_NAME || 'TodoDB',
  options: {
    encrypt: false,
    trustServerCertificate: true // Requerido para contenedores Docker
  }
};

module.exports = config;
