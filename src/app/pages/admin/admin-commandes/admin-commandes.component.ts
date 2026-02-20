import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommandeService } from '../../../services/commande/commande.service';
import { Commande } from '../../../models/commande.model';

@Component({
  selector: 'app-admin-commandes',
  templateUrl: './admin-commandes.component.html',
  styleUrls: ['./admin-commandes.component.css'],
})
export class AdminCommandesComponent implements OnInit {

  commandes: Commande[] = [];
  filteredCommandes: Commande[] = [];

  search = '';
  filterStatus = '';

  isLoading = false;
  apiError: string | null = null;

  stats = {
    total: 0,
    enAttente: 0,
    enCours: 0,
    livree: 0,
    annulee: 0,
  };

  constructor(
    private commandeService: CommandeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCommandes();
  }

  loadCommandes(): void {
    this.isLoading = true;
    this.commandeService.getAllCommandesAdmin().subscribe({
      next: (data) => {
        this.commandes = data;
        this.filteredCommandes = data;
        this.computeStats();
        this.isLoading = false;
      },
      error: () => {
        this.apiError = 'Erreur lors du chargement des commandes';
        this.isLoading = false;
      },
    });
  }

  computeStats(): void {
    this.stats.total = this.commandes.length;
    this.stats.enAttente = this.commandes.filter(c => c.statut === 'en attente').length;
    this.stats.enCours = this.commandes.filter(c => c.statut === 'en cours').length;
    this.stats.livree = this.commandes.filter(c => c.statut === 'livrée').length;
    this.stats.annulee = this.commandes.filter(c => c.statut === 'annulée').length;
  }

  applyFilters(): void {
    this.filteredCommandes = this.commandes.filter(c =>
      (!this.filterStatus || c.statut === this.filterStatus) &&
      (!this.search ||
        c.reference?.includes(this.search) ||
        c.user?.name?.toLowerCase().includes(this.search.toLowerCase()))
    );
  }

  resetFilters(): void {
    this.search = '';
    this.filterStatus = '';
    this.filteredCommandes = this.commandes;
  }

  onChangeStatus(commande: Commande, statut: string): void {
    if (!commande.id || !statut) return;

    this.commandeService.updateCommandeStatusAdmin(commande.id, statut).subscribe({
      next: () => this.loadCommandes(),
      error: () => this.apiError = 'Erreur lors de la mise à jour du statut',
    });
  }

  onDelete(commande: Commande): void {
    if (!commande.id || !confirm('Supprimer définitivement cette commande ?')) return;

    this.commandeService.deleteCommandeAdmin(commande.id).subscribe({
      next: () => this.loadCommandes(),
      error: () => this.apiError = 'Erreur lors de la suppression',
    });
  }

  goToDetail(commande: Commande): void {
    if (commande.id) {
      this.router.navigate(['/admin/commandes', commande.id]);
    }
  }
}

