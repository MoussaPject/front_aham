import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean | UrlTree {
    const user = this.authService.getCurrentUser();

    // Si pas connecté, rediriger vers la connexion
    if (!user) {
      return this.router.parseUrl('/connexion');
    }

    // Si l'utilisateur n'est pas admin, rediriger vers la page produits
    if (user.role !== 'admin') {
      return this.router.parseUrl('/produits');
    }

    return true;
  }
}
