import { Component, OnInit, OnDestroy } from '@angular/core';
import { PanierService } from '../../../services/panier/panier.service';
import { Produit } from '../../../models/produit';
import { Subscription } from 'rxjs';
import { CommandeService } from '../../../services/commande/commande.service';
import { Router } from '@angular/router';

interface CartItem {
  id: number;
  produit: Produit;
  quantite: number;
}

@Component({
  selector: 'app-panier',
  templateUrl: './panier.component.html',
  styleUrls: ['./panier.component.css']
})
export class PanierComponent implements OnInit, OnDestroy {

  panier: CartItem[] = [];
  total: number = 0;
  confirmationVisible: boolean = false;

  private panierSubscription?: Subscription;

  constructor(
    private panierService: PanierService,
    private commandeService: CommandeService,
    private router: Router
  ) {}

  /* ===================== INIT / DESTROY ===================== */

  ngOnInit(): void {
    this.chargerPanier();
  }

  ngOnDestroy(): void {
    this.panierSubscription?.unsubscribe();
  }

  /* ===================== PANIER ===================== */

  chargerPanier(): void {
    this.panierSubscription = this.panierService.getPanier().subscribe({
      next: (data) => {
        this.panier = data?.items ?? [];
        this.calculerTotal();
      },
      error: (error) => {
        console.error('Erreur récupération panier :', error);
      }
    });
  }

  calculerTotal(): void {
    this.total = this.panier.reduce(
      (sum, item) => sum + (item.produit.prix * item.quantite),
      0
    );
  }

  /* ===================== QUANTITÉS ===================== */

  incrementQuantity(item: CartItem): void {
    if (item.quantite < item.produit.quantite) {
      this.panierService
        .updateQuantite(item.id, item.quantite + 1)
        .subscribe(() => this.chargerPanier());
    }
  }

  decrementQuantity(item: CartItem): void {
    if (item.quantite > 1) {
      this.panierService
        .updateQuantite(item.id, item.quantite - 1)
        .subscribe(() => this.chargerPanier());
    } else {
      this.supprimerItem(item.id);
    }
  }

  updateQuantity(item: CartItem, event: Event): void {
    const input = event.target as HTMLInputElement;
    const newQuantity = Number(input.value);

    if (
      !isNaN(newQuantity) &&
      newQuantity >= 1 &&
      newQuantity <= item.produit.quantite
    ) {
      this.panierService
        .updateQuantite(item.id, newQuantity)
        .subscribe(() => this.chargerPanier());
    } else {
      input.value = item.quantite.toString();
      alert(`Quantité valide : entre 1 et ${item.produit.quantite}`);
    }
  }

  /* ===================== SUPPRESSION ===================== */

  supprimerItem(itemId: number): void {
    if (confirm('Supprimer cet article du panier ?')) {
      this.panierService.supprimerItem(itemId).subscribe({
        next: () => this.chargerPanier(),
        error: (error) => console.error('Erreur suppression item :', error)
      });
    }
  }

  viderPanier(): void {
    if (confirm('Voulez-vous vraiment vider votre panier ?')) {
      this.panierService.viderPanier().subscribe({
        next: () => {
          this.panier = [];
          this.total = 0;
        },
        error: (error) => console.error('Erreur vidage panier :', error)
      });
    }
  }

  /* ===================== COMMANDE ===================== */

  passerCommande(): void {
    if (this.panier.length === 0) {
      alert('Votre panier est vide.');
      return;
    }

    if (confirm('Confirmer la commande et passer à la livraison ?')) {
      this.commandeService.creerCommande().subscribe({
        next: (response) => {
          const commandeId = response?.commande?.id;

          if (!commandeId) {
            console.error('Réponse commande sans ID :', response);
            alert('Commande créée mais impossible d\'ouvrir la page de livraison.');
            return;
          }

          // Redirection vers la page de détails / livraison de la commande
          this.router.navigate(['/commande', commandeId]);
        },
        error: (err) => {
          console.error('Erreur commande :', err);
          const message = err?.error?.message || 'Erreur lors du passage de la commande.';
          alert(message);
        }
      });
    }
  }

  closeConfirmationModal(): void {
    this.confirmationVisible = false;
    this.router.navigate(['/produits']);
  }

  /* ===================== UI UTILS ===================== */

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-SN', {
      style: 'currency',
      currency: 'XOF'
    }).format(price);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/no-image.jpg';
  }

  trackByItemId(index: number, item: CartItem): number {
    return item.id;
  }
}
