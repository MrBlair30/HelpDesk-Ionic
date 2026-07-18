CREATE DATABASE IF NOT EXISTS helpdesk_db;
USE helpdesk_db;

CREATE TABLE IF NOT EXISTS incidencias (
  id INT AUTO_INCREMENT PRIMARY KEY,
  codigo VARCHAR(50) UNIQUE NOT NULL,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT NOT NULL,
  categoria VARCHAR(100) NOT NULL,
  prioridad VARCHAR(50) NOT NULL,
  estado VARCHAR(50) NOT NULL,
  solicitante VARCHAR(150) NOT NULL,
  tecnicoAsignado VARCHAR(150),
  fechaCreacion VARCHAR(100) NOT NULL,
  fechaActualizacion VARCHAR(100) NOT NULL
);
