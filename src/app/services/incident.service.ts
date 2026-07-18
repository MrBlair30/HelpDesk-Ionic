import { Injectable, computed, inject, signal } from '@angular/core';
import { LocalRepository } from '../repositories/local.repository';
import { RemoteRepository } from '../repositories/remote.repository';
import { Incident, CreateIncidentDto, UpdateIncidentDto, IncidentCategory, IncidentPriority, IncidentStatus } from '../models/incident.model';

@Injectable({
  providedIn: 'root'
})
export class IncidentService {
  private localRepo = inject(LocalRepository);
  private remoteRepo = inject(RemoteRepository);

  readonly incidents = signal<Incident[]>([]);
  readonly isLoading = signal<boolean>(false);
  readonly isSyncing = signal<boolean>(false);
  readonly searchTerm = signal<string>('');
  readonly selectedCategory = signal<IncidentCategory | 'Todas'>('Todas');
  readonly selectedPriority = signal<IncidentPriority | 'Todas'>('Todas');
  readonly selectedStatus = signal<IncidentStatus | 'Todos'>('Todos');

  readonly filteredIncidents = computed(() => {
    const list = this.incidents();
    const term = this.searchTerm().toLowerCase().trim();
    const cat = this.selectedCategory();
    const pri = this.selectedPriority();
    const st = this.selectedStatus();

    return list.filter(item => {
      const matchTerm = !term || 
        item.codigo.toLowerCase().includes(term) || 
        item.titulo.toLowerCase().includes(term) || 
        item.solicitante.toLowerCase().includes(term) ||
        item.descripcion.toLowerCase().includes(term);

      const matchCat = cat === 'Todas' || item.categoria === cat;
      const matchPri = pri === 'Todas' || item.prioridad === pri;
      const matchSt = st === 'Todos' || item.estado === st;

      return matchTerm && matchCat && matchPri && matchSt;
    });
  });

  readonly stats = computed(() => {
    const list = this.incidents();
    const total = list.length;
    const abiertas = list.filter(i => i.estado === 'Abierta').length;
    const enProceso = list.filter(i => i.estado === 'En Proceso').length;
    const resueltas = list.filter(i => i.estado === 'Resuelta').length;
    const criticas = list.filter(i => i.prioridad === 'Crítica' && i.estado !== 'Cerrada' && i.estado !== 'Resuelta').length;

    return { total, abiertas, enProceso, resueltas, criticas };
  });

  async findAll(): Promise<Incident[]> {
    this.isLoading.set(true);
    try {
      // 1. Mostrar informacion local primero (Offline-First)
      const localData = await this.localRepo.findAll();
      this.incidents.set(localData);

      // 2. Refrescar desde la API en segundo plano
      this.fetchRemoteAndUpdateLocal();
      
      return localData;
    } catch (err) {
      console.error('Error en findAll:', err);
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  private async fetchRemoteAndUpdateLocal(): Promise<void> {
    try {
      const remoteData = await this.remoteRepo.findAll();
      for (const item of remoteData) {
        await this.localRepo.save(item);
      }
      const updatedLocalData = await this.localRepo.findAll();
      this.incidents.set(updatedLocalData);
    } catch (err) {
      console.warn('No se pudo obtener informacion del servidor. Trabajando en modo offline.');
    }
  }

  async findById(id: number): Promise<Incident | null> {
    // Para simplificar, buscamos en memoria, ya que findAll carga todo
    const current = this.incidents().find(i => i.id === id);
    return current || null;
  }

  async create(dto: CreateIncidentDto): Promise<Incident | null> {
    this.isLoading.set(true);
    try {
      let codigo = dto.codigo;
      if (!codigo) {
        const countRes = await this.localRepo.findAll();
        let maxId = 0;
        for (const item of countRes) {
          if (item.codigo && item.codigo.startsWith('INC-')) {
            const num = parseInt(item.codigo.replace('INC-', ''), 10);
            if (!isNaN(num) && num > maxId) {
              maxId = num;
            }
          }
        }
        codigo = `INC-${(maxId + 1).toString().padStart(3, '0')}`;
      }

      const now = new Date().toISOString();
      const newIncident: Incident = {
        codigo,
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        categoria: dto.categoria,
        prioridad: dto.prioridad,
        estado: dto.estado,
        solicitante: dto.solicitante,
        tecnicoAsignado: dto.tecnicoAsignado || null,
        fechaCreacion: now,
        fechaActualizacion: now,
        syncStatus: 'Pendiente'
      };

      // Guardar localmente
      await this.localRepo.save(newIncident);
      await this.refreshLocalData();

      // Intentar guardar en remoto
      this.syncIncident(newIncident);

      return newIncident;
    } catch (err) {
      console.error('Error en create:', err);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async update(id: number, dto: UpdateIncidentDto): Promise<boolean> {
    this.isLoading.set(true);
    try {
      const current = await this.findById(id);
      if (!current) throw new Error(`Incidencia no encontrada.`);

      const updated: Incident = {
        ...current,
        ...dto,
        fechaActualizacion: new Date().toISOString(),
        syncStatus: 'Pendiente'
      };

      // Guardar localmente
      await this.localRepo.save(updated);
      await this.refreshLocalData();

      // Intentar actualizar en remoto
      this.syncIncident(updated);

      return true;
    } catch (err) {
      console.error(`Error en update:`, err);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async delete(id: number): Promise<boolean> {
    this.isLoading.set(true);
    try {
      const current = await this.findById(id);
      if (!current) return false;

      // Eliminamos localmente
      await this.localRepo.deleteByCodigo(current.codigo);
      await this.refreshLocalData();

      // Eliminamos en el remoto
      try {
        await this.remoteRepo.delete(current.codigo);
      } catch (err) {
        // En un offline-first mas avanzado, guardariamos una cola de eliminaciones pendientes
        console.warn('No se pudo eliminar remotamente', err);
      }

      return true;
    } catch (err) {
      console.error(`Error en delete:`, err);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  private async syncIncident(incident: Incident): Promise<void> {
    try {
      // Intentamos sincronizar el registro especifico
      await this.remoteRepo.sync([incident]);
      // Si fue exitoso, actualizamos estado local
      incident.syncStatus = 'Sincronizado';
      await this.localRepo.save(incident);
      await this.refreshLocalData();
    } catch (err: any) {
      console.warn('Sincronizacion remota fallida. El registro queda como Pendiente.', err);
      // Agregar alert visual para ver el error real en el movil
      if (err && err.message) {
        alert('Error de sincronizacion: ' + err.message);
      } else {
        alert('Error de sincronizacion: ' + JSON.stringify(err));
      }
    }
  }

  async syncAllPending(): Promise<void> {
    this.isSyncing.set(true);
    try {
      const pending = await this.localRepo.findPending();
      if (pending.length > 0) {
        const success = await this.remoteRepo.sync(pending);
        if (success) {
          for (const item of pending) {
            item.syncStatus = 'Sincronizado';
            await this.localRepo.save(item);
          }
          await this.refreshLocalData();
        }
      }
    } catch (err) {
      console.error('Error durante la sincronizacion manual:', err);
    } finally {
      this.isSyncing.set(false);
    }
  }

  private async refreshLocalData(): Promise<void> {
    const data = await this.localRepo.findAll();
    this.incidents.set(data);
  }
}
