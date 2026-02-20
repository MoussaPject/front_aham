import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs'; // Import de 'of'
import { AuthService } from '../auth/auth.service'; // Ajuste le chemin selon ton projet
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class PanierService {
  private apiUrl = `${environment.apiBaseUrl}/panier`;

  constructor(
    private http: HttpClient,
    private authService: AuthService // On injecte l'AuthService
  ) {}

  getPanier(): Observable<any> {
    const token = this.authService.getToken();

    // ✅ Si pas de token (serveur ou déconnecté), on renvoie un panier vide
    // sans appeler l'API, ce qui évite l'erreur 401.
    if (!token) {
      return of({ items: [], total: 0 });
    }

    return this.http.get<any>(this.apiUrl);
  }

  ajouterProduit(produit_id: number, quantite: number): Observable<any> {
    return this.http.post(this.apiUrl, { produit_id, quantite });
  }

  updateQuantite(itemId: number, quantite: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${itemId}`, { quantite });
  }

  supprimerItem(itemId: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${itemId}`);
  }

  viderPanier(): Observable<any> {
    return this.http.delete(this.apiUrl);
  }

}


