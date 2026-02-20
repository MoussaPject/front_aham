import { HttpClient } from '@angular/common/http';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface RegisterData {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  role?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = environment.apiBaseUrl;
  
  // Initialisation par défaut à false pour éviter l'erreur SSR au démarrage
  private loggedIn = new BehaviorSubject<boolean>(false);
  private isBrowser: boolean;

  constructor(
    private http: HttpClient, 
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    // On détecte si on est sur un navigateur (client) ou sur Node.js (serveur)
    this.isBrowser = isPlatformBrowser(platformId);
    
    // Si on est sur le navigateur, on initialise l'état de connexion via le token
    if (this.isBrowser) {
      this.loggedIn.next(this.hasToken());
    }
  }

  // Vérifie l'existence du token en toute sécurité
  private hasToken(): boolean {
    if (this.isBrowser) {
      return !!localStorage.getItem('token');
    }
    return false;
  }

  register(data: FormData) {
    return this.http.post(`${this.api}/register`, data);
  }

  login(data: { email: string; password: string }): Observable<any> {
    return this.http.post(`${this.api}/login`, data).pipe(
      tap((res: any) => {
        // Sauvegarde uniquement si on est sur le client
        if (this.isBrowser) {
          localStorage.setItem('token', res.token);
          if (res.user) {
            localStorage.setItem('user', JSON.stringify(res.user));
          }
        }
        
        this.loggedIn.next(true);

        // Redirection logique
        if (res.user?.role === 'admin') {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.router.navigate(['/produits']);
        }
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    this.loggedIn.next(false);
    this.router.navigate(['/connexion']);
  }

  checkToken(): void {
    if (this.isBrowser) {
      const tokenExists = !!localStorage.getItem('token');
      this.loggedIn.next(tokenExists);
    }
  }

  getToken(): string | null {
    if (this.isBrowser) {
      return localStorage.getItem('token');
    }
    return null;
  }

  get isLoggedIn$(): Observable<boolean> {
    return this.loggedIn.asObservable();
  }

  getCurrentUser(): any {
    if (this.isBrowser) {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    }
    return null;
  }

  getProfile(): Observable<any> {
    return this.http.get<any>(`${this.api}/profile`);
  }

  updateProfile(data: FormData | any): Observable<any> {
    const request$ = data instanceof FormData
      ? (() => {
          if (!data.has('_method')) {
            data.append('_method', 'PUT');
          }
          return this.http.post<any>(`${this.api}/profile`, data);
        })()
      : this.http.put<any>(`${this.api}/profile`, data);

    return request$.pipe(
      tap((user) => {
        if (user && this.isBrowser) {
          localStorage.setItem('user', JSON.stringify(user));
        }
      })
    );
  }
}