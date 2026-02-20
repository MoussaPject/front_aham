import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { AuthService } from '../../services/auth/auth.service';
import { Router } from '@angular/router';
import { matchPasswords } from '../../utils/validators'; // Vous devrez créer ce validateur personnalisé

@Component({
  selector: 'app-inscription',
  templateUrl: './inscription.component.html',
  styleUrls: ['./inscription.component.css']
})
export class InscriptionComponent implements OnInit {
  form: FormGroup;
  selectedFile: File | null = null;
  isLoading = false;
  apiError: string | null = null;
  acceptedFileTypes = 'image/jpeg, image/png, image/gif';

  constructor(
    private fb: FormBuilder, 
    private authService: AuthService, 
    private router: Router
  ) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      password_confirmation: ['', Validators.required],
      role: ['client'],
      terms: [false, Validators.requiredTrue]
    }, { 
      validators: matchPasswords 
    });
  }

  ngOnInit(): void {
    // Réinitialiser le message d'erreur lorsque l'utilisateur commence à taper
    this.form.valueChanges.subscribe(() => {
      this.apiError = null;
    });
  }

  get name(): AbstractControl | null { return this.form.get('name'); }
  get email(): AbstractControl | null { return this.form.get('email'); }
  get password(): AbstractControl | null { return this.form.get('password'); }
  get password_confirmation(): AbstractControl | null { return this.form.get('password_confirmation'); }
  get terms(): AbstractControl | null { return this.form.get('terms'); }

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      // Vérification du type de fichier
      if (!this.acceptedFileTypes.includes(file.type)) {
        this.apiError = 'Type de fichier non supporté. Veuillez uploader une image (JPEG, PNG ou GIF)';
        return;
      }

      // Vérification de la taille du fichier (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        this.apiError = 'La taille du fichier ne doit pas dépasser 2MB';
        return;
      }

      this.selectedFile = file;
      this.apiError = null;
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.apiError = null;

    const formData = new FormData();
    formData.append('name', this.name?.value);
    formData.append('email', this.email?.value);
    formData.append('password', this.password?.value);
    formData.append('password_confirmation', this.password_confirmation?.value);
    formData.append('role', this.form.value.role);
    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.authService.register(formData).subscribe({
      next: () => {
        this.router.navigate(['/connexion']);
      },
      error: (err) => {
        this.isLoading = false;
        this.apiError = err.error?.message || 'Une erreur est survenue lors de l\'inscription';
        
        // Gestion spécifique des erreurs de validation du serveur
        if (err.error?.errors) {
          for (const field in err.error.errors) {
            const control = this.form.get(field);
            if (control) {
              control.setErrors({ serverError: err.error.errors[field][0] });
            }
          }
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }
}