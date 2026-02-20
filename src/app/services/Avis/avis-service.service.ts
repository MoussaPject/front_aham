import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';


@Injectable({ providedIn: 'root' })
export class AvisService {
  private apiUrl = `${environment.apiBaseUrl}/avis`;
  private produitAvisUrl = `${environment.apiBaseUrl}/produits`;

  constructor(private http: HttpClient) {}

  ajouterAvis(data: {
    produit_id: number;
    note: number;
    commentaire?: string;
  }): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getAvisByProduit(produitId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.produitAvisUrl}/${produitId}/avis`);
  }
}

