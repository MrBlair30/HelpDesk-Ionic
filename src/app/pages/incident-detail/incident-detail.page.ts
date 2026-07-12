import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonContent, IonButtons, IonButton, IonIcon, 
  ModalController, AlertController 
} from '@ionic/angular/standalone';
import { IncidentService } from '../../services/incident.service';
import { IncidentFormModalComponent } from '../../components/incident-form-modal/incident-form-modal.component';
import { Incident, INCIDENT_STATUSES, IncidentStatus } from '../../models/incident.model';

@Component({
  selector: 'app-incident-detail',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="navbar-toolbar">
        <div class="header-content">
          <ion-buttons slot="start">
            <ion-button (click)="goBack()" style="color: white; font-weight: 600;">
              <ion-icon slot="start" name="arrow-back"></ion-icon>
              Volver al listado
            </ion-button>
          </ion-buttons>

          <h1 class="navbar-title">{{ incident()?.codigo || 'Detalle de Incidencia' }}</h1>

          <ion-buttons slot="end" *ngIf="incident()">
            <ion-button (click)="openEditModal()" style="color: white;" title="Editar">
              <ion-icon slot="icon-only" name="create"></ion-icon>
            </ion-button>
            <ion-button (click)="confirmDelete()" style="color: #e74c3c;" title="Eliminar">
              <ion-icon slot="icon-only" name="trash"></ion-icon>
            </ion-button>
          </ion-buttons>
        </div>
      </ion-toolbar>
    </ion-header>

    <ion-content *ngIf="incident() as item">
      <div class="detail-container">
        <!-- TOP CARD -->
        <div class="white-card detail-main-card" [ngClass]="getBorderClass(item.prioridad)">
          <div class="top-meta">
            <span class="code-badge">{{ item.codigo }}</span>
            <span class="pill-priority" [ngClass]="getBgClass(item.prioridad)">
              Prioridad: {{ item.prioridad }}
            </span>
          </div>

          <h2 class="title">{{ item.titulo }}</h2>
          <span class="cat-pill">Categoría: {{ item.categoria }}</span>

          <div class="desc-box">
            <label class="desc-label">DESCRIPCIÓN DETALLADA</label>
            <p class="desc-text">{{ item.descripcion }}</p>
          </div>
        </div>

        <!-- INFO & PERSONNEL CARD -->
        <div class="white-card info-card">
          <div class="info-row">
            <div class="info-col">
              <span class="info-label">Solicitante:</span>
              <span class="info-val">{{ item.solicitante }}</span>
            </div>
            <div class="info-col">
              <span class="info-label">Técnico Asignado:</span>
              <span class="info-val">{{ item.tecnicoAsignado || 'Sin asignar' }}</span>
            </div>
          </div>
          
          <hr class="divider" />

          <div class="info-row">
            <div class="info-col">
              <span class="info-label">Fecha de creación:</span>
              <span class="info-val">{{ formatFullDate(item.fechaCreacion) }}</span>
            </div>
            <div class="info-col">
              <span class="info-label">Última actualización:</span>
              <span class="info-val">{{ formatFullDate(item.fechaActualizacion) }}</span>
            </div>
          </div>
        </div>

        <!-- STATUS CHANGE PANEL -->
        <div class="white-card status-card">
          <h3 class="status-title">Cambiar Estado de la Incidencia</h3>
          <p class="status-subtitle">Selecciona un nuevo estado para actualizar SQLite en tiempo real:</p>

          <div class="status-buttons">
            <button 
              type="button"
              *ngFor="let st of statuses"
              class="status-btn"
              [class.active-status]="item.estado === st"
              (click)="changeStatus(st)">
              {{ st }}
            </button>
          </div>
        </div>

        <!-- DELETE BUTTON -->
        <button type="button" class="btn-delete-full" (click)="confirmDelete()">
          Eliminar esta incidencia permanentemente
        </button>
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
      max-width: 900px;
      margin: 0 auto;
      padding: 0 16px;
      width: 100%;
      height: 64px;
    }
    .navbar-title {
      font-size: 1.3rem;
      font-weight: 700;
      color: white;
      margin: 0;
    }

    .detail-container {
      max-width: 900px;
      margin: 0 auto;
      padding: 24px 16px 60px;
      display: flex;
      flex-direction: column;
      gap: 20px;
    }

    .detail-main-card {
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .top-meta {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .code-badge {
      background: #eef1f5;
      color: #2c3e50;
      font-weight: 700;
      font-size: 0.85rem;
      padding: 4px 10px;
      border-radius: 6px;
    }
    .title {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2c3e50;
      margin: 4px 0 0;
    }
    .cat-pill {
      display: inline-block;
      align-self: flex-start;
      background: #e3e8ef;
      color: #4a5568;
      font-size: 0.8rem;
      font-weight: 600;
      padding: 3px 10px;
      border-radius: 6px;
    }
    .desc-box {
      margin-top: 10px;
      padding-top: 16px;
      border-top: 1px solid #eef1f5;
    }
    .desc-label {
      font-size: 0.75rem;
      font-weight: 700;
      color: #718096;
      letter-spacing: 0.5px;
    }
    .desc-text {
      font-size: 1rem;
      color: #2d3748;
      line-height: 1.6;
      margin: 8px 0 0;
    }

    .info-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 600px) {
      .info-row { grid-template-columns: 1fr; }
    }
    .info-col {
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .info-label { font-size: 0.8rem; color: #718096; font-weight: 600; }
    .info-val { font-size: 0.95rem; color: #2c3e50; font-weight: 700; }
    .divider {
      border: 0;
      border-top: 1px solid #eef1f5;
      margin: 14px 0;
    }

    .status-title { font-size: 1.15rem; font-weight: 700; color: #2c3e50; margin: 0 0 6px; }
    .status-subtitle { font-size: 0.85rem; color: #718096; margin: 0 0 16px; }
    .status-buttons {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 10px;
    }
    @media (max-width: 650px) {
      .status-buttons { grid-template-columns: repeat(2, 1fr); }
    }
    .status-btn {
      padding: 10px;
      border: 1px solid #cbd5e0;
      background: #ffffff;
      color: #4a5568;
      border-radius: 6px;
      font-weight: 600;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .status-btn:hover { border-color: #3498db; color: #3498db; }
    .status-btn.active-status {
      background: #3498db;
      color: white;
      border-color: #3498db;
    }

    .btn-delete-full {
      width: 100%;
      padding: 12px;
      border: 1px solid #e74c3c;
      background: transparent;
      color: #e74c3c;
      border-radius: 6px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-delete-full:hover {
      background: #e74c3c;
      color: white;
    }
  `],
  imports: [
    CommonModule, 
    IonHeader, 
    IonToolbar, 
    IonContent, 
    IonButtons, 
    IonButton, 
    IonIcon
  ]
})
export class IncidentDetailPage implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private incidentService = inject(IncidentService);
  private modalCtrl = inject(ModalController);
  private alertCtrl = inject(AlertController);

  readonly incident = signal<Incident | null>(null);
  statuses = INCIDENT_STATUSES;

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      await this.loadIncident(Number(idParam));
    }
  }

  async loadIncident(id: number) {
    const item = await this.incidentService.findById(id);
    if (item) {
      this.incident.set(item);
    } else {
      this.goBack();
    }
  }

  goBack() {
    this.router.navigate(['/incidents']);
  }

  async changeStatus(newStatus: IncidentStatus) {
    const current = this.incident();
    if (current && current.id && current.estado !== newStatus) {
      await this.incidentService.update(current.id, { estado: newStatus });
      await this.loadIncident(current.id);
    }
  }

  async openEditModal() {
    const current = this.incident();
    if (!current) return;

    const modal = await this.modalCtrl.create({
      component: IncidentFormModalComponent,
      componentProps: { incident: current }
    });
    await modal.present();

    const { data, role } = await modal.onDidDismiss();
    if (role === 'confirm' && data?.incident && current.id) {
      await this.incidentService.update(current.id, data.incident);
      await this.loadIncident(current.id);
    }
  }

  async confirmDelete() {
    const current = this.incident();
    if (!current || !current.id) return;

    const alert = await this.alertCtrl.create({
      header: 'Confirmar Eliminación',
      message: `¿Estás seguro de eliminar permanentemente la incidencia <b>${current.codigo}</b> de SQLite?`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            await this.incidentService.delete(current.id!);
            this.goBack();
          }
        }
      ]
    });
    await alert.present();
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

  formatFullDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('es-ES', { 
        day: '2-digit', 
        month: 'long', 
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return dateStr;
    }
  }
}
