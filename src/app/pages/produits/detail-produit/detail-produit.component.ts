import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProduitService } from '../../../services/produit/produit.service';
import { Produit } from '../../../models/produit';
import { switchMap, catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { PanierService } from '../../../services/panier/panier.service';
import { MatSnackBar } from '@angular/material/snack-bar'; 
import { AvisService } from '../../../services/Avis/avis-service.service';
import { AuthService } from '../../../services/auth/auth.service';
import { ImageHelper } from '../../../utils/image-helper';
import { SeoService } from '../../../services/seo/seo.service';

@Component({
  selector: 'app-product-detail',
  templateUrl: 'detail-produit.component.html',
  styleUrls: ['detail-produit.component.css']
})
export class ProductDetailComponent implements OnInit {
  produit: Produit | undefined;
  quantity: number = 1;
  activeTab: string = 'description';
  currentImageIndex: number = 0;
  relatedProducts: Produit[] = [];
  avis: any[] = [];
  averageRating: number = 0;
  reviewsCount: number = 0;
  ratingBreakdown: { [key: number]: number } = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  showLoginPrompt: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produitService: ProduitService,
    private panierService: PanierService,
    private snackBar: MatSnackBar,
    private avisService: AvisService,
    private authService: AuthService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        
        const slug = params.get('slug');
        if (slug) {
          // On envoie la chaîne de texte directement au service
          return this.produitService.getProduitBySlug(slug).pipe(
            catchError(error => {
              console.error('Erreur lors de la récupération du produit:', error);
              this.router.navigate(['/produits']);
              return of(undefined);
            })
          );
        } else {
          this.router.navigate(['/produits']);
          return of(undefined);
        }
      })
    ).subscribe(
      produit => {
        this.produit = produit;
        if (!this.produit) {
          this.router.navigate(['/produits']);
        } else {
          // MISE À JOUR SEO : Changement du titre de l'onglet et des balises Meta
          this.setPageSEO(this.produit); 
          this.chargerAvisProduit(this.produit.id);
          this.chargerProduitsSimilaires(this.produit.slug || this.produit.id.toString());
        }
      }
    );
    
  }


  // --- LOGIQUE SEO ---
  setPageSEO(produit: Produit) {
    const description = produit.description 
      ? `Achetez ${produit.nom} au meilleur prix sur Ahma-Dile Boutique. ${produit.description}. Tissus africains, wax, bazin et mercerie de qualité.`
      : `Achetez ${produit.nom} au meilleur prix sur Ahma-Dile Boutique. Tissus africains, wax, bazin et mercerie de qualité.`;

    let imageUrl: string | undefined;
    if (produit.images && produit.images.length > 0) {
      const firstImg = produit.images[0] as any;
      const path = firstImg.image || firstImg.url || firstImg.chemin;
      imageUrl = ImageHelper.getStorageUrl(path);
    }

    this.seoService.update({
      title: `${produit.nom} - Ahma-Dile Boutique | Tissus et Mercerie`,
      description,
      keywords: `${produit.nom}, tissus, mercerie, wax, bazin, ahma-dile, boutique, afrique, gabon`,
      image: imageUrl,
      type: 'product',
      canonicalUrl: `https://ahmadileboutique.com/produit/${produit.slug || produit.id}`,
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: produit.nom,
        description,
        image: imageUrl ? [imageUrl] : undefined,
        sku: String(produit.id),
        url: `https://ahmadileboutique.com/produit/${produit.slug || produit.id}`,
        offers: {
          '@type': 'Offer',
          priceCurrency: 'XOF',
          price: (produit.prix_promo || produit.prix),
          availability: produit.quantite > 0 ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
          url: `https://ahmadileboutique.com/produit/${produit.slug || produit.id}`,
        },
      },
    });
  }

  // --- CHARGEMENT DES DONNÉES ---
  private chargerAvisProduit(produitId: number): void {
    this.avisService.getAvisByProduit(produitId).subscribe({
      next: (avis) => {
        this.avis = avis || [];
        this.reviewsCount = this.avis.length;
        this.recalculerStatsAvis();
      },
      error: (error) => console.error('Erreur avis :', error)
    });
  }

  private chargerProduitsSimilaires(produitSlug: string): void {
    this.produitService.getProduitsSimilairesBySlug(produitSlug).subscribe({
      next: (produits) => this.relatedProducts = produits || [],
      error: (error) => console.error('Erreur produits similaires :', error)
    });
  }

  private recalculerStatsAvis(): void {
    this.ratingBreakdown = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (!this.avis || this.avis.length === 0) {
      this.averageRating = 0;
      this.reviewsCount = 0;
      return;
    }
    let total = 0;
    for (const a of this.avis) {
      const note = Math.round(a.note || 0);
      if (note >= 1 && note <= 5) {
        this.ratingBreakdown[note]++;
        total += note;
      }
    }
    this.reviewsCount = this.avis.length;
    this.averageRating = total / this.reviewsCount;
  }

  // --- ACTIONS ---
  addToCart(): void {
    if (!this.produit) return;
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.showLoginPrompt = true;
      return;
    }

    this.panierService.ajouterProduit(this.produit.id, this.quantity).subscribe({
      next: () => {
        this.snackBar.open(`${this.quantity} × ${this.produit?.nom} ajouté`, 'Fermer', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['ahma-snackbar', 'ahma-snackbar-success']
        });
      },
      error: (err) => {
        if (err?.status === 401) {
          this.showLoginPrompt = true;
        }
      }
    });
  }

  addSimilarToCart(prod: Produit): void {
    const user = this.authService.getCurrentUser();
    if (!user) {
      this.showLoginPrompt = true;
      return;
    }

    this.panierService.ajouterProduit(prod.id, 1).subscribe({
      next: () => this.snackBar.open(`1 × ${prod.nom} ajouté`, 'Fermer', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: ['ahma-snackbar', 'ahma-snackbar-success']
      }),
      error: (err) => {
        if (err?.status === 401) {
          this.showLoginPrompt = true;
        }
      }
    });
  }

  // --- NAVIGATION ---
  // Important : Accepte maintenant le slug (string) ou l'ID (number)
  goToProductDetail(idOrSlug: string | number): void {
    this.router.navigate(['/produit', idOrSlug]);
  }

  // --- UTILITAIRES ---
  setActiveImage(index: number): void {
    this.currentImageIndex = index;
  }

  incrementQuantity(): void {
    if (this.produit && this.quantity < this.produit.quantite) this.quantity++;
  }

  decrementQuantity(): void {
    if (this.quantity > 1) this.quantity--;
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-SN', { style: 'currency', currency: 'XOF' }).format(price);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/no-image.jpg';
  }

  getImageUrl = (image?: string) => ImageHelper.getStorageUrl(image);

  setActiveTab(tabName: string): void {
    this.activeTab = tabName;
  }

  isOutOfStock(quantity: number): boolean {
    return quantity <= 0;
  }

  goToOrdersForReview(): void {
    this.router.navigate(['/mes-commandes']);
  }

  getRatingPercentage(star: number): number {
    const count = this.ratingBreakdown[star] || 0;
    const maxCount = Math.max(...Object.values(this.ratingBreakdown));
    return maxCount === 0 ? 0 : (count / maxCount) * 100;
  }

  // --- Modale de connexion ---
  closeLoginPrompt(): void {
    this.showLoginPrompt = false;
  }

  goToLogin(): void {
    this.showLoginPrompt = false;
    this.router.navigate(['/connexion']);
  }
}