-- Crear la base de datos
CREATE DATABASE TodoDB;
GO

USE TodoDB;
GO

-- Crear la tabla de tareas
CREATE TABLE Tareas (
    Id INT IDENTITY(1,1) PRIMARY KEY,
    Titulo VARCHAR(250) NOT NULL,
    Completado BIT DEFAULT 0,
    FechaCreacion DATETIME DEFAULT GETDATE()
);
GO

-- Insertar registros iniciales
INSERT INTO Tareas (Titulo, Completado) 
VALUES ('Configurar VS Code', 1), ('Probar la app web', 0), ('Pasar la app a Docker', 0);
GO
