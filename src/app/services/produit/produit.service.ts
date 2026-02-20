import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Produit, ProduitImage } from '../../models/produit';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ProduitService {
  private baseUrl = environment.production ? environment.apiBaseUrl : environment.apiBaseUrl;

  constructor(private http: HttpClient) {}

  /** ===================== TOUS LES PRODUITS ===================== */
  getProduits(): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.baseUrl}/produits`);
  }

  /** ===================== RECHERCHE ===================== */
  searchProduits(term: string): Observable<Produit[]> {
    const q = term.trim();
    if (!q) return of([]);
    return this.http.get<Produit[]>(`${this.baseUrl}/produits/search`, { params: { q } });
  }

  /** ===================== PRODUIT PAR SLUG ===================== */
  getProduitBySlug(slug: string): Observable<Produit> {
    return this.http.get<Produit>(`${this.baseUrl}/produits/${slug}`);
  }

  /** ===================== PRODUITS SIMILAIRES PAR SLUG ===================== */
  getProduitsSimilairesBySlug(slug: string): Observable<Produit[]> {
    return this.http.get<Produit[]>(`${this.baseUrl}/produits/${slug}/similaires`);
  }

  /** ===================== CRUD ===================== */
  createProduit(formData: FormData): Observable<Produit> {
    return this.http.post<Produit>(`${this.baseUrl}/produits`, formData);
  }

  updateProduit(id: number, formData: FormData): Observable<Produit> {
    return this.http.post<Produit>(`${this.baseUrl}/produits/${id}?_method=PUT`, formData);
  }

  deleteProduit(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/produits/${id}`);
  }

  /** ===================== UPLOAD IMAGE SUPPLÉMENTAIRE ===================== */
  uploadProduitImage(id: number, file: File): Observable<ProduitImage> {
    const formData = new FormData();
    formData.append('image', file);
    return this.http.post<ProduitImage>(`${this.baseUrl}/produits/${id}/images`, formData);
  }
}
