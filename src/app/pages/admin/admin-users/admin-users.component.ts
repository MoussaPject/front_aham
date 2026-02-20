import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AdminUser, UserService } from '../../../services/user/user.service';

@Component({
  selector: 'app-admin-users',
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css'],
})
export class AdminUsersComponent implements OnInit {
  users: AdminUser[] = [];
  isLoading = false;
  apiError: string | null = null;

  // Filtres et recherche pour une meilleure UX
  selectedRole: 'all' | 'admin' | 'vendeur' | 'client' = 'all';
  showOnlyActive = false;
  searchTerm = '';

  constructor(
    private userService: UserService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.userService.getAll().subscribe({
      next: (data) => {
        this.users = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.apiError = 'Erreur lors du chargement des utilisateurs';
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  // Statistiques rapides pour l'entête et les cartes de synthèse
  get totalUsers(): number {
    return this.users.length;
  }

  get activeUsers(): number {
    return this.users.filter((u) => !!u.active).length;
  }

  get adminCount(): number {
    return this.users.filter((u) => u.role === 'admin').length;
  }

  get vendeurCount(): number {
    return this.users.filter((u) => u.role === 'vendeur').length;
  }

  get clientCount(): number {
    return this.users.filter((u) => u.role === 'client').length;
  }

  // Liste filtrée selon le rôle, l'état actif et la recherche
  get filteredUsers(): AdminUser[] {
    return this.users.filter((u) => {
      if (this.selectedRole !== 'all' && u.role !== this.selectedRole) {
        return false;
      }

      if (this.showOnlyActive && !u.active) {
        return false;
      }

      if (this.searchTerm) {
        const term = this.searchTerm.toLowerCase();
        return (
          u.name.toLowerCase().includes(term) ||
          u.email.toLowerCase().includes(term)
        );
      }

      return true;
    });
  }

  onRoleChange(user: AdminUser, role: AdminUser['role']): void {
    if (!user.id) { return; }
    this.userService.update(user.id, { role }).subscribe({
      next: () => this.loadUsers(),
      error: (err) => {
        this.apiError = 'Erreur lors de la mise à jour du rôle';
        console.error(err);
      },
    });
  }

  onToggleActive(user: AdminUser): void {
    if (!user.id) { return; }
    const nextActive = !user.active;
    this.userService.update(user.id, { active: nextActive }).subscribe({
      next: () => this.loadUsers(),
      error: (err) => {
        this.apiError = "Erreur lors de la mise à jour de l'état de l'utilisateur";
        console.error(err);
      },
    });
  }

  onDelete(user: AdminUser): void {
    if (!user.id || !confirm('Supprimer cet utilisateur ?')) { return; }
    this.userService.delete(user.id).subscribe({
      next: () => this.loadUsers(),
      error: (err) => {
        this.apiError = 'Erreur lors de la suppression';
        console.error(err);
      },
    });
  }

  goToDetail(user: AdminUser): void {
    if (!user.id) { return; }
    this.router.navigate(['/admin/utilisateurs', user.id]);
  }
}
