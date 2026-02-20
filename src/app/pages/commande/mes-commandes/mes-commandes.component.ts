import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommandeService } from '../../../services/commande/commande.service';
import { Commande } from '../../../models/commande.model';

@Component({
  selector: 'app-mes-commandes',
  templateUrl: './mes-commandes.component.html',
  styleUrls: ['./mes-commandes.component.css']
})
export class MesCommandesComponent implements OnInit {
  commandes: Commande[] = [];
  isLoading = false;
  errorMessage: string | null = null;
  stats = {
    total: 0,
    enAttente: 0,
    confirmees: 0,
    expediees: 0,
    livrees: 0,
  };

  constructor(
    private commandeService: CommandeService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.chargerMesCommandes();
  }

  chargerMesCommandes(): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.commandeService.getMesCommandes().subscribe({
      next: (data) => {
        this.commandes = data;
        this.recalculerStats();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Erreur chargement commandes client :', error);
        this.errorMessage = error?.error?.message || 'Impossible de charger vos commandes pour le moment.';
        this.isLoading = false;
      }
    });
  }

  private normaliserStatut(statut: string | undefined | null): string {
    return (statut || '').toLowerCase();
  }

  private recalculerStats(): void {
    const total = this.commandes.length;
    let enAttente = 0;
    let confirmees = 0;
    let expediees = 0;
    let livrees = 0;

    this.commandes.forEach((c) => {
      const s = this.normaliserStatut(c.statut);
      if (s === 'en attente' || s === 'en_attente') {
        enAttente++;
      } else if (s === 'confirmee' || s === 'confirmée') {
        confirmees++;
      } else if (s === 'expediee' || s === 'expédiée') {
        expediees++;
      } else if (s === 'livree' || s === 'livrée') {
        livrees++;
      }
    });

    this.stats = {
      total,
      enAttente,
      confirmees,
      expediees,
      livrees,
    };
  }

  getStatutLabel(statut: string): string {
    switch ((statut || '').toLowerCase()) {
      case 'en_attente':
      case 'en attente':
        return 'En Attente';
      case 'confirmee':
      case 'confirmée':
        return 'Confirmée';
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
      return 'Nous avons bien reçu votre commande et elle sera bientôt prise en charge par notre équipe.';
    }
    if (s.startsWith('confirmee') || s.startsWith('confirmée')) {
      return 'Votre commande est confirmée. Nous préparons vos tissus et organisons la livraison.';
    }
    if (s.startsWith('expediee') || s.startsWith('expédiée')) {
      return 'Votre colis est en route vers vous. Le livreur vous contactera pour la remise.';
    }
    if (s.startsWith('livree') || s.startsWith('livrée')) {
      return 'Commande livrée. Merci pour votre confiance !';
    }
    if (s.startsWith('annulee') || s.startsWith('annulée')) {
      return 'Cette commande a été annulée.';
    }
    return 'Votre commande est en cours de traitement.';
  }

  getNombreArticles(c: Commande): number {
    if (!c?.items || !Array.isArray(c.items)) {
      return 0;
    }
    return c.items.reduce((total, item: any) => {
      const q = (item?.quantite as number) || 0;
      return total + q;
    }, 0);
  }

  getResumeProduits(c: Commande): string {
    if (!c?.items || !c.items.length) {
      return '';
    }

    const noms = c.items
      .map((item: any) => item?.produit?.nom)
      .filter((n: any) => !!n);

    if (!noms.length) {
      return '';
    }

    if (noms.length === 1) {
      return noms[0];
    }

    if (noms.length === 2) {
      return `${noms[0]} et ${noms[1]}`;
    }

    const autres = noms.length - 2;
    return `${noms[0]}, ${noms[1]} + ${autres} autre${autres > 1 ? 's' : ''}`;
  }

  peutLaisserAvis(c: Commande): boolean {
    const s = this.normaliserStatut(c.statut);
    return s === 'livree' || s === 'livrée';
  }

  getStepIndex(c: Commande): number {
    const s = this.normaliserStatut(c.statut);
    if (s === 'livree' || s === 'livrée') {
      return 4;
    }
    if (s === 'expediee' || s === 'expédiée') {
      return 3;
    }
    if (s === 'confirmee' || s === 'confirmée') {
      return 2;
    }
    // Par défaut, on considère "En Attente"
    return 1;
  }

  voirDetails(commande: Commande): void {
    if (!commande?.id) {
      return;
    }
    this.router.navigate(['/commande', commande.id]);
  }
}
