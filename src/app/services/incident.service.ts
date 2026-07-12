import { Injectable, computed, inject, signal } from '@angular/core';
import { SqliteService } from '../database/sqlite.service';
import { Incident, CreateIncidentDto, UpdateIncidentDto, IncidentCategory, IncidentPriority, IncidentStatus } from '../models/incident.model';

@Injectable({
  provided: 'root'
})
export class IncidentService {
  private sqlite = inject(SqliteService);

  readonly incidents = signal<Incident[]>([]);
  readonly isLoading = signal<boolean>(false);
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
      if (!this.sqlite.isReady()) {
        await this.sqlite.initializeDatabase();
      }
      const rows = await this.sqlite.query('SELECT * FROM incidencias ORDER BY id DESC');
      this.incidents.set(rows as Incident[]);
      return rows as Incident[];
    } catch (err) {
      console.error('Error en findAll:', err);
      return [];
    } finally {
      this.isLoading.set(false);
    }
  }

  async findById(id: number): Promise<Incident | null> {
    try {
      if (!this.sqlite.isReady()) {
        await this.sqlite.initializeDatabase();
      }
      const rows = await this.sqlite.query('SELECT * FROM incidencias WHERE id = ?', [id]);
      if (rows && rows.length > 0) {
        return rows[0] as Incident;
      }
      return null;
    } catch (err) {
      console.error(`Error en findById(${id}):`, err);
      return null;
    }
  }

  async create(dto: CreateIncidentDto): Promise<Incident | null> {
    this.isLoading.set(true);
    try {
      if (!this.sqlite.isReady()) {
        await this.sqlite.initializeDatabase();
      }

      // Generar código único INC-XXXX
      let codigo = dto.codigo;
      if (!codigo) {
        const countRes = await this.sqlite.query('SELECT MAX(id) as maxId FROM incidencias');
        const nextNum = ((countRes[0]?.maxId || 1006) + 1);
        codigo = `INC-${nextNum}`;
      }

      const now = new Date().toISOString();
      const sql = `
        INSERT INTO incidencias (
          codigo, titulo, descripcion, categoria, prioridad, estado, solicitante, tecnicoAsignado, fechaCreacion, fechaActualizacion
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        codigo,
        dto.titulo,
        dto.descripcion,
        dto.categoria,
        dto.prioridad,
        dto.estado,
        dto.solicitante,
        dto.tecnicoAsignado || null,
        now,
        now
      ];

      await this.sqlite.run(sql, params);
      await this.findAll();

      const newRecord = await this.sqlite.query('SELECT * FROM incidencias WHERE codigo = ?', [codigo]);
      return newRecord[0] || null;
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
      if (!this.sqlite.isReady()) {
        await this.sqlite.initializeDatabase();
      }

      const current = await this.findById(id);
      if (!current) {
        throw new Error(`Incidencia con ID ${id} no encontrada.`);
      }

      const updated: Incident = {
        ...current,
        ...dto,
        fechaActualizacion: new Date().toISOString()
      };

      const sql = `
        UPDATE incidencias SET
          titulo = ?,
          descripcion = ?,
          categoria = ?,
          prioridad = ?,
          estado = ?,
          solicitante = ?,
          tecnicoAsignado = ?,
          fechaActualizacion = ?
        WHERE id = ?
      `;
      const params = [
        updated.titulo,
        updated.descripcion,
        updated.categoria,
        updated.prioridad,
        updated.estado,
        updated.solicitante,
        updated.tecnicoAsignado || null,
        updated.fechaActualizacion,
        id
      ];

      await this.sqlite.run(sql, params);
      await this.findAll();
      return true;
    } catch (err) {
      console.error(`Error en update(${id}):`, err);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async delete(id: number): Promise<boolean> {
    this.isLoading.set(true);
    try {
      if (!this.sqlite.isReady()) {
        await this.sqlite.initializeDatabase();
      }
      await this.sqlite.run('DELETE FROM incidencias WHERE id = ?', [id]);
      await this.findAll();
      return true;
    } catch (err) {
      console.error(`Error en delete(${id}):`, err);
      throw err;
    } finally {
      this.isLoading.set(false);
    }
  }

  async resetSeedData(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.sqlite.resetAndSeedDatabase();
      await this.findAll();
    } finally {
      this.isLoading.set(false);
    }
  }
}
