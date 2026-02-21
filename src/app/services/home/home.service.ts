import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { catchError } from 'rxjs/operators';
import { handleError } from '../../utils/error-handler';
import { Produit } from '../../models/produit';

interface DashboardStats {
  nombreProduits: number;
  nombreCommandes: number;
  nombreClients: number;
  produitsRecents?: any[];
  ventesJour?: number;
  ventesSemaine?: number;
  ventesMois?: number;
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiUrl = `${environment.apiBaseUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  getStats(): Observable<DashboardStats> {
    return this.http.get<DashboardStats>(this.apiUrl).pipe(
      catchError(handleError)
    );
  }

  getRecentProducts(limit: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/recent-products?limit=${limit}`).pipe(
      catchError(handleError)
    );
  }
  getProduitsRecents(): Observable<Produit[]> {
  return this.http.get<Produit[]>(`${environment.apiBaseUrl}/produits/recents`).pipe(
    catchError(handleError)
  );
}

}