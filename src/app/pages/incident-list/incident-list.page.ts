import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonContent, IonButtons, IonButton, IonIcon, 
  AlertController, ActionSheetController 
} from '@ionic/angular/standalone';
import { IncidentService } from '../../services/incident.service';
import { SqliteService } from '../../database/sqlite.service';
import { Incident, INCIDENT_CATEGORIES, INCIDENT_PRIORITIES, IncidentPriority, IncidentCategory } from '../../models/incident.model';

@Component({
  selector: 'app-incident-list',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="navbar-toolbar">
        <div class="header-content">
          <h1 class="navbar-title">Mesa de Ayuda - Incidencias Tecnológicas</h1>
          <ion-buttons slot="end">
            <ion-button (click)="openDbOptions()" class="db-status-btn" title="Opciones SQLite">
              <ion-icon slot="start" name="server" [color]="sqlite.isReady() ? 'success' : 'warning'"></ion-icon>
              <span>{{ sqlite.isReady() ? 'SQLite OK' : 'Conectando...' }}</span>
            </ion-button>
          </ion-buttons>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content>
      <div class="page-container">
        <!-- LEFT COLUMN: REGISTER FORM CARD -->
        <div class="sidebar-column">
          <div class="white-card form-card">
            <h2 class="form-title">Registrar Incidencia</h2>
            
            <form (ngSubmit)="saveIncident()">
              <div class="field-group">
                <label class="field-label">Título de la incidencia:</label>
                <input 
                  type="text" 
                  class="clean-input" 
                  placeholder="Ej. Fallo en servidor" 
                  [(ngModel)]="newTitulo" 
                  name="titulo" 
                  required />
              </div>

              <div class="field-group">
                <label class="field-label">Descripción detallada:</label>
                <textarea 
                  class="clean-textarea" 
                  rows="4" 
                  placeholder="Describe el problema..." 
                  [(ngModel)]="newDescripcion" 
                  name="descripcion" 
                  required></textarea>
              </div>

              <div class="field-group">
                <label class="field-label">Prioridad:</label>
                <select class="clean-select" [(ngModel)]="newPrioridad" name="prioridad">
                  <option value="" disabled selected>Seleccione...</option>
                  <option *ngFor="let pri of priorities" [value]="pri">{{ pri }}</option>
                </select>
              </div>

              <div class="field-group">
                <label class="field-label">Categoría (Opcional):</label>
                <select class="clean-select" [(ngModel)]="newCategoria" name="categoria">
                  <option *ngFor="let cat of categories" [value]="cat">{{ cat }}</option>
                </select>
              </div>

              <button type="submit" class="clean-btn-blue submit-btn">
                Guardar Incidencia
              </button>
            </form>
          </div>
        </div>

        <!-- RIGHT COLUMN: SEARCH + CARDS GRID -->
        <div class="main-column">
          <!-- Top Search & Filter Bar -->
          <div class="search-filter-row">
            <input 
              type="text" 
              class="clean-input search-input" 
              placeholder="Buscar por título..." 
              [value]="incidentService.searchTerm()"
              (input)="onSearchInput($event)" />

            <select class="clean-select filter-select" [value]="incidentService.selectedPriority()" (change)="onPriorityFilter($event)">
              <option value="Todas">Todas las prioridades</option>
              <option *ngFor="let pri of priorities" [value]="pri">Prioridad: {{ pri }}</option>
            </select>
          </div>

          <!-- Incidents Cards Grid -->
          <div class="incidents-grid" *ngIf="incidentService.filteredIncidents().length > 0; else emptyState">
            <div 
              class="white-card incident-card" 
              *ngFor="let item of incidentService.filteredIncidents()"
              [ngClass]="getBorderClass(item.prioridad)">
              
              <h3 class="card-title">{{ item.titulo }}</h3>
              
              <div class="badge-box">
                <span class="pill-priority" [ngClass]="getBgClass(item.prioridad)">
                  Prioridad: {{ item.prioridad }}
                </span>
              </div>

              <p class="status-text">
                <strong>Estado:</strong> {{ item.estado }}
              </p>

              <p class="date-text">{{ formatSimpleDate(item.fechaCreacion) }}</p>

              <button type="button" class="btn-outline-blue" (click)="openDetail(item)">
                Ver Detalle
              </button>
            </div>
          </div>

          <!-- Empty State -->
          <ng-template #emptyState>
            <div class="white-card empty-card">
              <ion-icon name="folder-open-outline" style="font-size: 48px; color: #a0aec0;"></ion-icon>
              <h3>No se encontraron incidencias</h3>
              <p>Intenta cambiar los filtros de búsqueda o registra una nueva incidencia en el panel izquierdo.</p>
              <button type="button" class="clean-btn-blue" style="max-width: 200px; margin-top: 10px;" (click)="resetFilters()">
                Mostrar Todas
              </button>
            </div>
          </ng-template>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .navbar-toolbar {
      --background: #2c3e50;
      color: white;
    }
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      max-width: 1300px;
      margin: 0 auto;
      padding: 0 16px;
      width: 100%;
      height: 64px;
    }
    .navbar-title {
      font-size: 1.4rem;
      font-weight: 700;
      color: white;
      margin: 0;
    }
    .db-status-btn {
      --color: #ffffff;
      font-size: 0.8rem;
      --background: rgba(255, 255, 255, 0.1);
      --border-radius: 6px;
    }

    .page-container {
      display: grid;
      grid-template-columns: 340px 1fr;
      gap: 24px;
      max-width: 1300px;
      margin: 0 auto;
      padding: 24px 16px 60px;
    }
    @media (max-width: 860px) {
      .page-container {
        grid-template-columns: 1fr;
      }
    }

    /* LEFT FORM CARD */
    .form-card {
      position: sticky;
      top: 24px;
    }
    .form-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 18px;
    }
    .field-group {
      margin-bottom: 14px;
    }
    .field-label {
      display: block;
      font-size: 0.85rem;
      font-weight: 600;
      color: #4a5568;
      margin-bottom: 6px;
    }
    .submit-btn {
      margin-top: 10px;
    }

    /* RIGHT COLUMN */
    .search-filter-row {
      display: flex;
      gap: 14px;
      margin-bottom: 20px;
    }
    @media (max-width: 600px) {
      .search-filter-row {
        flex-direction: column;
      }
    }
    .search-input {
      flex: 1;
    }
    .filter-select {
      width: 230px;
      flex-shrink: 0;
    }
    @media (max-width: 600px) {
      .filter-select { width: 100%; }
    }

    .incidents-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 18px;
    }

    .incident-card {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .card-title {
      font-size: 1.1rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 0 0 10px;
      line-height: 1.35;
    }
    .badge-box {
      margin-bottom: 8px;
    }
    .status-text {
      font-size: 0.9rem;
      color: #4a5568;
      margin: 6px 0 4px;
    }
    .date-text {
      font-size: 0.82rem;
      color: #718096;
      margin: 0 0 10px;
    }

    .empty-card {
      text-align: center;
      padding: 40px 20px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
    }
  `],
  imports: [
    CommonModule, 
    FormsModule, 
    IonHeader, 
    IonToolbar, 
    IonContent, 
    IonButtons, 
    IonButton, 
    IonIcon
  ]
})
export class IncidentListPage implements OnInit {
  sqlite = inject(SqliteService);
  incidentService = inject(IncidentService);
  private router = inject(Router);
  private actionSheetCtrl = inject(ActionSheetController);
  private alertCtrl = inject(AlertController);

  categories = INCIDENT_CATEGORIES;
  priorities = INCIDENT_PRIORITIES;

  newTitulo: string = '';
  newDescripcion: string = '';
  newPrioridad: any = 'Media';
  newCategoria: any = 'Software';

  async ngOnInit() {
    await this.incidentService.findAll();
  }

  onSearchInput(event: any) {
    this.incidentService.searchTerm.set(event.target.value || '');
  }

  onPriorityFilter(event: any) {
    this.incidentService.selectedPriority.set(event.target.value);
  }

  resetFilters() {
    this.incidentService.searchTerm.set('');
    this.incidentService.selectedPriority.set('Todas');
  }

  async saveIncident() {
    if (!this.newTitulo.trim() || !this.newDescripcion.trim()) {
      const alert = await this.alertCtrl.create({
        header: 'Formulario Incompleto',
        message: 'Por favor completa el título y la descripción de la incidencia.',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    await this.incidentService.create({
      titulo: this.newTitulo.trim(),
      descripcion: this.newDescripcion.trim(),
      categoria: (this.newCategoria as IncidentCategory) || 'Software',
      prioridad: (this.newPrioridad as IncidentPriority) || 'Media',
      estado: 'Abierta',
      solicitante: 'Usuario Local'
    });

    this.newTitulo = '';
    this.newDescripcion = '';
    this.newPrioridad = 'Media';
    this.newCategoria = 'Software';
  }

  openDetail(item: Incident) {
    this.router.navigate(['/incidents', item.id]);
  }

  async openDbOptions() {
    const actionSheet = await this.actionSheetCtrl.create({
      header: 'Persistencia Local SQLite • Opciones',
      subHeader: `Estado: ${this.sqlite.dbStatusMessage()} (${this.sqlite.platform()})`,
      buttons: [
        {
          text: '📊 Ver Estadísticas de Base de Datos',
          handler: async () => {
            const stats = await this.sqlite.getTableStats();
            const alert = await this.alertCtrl.create({
              header: 'Diagnóstico SQLite',
              message: `<b>Total Registros:</b> ${stats.totalRows}<br><b>En curso / Abiertas:</b> ${stats.openCount}`,
              buttons: ['OK']
            });
            await alert.present();
          }
        },
        {
          text: '🔄 Restaurar Datos Semilla de Ejemplo',
          handler: async () => {
            await this.incidentService.resetSeedData();
          }
        },
        {
          text: 'Cancelar',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  getBorderClass(pri: string): string {
    switch(pri) {
      case 'Crítica':
      case 'Alta': return 'border-alta';
      case 'Media': return 'border-media';
      default: return 'border-baja';
    }
  }

  getBgClass(pri: string): string {
    switch(pri) {
      case 'Crítica':
      case 'Alta': return 'bg-alta';
      case 'Media': return 'bg-media';
      default: return 'bg-baja';
    }
  }

  formatSimpleDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      const yyyy = d.getFullYear();
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const dd = String(d.getDate()).padStart(2, '0');
      return `${yyyy}-${mm}-${dd}`;
    } catch {
      return dateStr;
    }
  }
}
