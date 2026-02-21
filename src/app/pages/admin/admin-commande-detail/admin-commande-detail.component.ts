import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Commande } from '../../../models/commande.model';
import { CommandeService } from '../../../services/commande/commande.service';
import { ImageHelper } from '../../../utils/image-helper';

@Component({
  selector: 'app-admin-commande-detail',
  templateUrl: './admin-commande-detail.component.html',
  styleUrls: ['./admin-commande-detail.component.css'],
})
export class AdminCommandeDetailComponent implements OnInit {
  ImageHelper = ImageHelper;
  commande: Commande | null = null;
  isLoading = false;
  apiError: string | null = null;
  isUpdatingStatus = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private commandeService: CommandeService
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.apiError = 'Commande introuvable';
      return;
    }
    this.loadCommande(id);
  }

  loadCommande(id: number): void {
    this.isLoading = true;
    this.apiError = null;

    this.commandeService.getCommande(id).subscribe({
      next: (data) => {
        this.commande = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Erreur chargement commande admin', err);
        this.apiError = err?.error?.message || 'Impossible de charger la commande.';
        this.isLoading = false;
      },
    });
  }

  getStatutLabel(statut: string): string {
    switch ((statut || '').toLowerCase()) {
      case 'en_attente':
      case 'en attente':
        return 'En attente de traitement';
      case 'confirmee':
      case 'confirmée':
        return 'Confirmée / En préparation';
      case 'expediee':
      case 'expédiée':
        return 'Expédiée';
      case 'livree':
      case 'livrée':
        return 'Livrée';
      case 'annulee':
      case 'annulée':
        return 'Annulée';
      default:
        return statut || 'En cours';
    }
  }

  getEtapeDescription(statut: string): string {
    const s = (statut || '').toLowerCase();
    if (s.startsWith('en_attente') || s.startsWith('en attente')) {
      return "Commande reçue, en attente de prise en charge par l'équipe.";
    }
    if (s.startsWith('confirmee') || s.startsWith('confirmée')) {
      return 'Commande confirmée, préparation des articles en cours.';
    }
    if (s.startsWith('expediee') || s.startsWith('expédiée')) {
      return 'Commande expédiée, le colis est en route vers le client.';
    }
    if (s.startsWith('livree') || s.startsWith('livrée')) {
      return 'Commande livrée au client.';
    }
    if (s.startsWith('annulee') || s.startsWith('annulée')) {
      return 'Cette commande a été annulée.';
    }
    return 'Commande en cours de traitement.';
  }

  onChangeStatus(statut: string): void {
    if (!this.commande?.id || !statut) {
      return;
    }
    this.isUpdatingStatus = true;
    this.apiError = null;

    this.commandeService.updateCommandeStatusAdmin(this.commande.id, statut).subscribe({
      next: (updated) => {
        this.commande = updated;
        this.isUpdatingStatus = false;
      },
      error: (err) => {
        console.error('Erreur mise à jour statut commande admin', err);
        this.apiError = err?.error?.message || 'Erreur lors de la mise à jour du statut.';
        this.isUpdatingStatus = false;
      },
    });
  }

  getTotalLignes(): number {
    if (!this.commande?.items?.length) {
      return 0;
    }
    return this.commande.items.reduce((sum, item) => {
      return sum + item.quantite * item.prix_unitaire;
    }, 0);
  }

  revenirAListe(): void {
    this.router.navigate(['/admin/commandes']);
  }
}
