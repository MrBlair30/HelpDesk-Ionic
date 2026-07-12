export const INCIDENCIAS_SCHEMA_SQL = `
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

CREATE INDEX IF NOT EXISTS idx_incidencias_estado ON incidencias (estado);
CREATE INDEX IF NOT EXISTS idx_incidencias_categoria ON incidencias (categoria);
CREATE INDEX IF NOT EXISTS idx_incidencias_prioridad ON incidencias (prioridad);
`;
