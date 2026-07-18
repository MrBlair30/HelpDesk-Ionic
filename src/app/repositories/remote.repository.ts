import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { Incident } from '../models/incident.model';

@Injectable({
  providedIn: 'root'
})
export class RemoteRepository {
  private http = inject(HttpClient);
  // Reemplazar la URL cuando se despliegue en Render
  private API_URL = 'http://192.168.1.70:3000/api/incidents';

  async findAll(): Promise<Incident[]> {
    const res = await firstValueFrom(this.http.get<{success: boolean, data: Incident[]}>(this.API_URL));
    return res.data;
  }

  async sync(incidents: Incident[]): Promise<boolean> {
    const res = await firstValueFrom(this.http.post<{success: boolean}>(this.API_URL, incidents));
    return res.success;
  }

  async update(codigo: string, incident: Partial<Incident>): Promise<boolean> {
    const res = await firstValueFrom(this.http.put<{success: boolean}>(`${this.API_URL}/${codigo}`, incident));
    return res.success;
  }

  async delete(codigo: string): Promise<boolean> {
    const res = await firstValueFrom(this.http.delete<{success: boolean}>(`${this.API_URL}/${codigo}`));
    return res.success;
  }
}
