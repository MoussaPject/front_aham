import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { AuthService } from '../../../services/auth/auth.service';
import { ImageHelper } from '../../../utils/image-helper';

@Component({
  selector: 'app-admin-profil',
  templateUrl: './admin-profil.component.html',
  styleUrls: ['./admin-profil.component.css'],
})
export class AdminProfilComponent implements OnInit {
  profileForm: FormGroup;
  isLoading = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  previewImageUrl: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.profileForm = this.fb.group({
      name: [''],
      email: [''],
      telephone: [''],
      pays: ['Sénégal'],
      ville: [''],
      quartier: [''],
      adresse: [''],
      password: [''],
      password_confirmation: [''],
      image: [null],
    });
  }

  ngOnInit(): void {
    this.loadProfile();
  }

  loadProfile(): void {
    this.isLoading = true;
    this.authService.getProfile().subscribe({
      next: (user) => {
        this.isLoading = false;
        this.profileForm.patchValue({
          name: user.name || '',
          email: user.email || '',
          telephone: user.telephone || '',
          pays: user.pays || 'Sénégal',
          ville: user.ville || '',
          quartier: user.quartier || '',
          adresse: user.adresse || '',
        });
        if (user.image) {
          this.previewImageUrl = ImageHelper.getStorageUrl(user.image);
        }
      },
      error: () => {
        this.isLoading = false;
        this.errorMessage = 'Erreur lors du chargement du profil administrateur.';
      },
    });
  }

  onImageChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) {
      return;
    }
    const file = input.files[0];
    this.profileForm.patchValue({ image: file });

    const reader = new FileReader();
    reader.onload = () => {
      this.previewImageUrl = reader.result as string;
    };
    reader.readAsDataURL(file);
  }

  onDeleteAvatar(): void {
    this.previewImageUrl = null;
    this.profileForm.patchValue({ image: null });
  }

  onSubmit(): void {
    if (this.profileForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.successMessage = null;

    const formValue = this.profileForm.value;
    const formData = new FormData();

    Object.entries(formValue).forEach(([key, value]) => {
      if (value !== null && value !== '') {
        formData.append(key, value as any);
      }
    });

    this.authService.updateProfile(formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Profil administrateur mis à jour avec succès';
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage =
          error.error?.message || 'Erreur lors de la mise à jour du profil administrateur.';
      },
    });
  }
}
