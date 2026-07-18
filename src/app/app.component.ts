import { Component, OnInit, inject } from '@angular/core';
import { IonApp, IonRouterOutlet } from '@ionic/angular/standalone';
import { SqliteService } from './database/sqlite.service';
import { IncidentService } from './services/incident.service';
import { addIcons } from 'ionicons';
import { 
  alertCircle, 
  warning, 
  informationCircle, 
  checkmarkCircle, 
  folderOpen, 
  time, 
  checkmarkDoneCircle, 
  lockClosed, 
  add, 
  search, 
  filter, 
  refresh, 
  trash, 
  create, 
  person, 
  calendar, 
  build, 
  close, 
  checkmark, 
  arrowBack, 
  layers, 
  server,
  statsChart,
  pulse,
  shieldCheckmark,
  helpCircle,
  sync,
  folderOpenOutline
} from 'ionicons/icons';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  imports: [IonApp, IonRouterOutlet],
})
export class AppComponent implements OnInit {
  private sqliteService = inject(SqliteService);
  private incidentService = inject(IncidentService);

  constructor() {
    addIcons({
      alertCircle,
      warning,
      informationCircle,
      checkmarkCircle,
      folderOpen,
      time,
      checkmarkDoneCircle,
      lockClosed,
      add,
      search,
      filter,
      refresh,
      trash,
      create,
      person,
      calendar,
      build,
      close,
      checkmark,
      arrowBack,
      layers,
      server,
      statsChart,
      pulse,
      shieldCheckmark,
      helpCircle,
      sync,
      folderOpenOutline
    });
  }

  async ngOnInit() {
    console.log('Inicializando aplicación e infraestructura SQLite...');
    await this.sqliteService.initializeDatabase();
    if (this.sqliteService.isReady()) {
      await this.incidentService.findAll();
    }
  }
}
