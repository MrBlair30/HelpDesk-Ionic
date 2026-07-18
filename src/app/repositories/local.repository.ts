import { Injectable, inject } from '@angular/core';
import { SqliteService } from '../database/sqlite.service';
import { Incident } from '../models/incident.model';

@Injectable({
  providedIn: 'root'
})
export class LocalRepository {
  private sqlite = inject(SqliteService);

  async findAll(): Promise<Incident[]> {
    if (!this.sqlite.isReady()) await this.sqlite.initializeDatabase();
    const rows = await this.sqlite.query('SELECT * FROM incidencias ORDER BY id DESC');
    return rows as Incident[];
  }

  async findPending(): Promise<Incident[]> {
    if (!this.sqlite.isReady()) await this.sqlite.initializeDatabase();
    const rows = await this.sqlite.query("SELECT * FROM incidencias WHERE syncStatus = 'Pendiente' OR syncStatus = 'Error'");
    return rows as Incident[];
  }

  async findByCodigo(codigo: string): Promise<Incident | null> {
    if (!this.sqlite.isReady()) await this.sqlite.initializeDatabase();
    const rows = await this.sqlite.query('SELECT * FROM incidencias WHERE codigo = ?', [codigo]);
    return rows && rows.length > 0 ? (rows[0] as Incident) : null;
  }

  async save(incident: Incident): Promise<void> {
    if (!this.sqlite.isReady()) await this.sqlite.initializeDatabase();
    
    const existing = await this.findByCodigo(incident.codigo);
    
    if (existing) {
      const sql = `
        UPDATE incidencias SET
          titulo = ?, descripcion = ?, categoria = ?, prioridad = ?,
          estado = ?, solicitante = ?, tecnicoAsignado = ?,
          fechaActualizacion = ?, syncStatus = ?
        WHERE codigo = ?
      `;
      const params = [
        incident.titulo, incident.descripcion, incident.categoria, incident.prioridad,
        incident.estado, incident.solicitante, incident.tecnicoAsignado || null,
        incident.fechaActualizacion, incident.syncStatus || 'Sincronizado', incident.codigo
      ];
      await this.sqlite.run(sql, params);
    } else {
      const sql = `
        INSERT INTO incidencias (
          codigo, titulo, descripcion, categoria, prioridad, estado, solicitante, tecnicoAsignado, fechaCreacion, fechaActualizacion, syncStatus
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      const params = [
        incident.codigo, incident.titulo, incident.descripcion, incident.categoria,
        incident.prioridad, incident.estado, incident.solicitante, incident.tecnicoAsignado || null,
        incident.fechaCreacion, incident.fechaActualizacion, incident.syncStatus || 'Sincronizado'
      ];
      await this.sqlite.run(sql, params);
    }
  }

  async deleteByCodigo(codigo: string): Promise<void> {
    if (!this.sqlite.isReady()) await this.sqlite.initializeDatabase();
    await this.sqlite.run('DELETE FROM incidencias WHERE codigo = ?', [codigo]);
  }
}
