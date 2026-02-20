import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-connexion',
  templateUrl: './connexion.component.html',
  styleUrls: ['./connexion.component.css']
})
export class ConnexionComponent {
  form: FormGroup;
  apiError = ''; 
  isLoading = false; 

  constructor(
    private fb: FormBuilder, 
    private auth: AuthService, 
    private router: Router,
    private snackBar: MatSnackBar
  ) {

    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  goToHome() {
    this.router.navigate(['/home']);
  }

  // --- Getters pour le template ---
  get email() { return this.form.get('email'); }
  get password() { return this.form.get('password'); }

  // --- Méthodes de gestion du formulaire ---
  onSubmit() {
    this.apiError = ''; 
    
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.snackBar.open('Veuillez remplir correctement tous les champs.', 'Fermer', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['ahma-snackbar', 'ahma-snackbar-warning']
      });
      return; 
    }

    this.isLoading = true;
    
    this.auth.login(this.form.value).subscribe({
      next: () => {
        this.isLoading = false;
        this.snackBar.open('Heureux de vous revoir sur Ahma-Dile!', 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['ahma-snackbar', 'ahma-snackbar-success']
        });
        // La redirection vers le dashboard ou l'accueil est déjà gérée dans AuthService
      },
      error: (err: HttpErrorResponse) => {
        this.isLoading = false;

        const message =
          err.status === 401
            ? 'Identifiants incorrects.'
            : err.status === 403
              ? 'Votre compte est restreint.'
              : 'Une erreur est survenue lors de la connexion.';

        this.snackBar.open(message, 'Fermer', {
          duration: 5000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['ahma-snackbar', 'ahma-snackbar-error']
        });

        // Gestion de l'affichage textuel en plus du toast si nécessaire
        if (err.status === 401) {
          this.apiError = 'Identifiants incorrects. Veuillez vérifier votre email et mot de passe.';
        } else {
          this.apiError = 'Une erreur serveur est survenue.';
        }
        console.error('Erreur de connexion API:', err);
      }
    });
  }

  onGoogleSignIn() {
    this.snackBar.open('La connexion Google arrive très prochainement !', 'Fermer', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: ['ahma-snackbar', 'ahma-snackbar-info']
    });
  }

  clearError() {
    this.apiError = ''; 
  }
}