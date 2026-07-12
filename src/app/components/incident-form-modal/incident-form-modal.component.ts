import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { 
  IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonIcon, IonContent, 
  IonItem, IonLabel, IonInput, IonTextarea, IonSelect, IonSelectOption, ModalController 
} from '@ionic/angular/standalone';
import { 
  Incident, 
  INCIDENT_CATEGORIES, 
  INCIDENT_PRIORITIES, 
  INCIDENT_STATUSES, 
  IncidentCategory, 
  IncidentPriority, 
  IncidentStatus 
} from '../../models/incident.model';

@Component({
  selector: 'app-incident-form-modal',
  template: `
    <ion-header class="ion-no-border">
      <ion-toolbar class="header-toolbar" style="--background: #2c3e50; color: white;">
        <ion-title style="font-weight: 700; color: #ffffff;">
          {{ incident ? 'Editar Incidencia' : 'Nueva Incidencia' }}
        </ion-title>
        <ion-buttons slot="end">
          <ion-button (click)="close()" style="color: white;">
            <ion-icon slot="icon-only" name="close"></ion-icon>
          </ion-button>
        </ion-buttons>
      </ion-toolbar>
    </ion-header>

    <ion-content class="ion-padding" style="--background: #f4f6f9;">
      <form [formGroup]="form" (ngSubmit)="save()" class="form-container">
        <!-- Título -->
        <div class="field-group">
          <label class="field-label">Título del problema *</label>
          <ion-item lines="none" class="input-item">
            <ion-input 
              formControlName="titulo" 
              placeholder="Ej. Fallo de conexión en impresora principal"
              maxlength="100">
            </ion-input>
          </ion-item>
          <span class="error-msg" *ngIf="form.get('titulo')?.invalid && form.get('titulo')?.touched">
            El título es obligatorio y debe tener al menos 5 caracteres.
          </span>
        </div>

        <!-- Categoría -->
        <div class="field-group">
          <label class="field-label">Categoría *</label>
          <ion-item lines="none" class="input-item">
            <ion-select formControlName="categoria" interface="popover" placeholder="Seleccione la categoría">
              <ion-select-option *ngFor="let cat of categories" [value]="cat">{{ cat }}</ion-select-option>
            </ion-select>
          </ion-item>
        </div>

        <!-- Prioridad -->
        <div class="field-group">
          <label class="field-label">Prioridad *</label>
          <ion-item lines="none" class="input-item">
            <ion-select formControlName="prioridad" interface="popover" placeholder="Nivel de prioridad">
              <ion-select-option *ngFor="let pri of priorities" [value]="pri">{{ pri }}</ion-select-option>
            </ion-select>
          </ion-item>
        </div>

        <!-- Estado (solo visible en edición o explícito) -->
        <div class="field-group">
          <label class="field-label">Estado actual *</label>
          <ion-item lines="none" class="input-item">
            <ion-select formControlName="estado" interface="popover" placeholder="Estado del ticket">
              <ion-select-option *ngFor="let st of statuses" [value]="st">{{ st }}</ion-select-option>
            </ion-select>
          </ion-item>
        </div>

        <!-- Solicitante -->
        <div class="field-group">
          <label class="field-label">Solicitante o Departamento *</label>
          <ion-item lines="none" class="input-item">
            <ion-input 
              formControlName="solicitante" 
              placeholder="Ej. Carlos Mendoza (Soporte Técnico)">
            </ion-input>
          </ion-item>
          <span class="error-msg" *ngIf="form.get('solicitante')?.invalid && form.get('solicitante')?.touched">
            Por favor ingresa quién reporta la incidencia.
          </span>
        </div>

        <!-- Técnico Asignado -->
        <div class="field-group">
          <label class="field-label">Técnico Asignado (Opcional)</label>
          <ion-item lines="none" class="input-item">
            <ion-input 
              formControlName="tecnicoAsignado" 
              placeholder="Ej. Ing. Laura Gómez o Pendiente">
            </ion-input>
          </ion-item>
        </div>

        <!-- Descripción detallada -->
        <div class="field-group">
          <label class="field-label">Descripción detallada *</label>
          <ion-item lines="none" class="input-item textarea-item">
            <ion-textarea 
              formControlName="descripcion" 
              placeholder="Describe los síntomas, pasos para reproducir o detalles adicionales del incidente..."
              rows="4">
            </ion-textarea>
          </ion-item>
          <span class="error-msg" *ngIf="form.get('descripcion')?.invalid && form.get('descripcion')?.touched">
            La descripción es obligatoria para el diagnóstico.
          </span>
        </div>

        <!-- Botones de Acción -->
        <div class="action-buttons">
          <ion-button type="button" fill="outline" color="medium" expand="block" class="btn-cancel" (click)="close()">
            Cancelar
          </ion-button>
          <ion-button type="submit" color="primary" expand="block" class="btn-save" [disabled]="form.invalid">
            <ion-icon slot="start" name="checkmark"></ion-icon>
            {{ incident ? 'Guardar Cambios' : 'Crear Incidencia' }}
          </ion-button>
        </div>
      </form>
    </ion-content>
  `,
  styles: [`
    .form-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      padding-bottom: 24px;
    }
    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }
    .field-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: #4a5568;
      margin-left: 4px;
    }
    .input-item {
      --background: #ffffff;
      --border-radius: 6px;
      --padding-start: 14px;
      border: 1px solid #cbd5e0;
      border-radius: 6px;
      color: #2d3748;
    }
    .textarea-item {
      --padding-top: 10px;
      --padding-bottom: 10px;
    }
    .error-msg {
      font-size: 0.75rem;
      color: #ef4444;
      margin-left: 6px;
      margin-top: 2px;
    }
    .action-buttons {
      display: flex;
      gap: 12px;
      margin-top: 16px;
    }
    .btn-cancel, .btn-save {
      flex: 1;
      --border-radius: 12px;
      font-weight: 600;
      height: 46px;
    }
  `],
  imports: [
    CommonModule, 
    ReactiveFormsModule, 
    IonHeader, 
    IonToolbar, 
    IonTitle, 
    IonButtons, 
    IonButton, 
    IonIcon, 
    IonContent, 
    IonItem, 
    IonInput, 
    IonTextarea, 
    IonSelect, 
    IonSelectOption
  ]
})
export class IncidentFormModalComponent implements OnInit {
  @Input() incident?: Incident;

  private fb = inject(FormBuilder);
  private modalCtrl = inject(ModalController);

  form!: FormGroup;
  categories = INCIDENT_CATEGORIES;
  priorities = INCIDENT_PRIORITIES;
  statuses = INCIDENT_STATUSES;

  ngOnInit() {
    this.form = this.fb.group({
      titulo: [this.incident?.titulo || '', [Validators.required, Validators.minLength(5)]],
      categoria: [this.incident?.categoria || 'Soporte Técnico', [Validators.required]],
      prioridad: [this.incident?.prioridad || 'Media', [Validators.required]],
      estado: [this.incident?.estado || 'Abierta', [Validators.required]],
      solicitante: [this.incident?.solicitante || '', [Validators.required]],
      tecnicoAsignado: [this.incident?.tecnicoAsignado || ''],
      descripcion: [this.incident?.descripcion || '', [Validators.required, Validators.minLength(10)]]
    });
  }

  close() {
    this.modalCtrl.dismiss();
  }

  save() {
    if (this.form.valid) {
      this.modalCtrl.dismiss({
        incident: this.form.value
      }, 'confirm');
    }
  }
}
