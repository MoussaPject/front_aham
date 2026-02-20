import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Categorie } from '../../models/categorie';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategorieService {
  private apiUrl = `${environment.apiBaseUrl}/categories`;
  private storageUrl = environment.production 
    ? 'https://api.ahmadileboutique.com/storage' 
    : 'http://localhost:8000/storage';

  constructor(private http: HttpClient) {}

  private addImageUrl(categorie: Categorie): Categorie {
    return {
      ...categorie,
      imageUrl: categorie.image ? `${this.storageUrl}/${categorie.image}` : undefined
    };
  }

  getAll(): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(this.apiUrl).pipe(
      map(categories => categories.map(c => this.addImageUrl(c)))
    );
  }

  getById(id: number): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/${id}`).pipe(
      map(c => this.addImageUrl(c))
    );
  }

  /** NOUVEAU : GET PAR SLUG */
  getBySlug(slug: string): Observable<Categorie> {
    return this.http.get<Categorie>(`${this.apiUrl}/slug/${slug}`).pipe(
      map(c => this.addImageUrl(c))
    );
  }

  /** NOUVEAU : PRODUITS D’UNE CATEGORIE PAR SLUG */
  getProduitsBySlug(slug: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/slug/${slug}/produits`);
  }

  create(formData: FormData): Observable<Categorie> {
    return this.http.post<Categorie>(this.apiUrl, formData).pipe(
      map(c => this.addImageUrl(c))
    );
  }

  update(id: number, formData: FormData): Observable<Categorie> {
    return this.http.put<Categorie>(`${this.apiUrl}/${id}`, formData).pipe(
      map(c => this.addImageUrl(c))
    );
  }

  delete(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getCategories(): Observable<Categorie[]> {
    return this.getAll();
  }

  getCategoriesByType(type: 'tissu' | 'mercerie'): Observable<Categorie[]> {
    return this.getByType(type);
  }

  getByType(type: 'tissu' | 'mercerie'): Observable<Categorie[]> {
    return this.http.get<Categorie[]>(`${this.apiUrl}/type/${type}`).pipe(
      map(categories => categories.map(c => this.addImageUrl(c)))
    );
  }
}
