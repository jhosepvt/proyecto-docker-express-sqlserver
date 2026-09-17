IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'TodoDB')
BEGIN
    CREATE DATABASE TodoDB;
END
GO

USE TodoDB;
GO

IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'Tareas')
BEGIN
    CREATE TABLE Tareas (
        id INT IDENTITY(1,1) PRIMARY KEY,
        descripcion VARCHAR(255) NOT NULL
    );

    INSERT INTO Tareas (descripcion) VALUES ('Bienvenido a tu app en Docker');
END
GO
