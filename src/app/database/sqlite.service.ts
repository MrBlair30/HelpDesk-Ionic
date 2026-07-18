import { Injectable, signal, inject, NgZone } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { CapacitorSQLite, SQLiteConnection, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { INCIDENCIAS_SCHEMA_SQL } from './schema.sql';
import { SEED_INCIDENTS } from './seed-data';
import { Incident } from '../models/incident.model';

@Injectable({
  providedIn: 'root'
})
export class SqliteService {
  private sqlite: SQLiteConnection;
  private db!: SQLiteDBConnection;
  private dbName = 'helpdesk_db';
  private ngZone = inject(NgZone);

  readonly isReady = signal<boolean>(false);
  readonly dbStatusMessage = signal<string>('Inicializando SQLite...');
  readonly platform = signal<string>(Capacitor.getPlatform());

  constructor() {
    this.sqlite = new SQLiteConnection(CapacitorSQLite);
  }

  async initializeDatabase(): Promise<boolean> {
    try {
      this.dbStatusMessage.set('Detectando plataforma...');
      if (this.platform() === 'web') {
        await this.initWebSqlite();
      }

      this.dbStatusMessage.set('Estableciendo conexión a SQLite...');
      this.db = await this.sqlite.createConnection(
        this.dbName,
        false,
        'no-encryption',
        1,
        false
      );

      await this.db.open();

      this.dbStatusMessage.set('Creando esquema de base de datos...');
      await this.db.execute(INCIDENCIAS_SCHEMA_SQL);

      this.dbStatusMessage.set('Verificando datos iniciales...');
      await this.checkAndSeedData();

      if (this.platform() === 'web') {
        await this.sqlite.saveToStore(this.dbName);
      }

      this.isReady.set(true);
      this.dbStatusMessage.set('SQLite Operativo');
      return true;
    } catch (error: any) {
      console.error('Error al inicializar la base de datos SQLite:', error);
      this.dbStatusMessage.set(`Error SQLite: ${error?.message || error}`);
      return false;
    }
  }

  private async initWebSqlite(): Promise<void> {
    try {
      await this.ngZone.runOutsideAngular(async () => {
        const jeepEl = document.querySelector('jeep-sqlite');
        if (!jeepEl) {
          const { defineCustomElements } = await import('jeep-sqlite/loader');
          defineCustomElements(window);
          const jeepSqlite = document.createElement('jeep-sqlite');
          document.body.appendChild(jeepSqlite);
          await customElements.whenDefined('jeep-sqlite');
        }
        await this.sqlite.initWebStore();
      });
    } catch (err) {
      console.error('Error en initWebSqlite:', err);
      throw err;
    }
  }

  private async checkAndSeedData(): Promise<void> {
    const res = await this.db.query('SELECT COUNT(*) as total FROM incidencias');
    const total = res.values && res.values[0] ? res.values[0].total : 0;

    if (total === 0) {
      this.dbStatusMessage.set('Insertando registros semilla...');
      for (const item of SEED_INCIDENTS) {
        await this.insertSeedIncident(item);
      }
    }
  }

  private async insertSeedIncident(item: Incident): Promise<void> {
    const sql = `
      INSERT INTO incidencias (
        codigo, titulo, descripcion, categoria, prioridad, estado, solicitante, tecnicoAsignado, fechaCreacion, fechaActualizacion
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      item.codigo,
      item.titulo,
      item.descripcion,
      item.categoria,
      item.prioridad,
      item.estado,
      item.solicitante,
      item.tecnicoAsignado || null,
      item.fechaCreacion,
      item.fechaActualizacion
    ];
    await this.db.run(sql, values);
  }

  async query(sql: string, params: any[] = []): Promise<any[]> {
    if (!this.db) {
      throw new Error('La base de datos SQLite no ha sido inicializada.');
    }
    const res = await this.db.query(sql, params);
    return res.values || [];
  }

  async run(sql: string, params: any[] = []): Promise<any> {
    if (!this.db) {
      throw new Error('La base de datos SQLite no ha sido inicializada.');
    }
    const res = await this.db.run(sql, params);
    if (this.platform() === 'web') {
      await this.sqlite.saveToStore(this.dbName);
    }
    return res;
  }

  async resetAndSeedDatabase(): Promise<void> {
    if (!this.db) {
      throw new Error('La base de datos SQLite no ha sido inicializada.');
    }
    this.isReady.set(false);
    this.dbStatusMessage.set('Reiniciando base de datos y datos semilla...');
    await this.db.execute('DROP TABLE IF EXISTS incidencias;');
    await this.db.execute(INCIDENCIAS_SCHEMA_SQL);
    for (const item of SEED_INCIDENTS) {
      await this.insertSeedIncident(item);
    }
    if (this.platform() === 'web') {
      await this.sqlite.saveToStore(this.dbName);
    }
    this.isReady.set(true);
    this.dbStatusMessage.set('Datos semilla restaurados con éxito');
  }

  async getTableStats(): Promise<{ totalRows: number; openCount: number }> {
    if (!this.db || !this.isReady()) {
      return { totalRows: 0, openCount: 0 };
    }
    const totalRes = await this.query('SELECT COUNT(*) as total FROM incidencias');
    const openRes = await this.query("SELECT COUNT(*) as openCount FROM incidencias WHERE estado != 'Cerrada' AND estado != 'Resuelta'");
    return {
      totalRows: totalRes[0]?.total || 0,
      openCount: openRes[0]?.openCount || 0
    };
  }

  async close(): Promise<void> {
    if (this.db) {
      await this.db.close();
      await this.sqlite.closeConnection(this.dbName, false);
    }
  }
}
