import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonButton, IonIcon, 
  IonSearchbar, IonSegment, IonSegmentButton, IonLabel, IonFab, IonFabButton, 
  IonCard, IonCardContent, IonBadge, IonChip, ModalController, AlertController, ActionSheetController 
} from '@ionic/angular/standalone';
import { IncidentService } from '../../services/incident.service';
import { SqliteService } from '../../database/sqlite.service';
import { IncidentFormModalComponent } from '../../components/incident-form-modal/incident-form-modal.component';
import { Incident, INCIDENT_CATEGORIES, INCIDENT_PRIORITIES, INCIDENT_STATUSES, PRIORITY_CONFIG, STATUS_CONFIG } from '../../models/incident.model';

@Component({
  selector: 'app-incident-list',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="header-toolbar">
        <div class="header-container" slot="start">
          <div class="logo-box">
            <ion-icon name="shield-checkmark" color="primary"></ion-icon>
          </div>
          <div>
            <h1 class="app-title">Mesa de Ayuda</h1>
            <span class="app-subtitle">Gestión de Incidencias • SQLite</span>
          </div>
        </div>

        <ion-buttons slot="end">
          <ion-button (click)="openDbOptions()" class="db-status-btn">
            <ion-icon slot="start" name="server" [color]="sqlite.isReady() ? 'success' : 'warning'"></ion-icon>
            <span class="db-label">{{ sqlite.isReady() ? 'SQLite OK' : 'Conectando...' }}</span>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="main-content">
      <!-- DASHBOARD METRICS CARDS -->
      <div class="metrics-grid">
        <div class="metric-card glass-card blue-glow" (click)="filterByStatus('Todos')">
          <div class="metric-icon-box blue-box">
            <ion-icon name="layers"></ion-icon>
          </div>
          <div class="metric-info">
            <span class="metric-val">{{ incidentService.stats().total }}</span>
            <span class="metric-lbl">Total Tickets</span>
          </div>
        </div>

        <div class="metric-card glass-card teal-glow" (click)="filterByStatus('Abierta')">
          <div class="metric-icon-box teal-box">
            <ion-icon name="folder-open"></ion-icon>
          </div>
          <div class="metric-info">
            <span class="metric-val">{{ incidentService.stats().abiertas }}</span>
            <span class="metric-lbl">Abiertas</span>
          </div>
        </div>

        <div class="metric-card glass-card amber-glow" (click)="filterByStatus('En Proceso')">
          <div class="metric-icon-box amber-box">
            <ion-icon name="time"></ion-icon>
          </div>
          <div class="metric-info">
            <span class="metric-val">{{ incidentService.stats().enProceso }}</span>
            <span class="metric-lbl">En Proceso</span>
          </div>
        </div>

        <div class="metric-card glass-card green-glow" (click)="filterByStatus('Resuelta')">
          <div class="metric-icon-box green-box">
            <ion-icon name="checkmark-done-circle"></ion-icon>
          </div>
          <div class="metric-info">
            <span class="metric-val">{{ incidentService.stats().resueltas }}</span>
            <span class="metric-lbl">Resueltas</span>
          </div>
        </div>
      </div>

      <!-- SEARCH & FILTERS -->
      <div class="filter-section">
        <ion-searchbar 
          placeholder="Buscar por código, título o usuario..." 
          [value]="incidentService.searchTerm()"
          (ionInput)="onSearch($event)"
          class="custom-searchbar"
          animated="true">
        </ion-searchbar>

        <div class="chips-scroll">
          <span class="filter-lbl">Categoría:</span>
          <ion-chip 
            [color]="incidentService.selectedCategory() === 'Todas' ? 'primary' : 'medium'"
            [outline]="incidentService.selectedCategory() !== 'Todas'"
            (click)="selectCategory('Todas')">
            <ion-label>Todas</ion-label>
          </ion-chip>
          <ion-chip 
            *ngFor="let cat of categories" 
            [color]="incidentService.selectedCategory() === cat ? 'primary' : 'medium'"
            [outline]="incidentService.selectedCategory() !== cat"
            (click)="selectCategory(cat)">
            <ion-label>{{ cat }}</ion-label>
          </ion-chip>
        </div>

        <div class="chips-scroll">
          <span class="filter-lbl">Prioridad:</span>
          <ion-chip 
            [color]="incidentService.selectedPriority() === 'Todas' ? 'primary' : 'medium'"
            [outline]="incidentService.selectedPriority() !== 'Todas'"
            (click)="selectPriority('Todas')">
            <ion-label>Todas</ion-label>
          </ion-chip>
          <ion-chip 
            *ngFor="let pri of priorities" 
            [color]="incidentService.selectedPriority() === pri ? getPriorityColor(pri) : 'medium'"
            [outline]="incidentService.selectedPriority() !== pri"
            (click)="selectPriority(pri)">
            <ion-icon [name]="getPriorityIcon(pri)"></ion-icon>
            <ion-label>{{ pri }}</ion-label>
          </ion-chip>
        </div>
      </div>

      <!-- INCIDENTS LIST -->
      <div class="list-section">
        <div class="list-header">
          <h2 class="section-title">
            Listado de Incidencias 
            <span class="count-badge">{{ incidentService.filteredIncidents().length }}</span>
          </h2>
          <ion-button fill="clear" size="small" (click)="incidentService.findAll()">
            <ion-icon slot="icon-only" name="refresh"></ion-icon>
          </ion-button>
        </div>

        <!-- Empty State -->
        <div class="empty-state glass-card" *ngIf="incidentService.filteredIncidents().length === 0">
          <div class="empty-icon-circle">
            <ion-icon name="folder-open" color="medium"></ion-icon>
          </div>
          <h3>No hay incidencias que mostrar</h3>
          <p>No se encontraron registros que coincidan con los filtros de búsqueda seleccionados.</p>
          <ion-button color="primary" size="small" (click)="resetFilters()">
            Limpiar Filtros
          </ion-button>
        </div>

        <!-- Cards -->
        <div class="incident-card glass-card" *ngFor="let item of incidentService.filteredIncidents()" (click)="openDetail(item)">
          <div class="card-header-row">
            <span class="code-pill">{{ item.codigo }}</span>
            <div class="badges-row">
              <span class="badge-priority" [style.background]="getPriorityBg(item.prioridad)" [style.color]="getPriorityTextColor(item.prioridad)">
                {{ item.prioridad }}
              </span>
              <span class="badge-status" [style.background]="getStatusBg(item.estado)" [style.color]="getStatusTextColor(item.estado)">
                <ion-icon [name]="getStatusIcon(item.estado)" style="vertical-align: -2px; margin-right: 3px;"></ion-icon>
                {{ item.estado }}
              </span>
            </div>
          </div>

          <h3 class="incident-title">{{ item.titulo }}</h3>
          <p class="incident-desc">{{ item.descripcion | slice:0:110 }}{{ item.descripcion.length > 110 ? '...' : '' }}</p>

          <div class="card-footer-row">
            <div class="footer-meta">
              <span class="meta-item">
                <ion-icon name="person" color="medium"></ion-icon>
                {{ item.solicitante }}
              </span>
              <span class="meta-item">
                <ion-icon name="calendar" color="medium"></ion-icon>
                {{ formatDate(item.fechaCreacion) }}
              </span>
            </div>

            <div class="assigned-pill" *ngIf="item.tecnicoAsignado">
              <ion-icon name="build"></ion-icon>
              <span>{{ item.tecnicoAsignado }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- FLOATING ACTION BUTTON -->
      <ion-fab slot="fixed" vertical="bottom" horizontal="end" class="ion-margin">
        <ion-fab-button color="primary" class="custom-fab" (click)="openCreateModal()">
          <ion-icon name="add"></ion-icon>
        </ion-fab-button>
      </ion-fab>
    </ion-content>
  `,
  styles: [`
    .header-container {
      display: flex;
      align-items: center;
      gap: 12px;
      padding-left: 8px;
    }
    .logo-box {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: rgba(14, 165, 233, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24px;
      border: 1px solid rgba(14, 165, 233, 0.3);
    }
    .app-title {
      font-size: 1.15rem;
      font-weight: 800;
      margin: 0;
      color: #f8fafc;
      letter-spacing: -0.3px;
    }
    .app-subtitle {
      font-size: 0.72rem;
      color: #38bdf8;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.8px;
    }
    .db-status-btn {
      --background: rgba(30, 41, 59, 0.8);
      --border-radius: 20px;
      --padding-start: 12px;
      --padding-end: 12px;
      height: 32px;
      font-size: 0.75rem;
      font-weight: 600;
      border: 1px solid rgba(255, 255, 255, 0.1);
    }
    .db-label {
      margin-left: 6px;
      color: #e2e8f0;
    }
    .main-content {
      --background: #0b1120;
    }
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
      padding: 16px;
    }
    @media (min-width: 640px) {
      .metrics-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }
    .metric-card {
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;
    }
    .metric-icon-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 22px;
      flex-shrink: 0;
    }
    .blue-box { background: rgba(14, 165, 233, 0.2); color: #38bdf8; }
    .teal-box { background: rgba(20, 184, 166, 0.2); color: #2dd4bf; }
    .amber-box { background: rgba(245, 158, 11, 0.2); color: #fbbf24; }
    .green-box { background: rgba(16, 185, 129, 0.2); color: #34d399; }

    .metric-info {
      display: flex;
      flex-direction: column;
    }
    .metric-val {
      font-size: 1.4rem;
      font-weight: 800;
      color: #f8fafc;
      line-height: 1.1;
    }
    .metric-lbl {
      font-size: 0.72rem;
      font-weight: 600;
      color: #94a3b8;
    }

    .filter-section {
      padding: 0 16px 8px;
    }
    .custom-searchbar {
      --background: rgba(30, 41, 59, 0.75);
      --border-radius: 14px;
      --color: #f8fafc;
      --placeholder-color: #64748b;
      --icon-color: #38bdf8;
      padding: 0 0 12px 0;
    }
    .chips-scroll {
      display: flex;
      align-items: center;
      overflow-x: auto;
      gap: 6px;
      padding-bottom: 8px;
      scrollbar-width: none;
    }
    .chips-scroll::-webkit-scrollbar {
      display: none;
    }
    .filter-lbl {
      font-size: 0.75rem;
      font-weight: 700;
      color: #64748b;
      white-space: nowrap;
      margin-right: 4px;
    }

    .list-section {
      padding: 8px 16px 80px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .list-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .section-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #e2e8f0;
      margin: 0;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .count-badge {
      background: rgba(14, 165, 233, 0.2);
      color: #38bdf8;
      font-size: 0.75rem;
      padding: 2px 8px;
      border-radius: 20px;
      font-weight: 700;
    }

    .empty-state {
      padding: 40px 20px;
      text-align: center;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 12px;
    }
    .empty-icon-circle {
      width: 64px;
      height: 64px;
      border-radius: 50%;
      background: rgba(100, 116, 139, 0.15);
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 32px;
    }

    .incident-card {
      padding: 16px;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .card-header-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .badges-row {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .incident-title {
      font-size: 1.05rem;
      font-weight: 700;
      color: #f8fafc;
      margin: 0;
      line-height: 1.35;
    }
    .incident-desc {
      font-size: 0.85rem;
      color: #94a3b8;
      margin: 0;
      line-height: 1.5;
    }
    .card-footer-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-top: 8px;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      flex-wrap: wrap;
      gap: 8px;
    }
    .footer-meta {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .meta-item {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.75rem;
      color: #64748b;
      font-weight: 500;
    }
    .assigned-pill {
      display: flex;
      align-items: center;
      gap: 5px;
      font-size: 0.72rem;
      font-weight: 600;
      background: rgba(99, 102, 241, 0.15);
      color: #818cf8;
      padding: 3px 8px;
      border-radius: 6px;
      border: 1px solid rgba(99, 102, 241, 0.3);
    }
  `],
  imports: [
    CommonModule, 
    IonHeader, 
    IonToolbar, 
    IonContent, 
    IonButtons, 
    IonButton, 
    IonIcon, 
    IonSearchbar, 
    IonLabel, 
    IonFab, 
    IonFabButton, 
    IonChip
  ]
})
export class IncidentListPage implements OnInit {
  sqlite = inject(SqliteService);
  incidentService = inject(IncidentService);
  private router = inject(Router);
  private modalCtrl = inject(ModalController);
  private actionSheetCtrl = inject(ActionSheetController);
  private alertCtrl = inject(AlertController);

  categories = INCIDENT_CATEGORIES;
  priorities = INCIDENT_PRIORITIES;
  statuses = INCIDENT_STATUSES;

  async ngOnInit() {
    await this.incidentService.findAll();
  }

  onSearch(event: any) {
    this.incidentService.searchTerm.set(event.detail.value || '');
  }

  selectCategory(cat: any) {
    this.incidentService.selectedCategory.set(cat);
  }

  selectPriority(pri: any) {
    this.incidentService.selectedPriority.set(pri);
  }

  filterByStatus(status: any) {
    this.incidentService.selectedStatus.set(status);
  }

  resetFilters() {
    this.incidentService.searchTerm.set('');
    this.incidentService.selectedCategory.set('Todas');
    this.incidentService.selectedPriority.set('Todas');
    this.incidentService.selectedStatus.set('Todos');
  }

  async openCreateModal() {
    const modal = await this.modalCtrl.create({
      component: IncidentFormModalComponent
    });
    await modal.present();

    const { data, role } = await modal.onDidDismiss();
    if (role === 'confirm' && data?.incident) {
      await this.incidentService.create(data.incident);
    }
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
          text: '📊 Ver Estadísticas y Registros',
          icon: 'stats-chart',
          handler: async () => {
            const stats = await this.sqlite.getTableStats();
            const alert = await this.alertCtrl.create({
              header: 'Diagnóstico SQLite',
              message: `<b>Total de Incidencias:</b> ${stats.totalRows}<br><b>En curso / Abiertas:</b> ${stats.openCount}<br><b>Almacenamiento:</b> Nativo/Web Operativo.`,
              buttons: ['OK']
            });
            await alert.present();
          }
        },
        {
          text: '🔄 Restaurar Datos Semilla (Reset)',
          icon: 'refresh',
          handler: async () => {
            const alert = await this.alertCtrl.create({
              header: 'Restaurar Datos Semilla',
              message: '¿Estás seguro? Esto eliminará cualquier cambio y recargará las 6 incidencias iniciales del sistema.',
              buttons: [
                { text: 'Cancelar', role: 'cancel' },
                {
                  text: 'Restaurar',
                  handler: async () => {
                    await this.incidentService.resetSeedData();
                  }
                }
              ]
            });
            await alert.present();
          }
        },
        {
          text: 'Cancelar',
          icon: 'close',
          role: 'cancel'
        }
      ]
    });
    await actionSheet.present();
  }

  getPriorityColor(pri: string): string {
    return (PRIORITY_CONFIG as any)[pri]?.color || 'medium';
  }

  getPriorityIcon(pri: string): string {
    return (PRIORITY_CONFIG as any)[pri]?.icon || 'alert-circle';
  }

  getPriorityBg(pri: string): string {
    switch(pri) {
      case 'Crítica': return 'rgba(239, 68, 68, 0.2)';
      case 'Alta': return 'rgba(245, 158, 11, 0.2)';
      case 'Media': return 'rgba(14, 165, 233, 0.2)';
      default: return 'rgba(16, 185, 129, 0.2)';
    }
  }

  getPriorityTextColor(pri: string): string {
    switch(pri) {
      case 'Crítica': return '#f87171';
      case 'Alta': return '#fbbf24';
      case 'Media': return '#38bdf8';
      default: return '#34d399';
    }
  }

  getStatusBg(st: string): string {
    switch(st) {
      case 'Abierta': return 'rgba(20, 184, 166, 0.2)';
      case 'En Proceso': return 'rgba(245, 158, 11, 0.2)';
      case 'Resuelta': return 'rgba(16, 185, 129, 0.2)';
      default: return 'rgba(100, 116, 139, 0.2)';
    }
  }

  getStatusTextColor(st: string): string {
    switch(st) {
      case 'Abierta': return '#2dd4bf';
      case 'En Proceso': return '#fbbf24';
      case 'Resuelta': return '#34d399';
      default: return '#94a3b8';
    }
  }

  getStatusIcon(st: string): string {
    return (STATUS_CONFIG as any)[st]?.icon || 'time';
  }

  formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return dateStr;
    }
  }
}
