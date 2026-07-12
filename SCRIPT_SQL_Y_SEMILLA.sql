-- =========================================================================
-- PROYECTO: Mesa de Ayuda e Incidencias (Ionic Angular + SQLite)
-- ARCHIVO: SCRIPT_SQL_Y_SEMILLA.sql
-- DESCRIPCIÓN: Script DDL para creación de la tabla principal y DML de 
--              inserción de datos semilla para el módulo local.
-- =========================================================================

-- -------------------------------------------------------------------------
-- 1. ESTRUCTURA DE LA TABLA (DDL)
-- -------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS incidencias (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  codigo TEXT UNIQUE NOT NULL,
  titulo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  categoria TEXT NOT NULL,
  prioridad TEXT NOT NULL,
  estado TEXT NOT NULL,
  solicitante TEXT NOT NULL,
  tecnicoAsignado TEXT,
  fechaCreacion TEXT NOT NULL,
  fechaActualizacion TEXT NOT NULL
);

-- Índices para optimizar consultas en la pantalla de listado
CREATE INDEX IF NOT EXISTS idx_incidencias_estado ON incidencias (estado);
CREATE INDEX IF NOT EXISTS idx_incidencias_categoria ON incidencias (categoria);
CREATE INDEX IF NOT EXISTS idx_incidencias_prioridad ON incidencias (prioridad);

-- -------------------------------------------------------------------------
-- 2. DATOS SEMILLA (DML) - 6 Registros de Prueba
-- -------------------------------------------------------------------------
INSERT OR IGNORE INTO incidencias (
  codigo, titulo, descripcion, categoria, prioridad, estado, solicitante, tecnicoAsignado, fechaCreacion, fechaActualizacion
) VALUES 
(
  'INC-1001',
  'Fallo de conexión a la VPN corporativa',
  'Al intentar conectar a la VPN del servidor central, el cliente de acceso arroja el error de tiempo de espera agotado (Timeout error 809). Varios usuarios de contabilidad reportan el mismo inconveniente.',
  'Redes',
  'Crítica',
  'En Proceso',
  'Marcela Gómez (Contabilidad)',
  'Ing. Carlos Ramos',
  '2026-07-10T08:30:00.000Z',
  '2026-07-11T10:15:00.000Z'
),
(
  'INC-1002',
  'Impresora multifunción del 3er piso no responde',
  'La impresora HP LaserJet del departamento de Recursos Humanos muestra luz roja parpadeando y mensaje "Atasco de papel en bandeja 2", aunque no se observa papel atorado físicamente.',
  'Hardware',
  'Media',
  'Abierta',
  'Roberto Fernández (RRHH)',
  NULL,
  '2026-07-11T09:12:00.000Z',
  '2026-07-11T09:12:00.000Z'
),
(
  'INC-1003',
  'Solicitud de acceso al portal de Facturación ERP',
  'El nuevo analista financiero requiere credenciales de usuario y rol de auditoría para el módulo de facturación electrónica y reportes fiscales en el ERP central.',
  'Accesos / Cuentas',
  'Alta',
  'Abierta',
  'Elena Torres (Finanzas)',
  'Lic. Ana Martínez',
  '2026-07-11T11:45:00.000Z',
  '2026-07-11T14:20:00.000Z'
),
(
  'INC-1004',
  'Actualización de licencia Office 365 caducada',
  'Al abrir Microsoft Excel en el equipo portátil asignado a Ventas se muestra un aviso de que la suscripción ha expirado, bloqueando la edición de documentos y tablas dinámicas.',
  'Software',
  'Alta',
  'Resuelta',
  'Diego Navarro (Ventas)',
  'Ing. Carlos Ramos',
  '2026-07-09T14:00:00.000Z',
  '2026-07-10T16:30:00.000Z'
),
(
  'INC-1005',
  'Monitor adicional parpadea y se apaga intermitentemente',
  'El segundo monitor Dell 24 pulgadas conectado por HDMI al dock station parpadea de forma constante al abrir varias ventanas gráficas pesadas.',
  'Hardware',
  'Baja',
  'En Proceso',
  'Valeria López (Diseño)',
  'Téc. Fernando Ruiz',
  '2026-07-11T16:10:00.000Z',
  '2026-07-12T09:00:00.000Z'
),
(
  'INC-1006',
  'Error 500 al generar reporte de asistencia mensual',
  'En el sistema web interno de asistencias, al pulsar el botón Exportar a PDF del mes actual la pantalla queda en blanco y en consola aparece Internal Server Error 500.',
  'Software',
  'Crítica',
  'Abierta',
  'Javier Morales (Auditoría Interna)',
  'Lic. Ana Martínez',
  '2026-07-12T08:05:00.000Z',
  '2026-07-12T08:05:00.000Z'
);
