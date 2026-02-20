// src/app/services/commande.service.ts
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Commande } from '../../models/commande.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CommandeService {
  private apiUrl = `${environment.apiBaseUrl}/commandes`;
  private adminApiUrl = `${environment.apiBaseUrl}/admin/commandes`;

  constructor(private http: HttpClient) {}

  creerCommande(): Observable<any> {
    return this.http.post(this.apiUrl, {});
  }

  getMesCommandes(): Observable<Commande[]> {
    return this.http.get<Commande[]>(this.apiUrl);
  }

  getCommande(id: number): Observable<Commande> {
    return this.http.get<Commande>(`${this.apiUrl}/${id}`);
  }
  creerOuMettreAJourLivraison(commandeId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${commandeId}/livraison`, data);
  }

  // ==== Méthodes admin ====

  getAllCommandesAdmin(): Observable<Commande[]> {
    return this.http.get<Commande[]>(this.adminApiUrl);
  }

  updateCommandeStatusAdmin(id: number, statut: string): Observable<Commande> {
    return this.http.put<Commande>(`${this.apiUrl}/${id}`, { statut });
  }

  deleteCommandeAdmin(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}

