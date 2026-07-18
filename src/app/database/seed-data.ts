import { Incident } from '../models/incident.model';

export const SEED_INCIDENTS: Incident[] = [
  {
    codigo: 'INC-1001',
    titulo: 'Fallo de conexión a la VPN corporativa',
    descripcion: 'Al intentar conectar a la VPN del servidor central, el cliente de acceso arroja el error de tiempo de espera agotado (Timeout error 809). Varios usuarios de contabilidad reportan el mismo inconveniente.',
    categoria: 'Redes',
    prioridad: 'Crítica',
    estado: 'En Proceso',
    solicitante: 'Marcela Gómez (Contabilidad)',
    tecnicoAsignado: 'Ing. Carlos Ramos',
    fechaCreacion: '2026-07-10T08:30:00.000Z',
    fechaActualizacion: '2026-07-11T10:15:00.000Z',
    syncStatus: 'Sincronizado'
  },
  {
    codigo: 'INC-1002',
    titulo: 'Impresora multifunción del 3er piso no responde',
    descripcion: 'La impresora HP LaserJet del departamento de Recursos Humanos muestra luz roja parpadeando y mensaje "Atasco de papel en bandeja 2", aunque no se observa papel atorado físicamente.',
    categoria: 'Hardware',
    prioridad: 'Media',
    estado: 'Abierta',
    solicitante: 'Roberto Fernández (RRHH)',
    tecnicoAsignado: null,
    fechaCreacion: '2026-07-11T09:12:00.000Z',
    fechaActualizacion: '2026-07-11T09:12:00.000Z',
    syncStatus: 'Sincronizado'
  },
  {
    codigo: 'INC-1003',
    titulo: 'Solicitud de acceso al portal de Facturación ERP',
    descripcion: 'El nuevo analista financiero requiere credenciales de usuario y rol de auditoría para el módulo de facturación electrónica y reportes fiscales en el ERP central.',
    categoria: 'Accesos / Cuentas',
    prioridad: 'Alta',
    estado: 'Abierta',
    solicitante: 'Elena Torres (Finanzas)',
    tecnicoAsignado: 'Lic. Ana Martínez',
    fechaCreacion: '2026-07-11T11:45:00.000Z',
    fechaActualizacion: '2026-07-11T14:20:00.000Z',
    syncStatus: 'Sincronizado'
  },
  {
    codigo: 'INC-1004',
    titulo: 'Actualización de licencia Office 365 caducada',
    descripcion: 'Al abrir Microsoft Excel en el equipo portátil asignado a Ventas se muestra un aviso de que la suscripción ha expirado, bloqueando la edición de documentos y tablas dinámicas.',
    categoria: 'Software',
    prioridad: 'Alta',
    estado: 'Resuelta',
    solicitante: 'Diego Navarro (Ventas)',
    tecnicoAsignado: 'Ing. Carlos Ramos',
    fechaCreacion: '2026-07-09T14:00:00.000Z',
    fechaActualizacion: '2026-07-10T16:30:00.000Z',
    syncStatus: 'Sincronizado'
  },
  {
    codigo: 'INC-1005',
    titulo: 'Monitor adicional parpadea y se apaga intermitentemente',
    descripcion: 'El segundo monitor Dell 24 pulgadas conectado por HDMI al dock station parpadea de forma constante al abrir varias ventanas gráficas pesadas.',
    categoria: 'Hardware',
    prioridad: 'Baja',
    estado: 'En Proceso',
    solicitante: 'Valeria López (Diseño)',
    tecnicoAsignado: 'Téc. Fernando Ruiz',
    fechaCreacion: '2026-07-11T16:10:00.000Z',
    fechaActualizacion: '2026-07-12T09:00:00.000Z',
    syncStatus: 'Sincronizado'
  },
  {
    codigo: 'INC-1006',
    titulo: 'Error 500 al generar reporte de asistencia mensual',
    descripcion: 'En el sistema web interno de asistencias, al pulsar el botón Exportar a PDF del mes actual la pantalla queda en blanco y en consola aparece Internal Server Error 500.',
    categoria: 'Software',
    prioridad: 'Crítica',
    estado: 'Abierta',
    solicitante: 'Javier Morales (Auditoría Interna)',
    tecnicoAsignado: 'Lic. Ana Martínez',
    fechaCreacion: '2026-07-12T08:05:00.000Z',
    fechaActualizacion: '2026-07-12T08:05:00.000Z',
    syncStatus: 'Sincronizado'
  }
];
