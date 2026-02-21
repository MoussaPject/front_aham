import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AdminUser, UserService } from '../../../services/user/user.service';
import { ImageHelper } from '../../../utils/image-helper';

@Component({
  selector: 'app-admin-user-detail',
  templateUrl: './admin-user-detail.component.html',
  styleUrls: ['./admin-user-detail.component.css'],
})
export class AdminUserDetailComponent implements OnInit {
  ImageHelper = ImageHelper;
  user: AdminUser | null = null;
  isLoading = false;
  apiError: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = idParam ? Number(idParam) : null;

    if (!id) {
      this.apiError = "Identifiant d'utilisateur invalide";
      return;
    }

    this.loadUser(id);
  }

  loadUser(id: number): void {
    this.isLoading = true;
    this.userService.getById(id).subscribe({
      next: (data) => {
        this.user = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.apiError = "Impossible de charger les informations de l'utilisateur";
        this.isLoading = false;
      },
    });
  }

  get isActive(): boolean {
    return !!this.user?.active;
  }

  get roleLabel(): string {
    if (!this.user) { return ''; }
    switch (this.user.role) {
      case 'admin':
        return 'Administrateur';
      case 'vendeur':
        return 'Vendeur';
      case 'client':
      default:
        return 'Client';
    }
  }

  get avatarInitial(): string {
    if (!this.user || !this.user.name) {
      return '';
    }
    return this.user.name.charAt(0).toUpperCase();
  }

  goBack(): void {
    this.router.navigate(['/admin/utilisateurs']);
  }
}
