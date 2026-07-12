import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, 
  IonBadge, IonCard, IonCardHeader, IonCardTitle, IonCardContent, ModalController, AlertController 
} from '@ionic/angular/standalone';
import { IncidentService } from '../../services/incident.service';
import { IncidentFormModalComponent } from '../../components/incident-form-modal/incident-form-modal.component';
import { Incident, INCIDENT_STATUSES, IncidentStatus, PRIORITY_CONFIG, STATUS_CONFIG } from '../../models/incident.model';

@Component({
  selector: 'app-incident-detail',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="header-toolbar">
        <ion-buttons slot="start">
          <ion-button (click)="goBack()" color="primary">
            <ion-icon slot="start" name="arrow-back"></ion-icon>
            Volver
          </ion-button>
        </ion-buttons>

        <ion-title style="font-weight: 700; color: #f8fafc;">
          {{ incident()?.codigo || 'Detalle' }}
        </ion-title>

        <ion-buttons slot="end" *ngIf="incident()">
          <ion-button (click)="openEditModal()" color="primary" title="Editar">
            <ion-icon slot="icon-only" name="create"></ion-icon>
          </ion-button>
          <ion-button (click)="confirmDelete()" color="danger" title="Eliminar">
            <ion-icon slot="icon-only" name="trash"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding main-content" *ngIf="incident() as item">
      <div class="detail-container">
        <!-- TOP STATUS & PRIORITY HERO -->
        <div class="hero-card glass-card">
          <div class="hero-top">
            <span class="code-pill large-pill">{{ item.codigo }}</span>
            <div class="hero-badges">
              <span class="badge-priority" [style.background]="getPriorityBg(item.prioridad)" [style.color]="getPriorityTextColor(item.prioridad)">
                {{ item.prioridad }}
              </span>
              <span class="badge-status" [style.background]="getStatusBg(item.estado)" [style.color]="getStatusTextColor(item.estado)">
                <ion-icon [name]="getStatusIcon(item.estado)" style="vertical-align: -2px; margin-right: 4px;"></ion-icon>
                {{ item.estado }}
              </span>
            </div>
          </div>

          <h1 class="item-title">{{ item.titulo }}</h1>
          <div class="cat-chip">{{ item.categoria }}</div>

          <div class="desc-box">
            <span class="box-lbl">DESCRIPCIÓN DE LA INCIDENCIA</span>
            <p class="desc-text">{{ item.descripcion }}</p>
          </div>
        </div>

        <!-- PERSONNEL & TIMESTAMPS -->
        <div class="meta-grid">
          <div class="meta-card glass-card">
            <div class="meta-icon-box blue-box">
              <ion-icon name="person"></ion-icon>
            </div>
            <div class="meta-details">
              <span class="meta-title">Solicitante</span>
              <span class="meta-value">{{ item.solicitante }}</span>
            </div>
          </div>

          <div class="meta-card glass-card">
            <div class="meta-icon-box indigo-box">
              <ion-icon name="build"></ion-icon>
            </div>
            <div class="meta-details">
              <span class="meta-title">Técnico Asignado</span>
              <span class="meta-value">{{ item.tecnicoAsignado || 'Sin Asignar (Pendiente)' }}</span>
            </div>
          </div>
        </div>

        <div class="dates-card glass-card">
          <div class="date-row">
            <span class="date-lbl"><ion-icon name="calendar"></ion-icon> Reportado el:</span>
            <span class="date-val">{{ formatFullDate(item.fechaCreacion) }}</span>
          </div>
          <div class="date-row">
            <span class="date-lbl"><ion-icon name="time"></ion-icon> Última actualización:</span>
            <span class="date-val">{{ formatFullDate(item.fechaActualizacion) }}</span>
          </div>
        </div>

        <!-- QUICK STATUS CHANGE PANEL -->
        <div class="action-panel glass-card">
          <h3 class="panel-title">Cambiar Estado Rápidamente</h3>
          <p class="panel-desc">Selecciona el nuevo estado del ticket para guardar de inmediato en SQLite:</p>
          
          <div class="status-buttons-grid">
            <button 
              type="button"
              *ngFor="let st of statuses"
              class="status-btn"
              [class.active-btn]="item.estado === st"
              (click)="changeStatus(st)">
              <ion-icon [name]="getStatusIcon(st)"></ion-icon>
              <span>{{ st }}</span>
            </button>
          </div>
        </div>

        <!-- DELETE BUTTON -->
        <div class="delete-section">
          <ion-button color="danger" fill="outline" expand="block" (click)="confirmDelete()" class="btn-delete">
            <ion-icon slot="start" name="trash"></ion-icon>
            Eliminar Registro de SQLite
          </ion-button>
        </div>
      </div>
    </ion-content>
  `,
  styles: [`
    .main-content {
      --background: #0b1120;
    }
    .detail-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-bottom: 40px;
      max-width: 768px;
      margin: 0 auto;
    }
    .hero-card {
      padding: 20px;
      display: flex;
      flex-direction: column;
      gap: 12px;
    }
    .hero-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 8px;
    }
    .large-pill {
      font-size: 0.85rem;
      padding: 4px 10px;
    }
    .hero-badges {
      display: flex;
      gap: 8px;
    }
    .item-title {
      font-size: 1.4rem;
      font-weight: 800;
      color: #f8fafc;
      margin: 4px 0 0;
      line-height: 1.3;
    }
    .cat-chip {
      display: inline-block;
      align-self: flex-start;
      background: rgba(255, 255, 255, 0.07);
      color: #cbd5e1;
      padding: 3px 10px;
      border-radius: 6px;
      font-size: 0.75rem;
      font-weight: 600;
    }
    .desc-box {
      margin-top: 8px;
      padding-top: 14px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
    }
    .box-lbl {
      font-size: 0.7rem;
      font-weight: 700;
      color: #64748b;
      letter-spacing: 0.8px;
    }
    .desc-text {
      font-size: 0.95rem;
      color: #e2e8f0;
      line-height: 1.6;
      margin: 6px 0 0;
    }

    .meta-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: 12px;
    }
    @media (min-width: 600px) {
      .meta-grid { grid-template-columns: 1fr 1fr; }
    }
    .meta-card {
      padding: 14px;
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .meta-icon-box {
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
    .indigo-box { background: rgba(99, 102, 241, 0.2); color: #818cf8; }

    .meta-details {
      display: flex;
      flex-direction: column;
    }
    .meta-title { font-size: 0.72rem; color: #94a3b8; font-weight: 600; }
    .meta-value { font-size: 0.95rem; color: #f8fafc; font-weight: 700; }

    .dates-card {
      padding: 14px 18px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .date-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.82rem;
    }
    .date-lbl { color: #94a3b8; display: flex; align-items: center; gap: 6px; }
    .date-val { color: #cbd5e1; font-weight: 600; }

    .action-panel {
      padding: 18px;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    .panel-title { font-size: 1.05rem; font-weight: 700; color: #f8fafc; margin: 0; }
    .panel-desc { font-size: 0.8rem; color: #94a3b8; margin: 0 0 8px; }
    .status-buttons-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 10px;
    }
    .status-btn {
      background: rgba(30, 41, 59, 0.9);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: #cbd5e1;
      padding: 12px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      font-weight: 600;
      font-size: 0.82rem;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .status-btn:active { transform: scale(0.97); }
    .status-btn.active-btn {
      background: #0ea5e9;
      color: #ffffff;
      border-color: #38bdf8;
      box-shadow: 0 4px 15px -3px rgba(14, 165, 233, 0.5);
    }

    .delete-section { margin-top: 10px; }
    .btn-delete { --border-radius: 12px; font-weight: 600; height: 46px; }
  `],
  imports: [
    CommonModule, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonButton, 
    IonIcon, 
    IonContent
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
