export type IncidentCategory = 
  | 'Soporte Técnico' 
  | 'Hardware' 
  | 'Software' 
  | 'Redes' 
  | 'Accesos / Cuentas';

export type IncidentPriority = 'Baja' | 'Media' | 'Alta' | 'Crítica';

export type IncidentStatus = 'Abierta' | 'En Proceso' | 'Resuelta' | 'Cerrada';

export type SyncStatus = 'Pendiente' | 'Sincronizado' | 'Error' | 'Eliminado';

export interface Incident {
  id?: number;
  codigo: string;
  titulo: string;
  descripcion: string;
  categoria: IncidentCategory;
  prioridad: IncidentPriority;
  estado: IncidentStatus;
  solicitante: string;
  tecnicoAsignado?: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  syncStatus?: SyncStatus;
}

export type CreateIncidentDto = Omit<Incident, 'id' | 'codigo' | 'fechaCreacion' | 'fechaActualizacion'> & {
  codigo?: string;
  tecnicoAsignado?: string | null;
};

export type UpdateIncidentDto = Partial<Incident>;

export const INCIDENT_CATEGORIES: IncidentCategory[] = [
  'Soporte Técnico',
  'Hardware',
  'Software',
  'Redes',
  'Accesos / Cuentas'
];

export const INCIDENT_PRIORITIES: IncidentPriority[] = [
  'Baja',
  'Media',
  'Alta',
  'Crítica'
];

export const INCIDENT_STATUSES: IncidentStatus[] = [
  'Abierta',
  'En Proceso',
  'Resuelta',
  'Cerrada'
];

export const PRIORITY_CONFIG: Record<IncidentPriority, { color: string; icon: string; label: string }> = {
  'Crítica': { color: 'danger', icon: 'alert-circle', label: 'Crítica' },
  'Alta': { color: 'warning', icon: 'warning', label: 'Alta' },
  'Media': { color: 'primary', icon: 'information-circle', label: 'Media' },
  'Baja': { color: 'success', icon: 'checkmark-circle', label: 'Baja' }
};

export const STATUS_CONFIG: Record<IncidentStatus, { color: string; icon: string; label: string }> = {
  'Abierta': { color: 'tertiary', icon: 'folder-open', label: 'Abierta' },
  'En Proceso': { color: 'warning', icon: 'time', label: 'En Proceso' },
  'Resuelta': { color: 'success', icon: 'checkmark-done-circle', label: 'Resuelta' },
  'Cerrada': { color: 'medium', icon: 'lock-closed', label: 'Cerrada' }
};
