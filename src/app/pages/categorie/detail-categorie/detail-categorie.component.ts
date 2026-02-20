import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { CategorieService } from '../../../services/categorie/categorie.service';
import { ProduitService } from '../../../services/produit/produit.service';
import { Categorie } from '../../../models/categorie';
import { Produit } from '../../../models/produit';
import { ImageHelper } from '../../../utils/image-helper';
import { SeoService } from '../../../services/seo/seo.service';

@Component({
  selector: 'app-detail-categorie',
  templateUrl: './detail-categorie.component.html',
  styleUrls: ['./detail-categorie.component.css']
})
export class DetailCategorieComponent implements OnInit {
  categorie?: Categorie;
  produits: Produit[] = [];
  isLoading = true;
  errorMessage: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private categorieService: CategorieService,
    private produitService: ProduitService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug');
    if (slug) {
      this.loadCategorieAndProduitsBySlug(slug);
    } else {
      this.router.navigate(['/categories']);
    }
  }

  private loadCategorieAndProduitsBySlug(slug: string): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.categorieService.getBySlug(slug).subscribe({
      next: (categorie) => {
        this.categorie = categorie;
        
        // SEO: Mettre à jour le titre et les meta tags
        this.updateSeoTags(categorie);

        this.categorieService.getProduitsBySlug(slug).subscribe({
          next: (produits: Produit[]) => {
            this.produits = produits || [];
            this.isLoading = false;
          },
          error: (error: HttpErrorResponse) => {
            console.error(error);
            this.errorMessage = 'Erreur lors du chargement des produits.';
            this.isLoading = false;
          }
        });
      },
      error: (error: HttpErrorResponse) => {
        console.error(error);
        this.errorMessage = 'Catégorie introuvable.';
        this.isLoading = false;
      }
    });
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(price);
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/no-image.jpg';
  }

  getImageUrl = (image?: string) => ImageHelper.getStorageUrl(image);

  /**
   * Met à jour les balises SEO pour la catégorie
   */
  private updateSeoTags(categorie: Categorie): void {
    const title = `${categorie.nom} - Ahma-Dile Boutique | Tissus et Mercerie`;
    const description = categorie.description 
      ? `Découvrez notre collection ${categorie.nom.toLowerCase()} : ${categorie.description}. Tissus africains, wax, bazin et mercerie de qualité.`
      : `Découvrez notre collection ${categorie.nom.toLowerCase()} sur Ahma-Dile Boutique. Tissus africains, wax, bazin et mercerie de qualité.`;

    const imageUrl = categorie.image ? ImageHelper.getStorageUrl(categorie.image) : undefined;

    this.seoService.update({
      title,
      description,
      keywords: `${categorie.nom}, tissus, mercerie, wax, bazin, ahma-dile, boutique, afrique`,
      image: imageUrl,
      type: 'website',
      canonicalUrl: `https://ahmadileboutique.com/categorie/${categorie.slug || categorie.id}`,
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'BreadcrumbList',
          itemListElement: [
            {
              '@type': 'ListItem',
              position: 1,
              name: 'Accueil',
              item: 'https://ahmadileboutique.com/',
            },
            {
              '@type': 'ListItem',
              position: 2,
              name: 'Catégories',
              item: 'https://ahmadileboutique.com/categories',
            },
            {
              '@type': 'ListItem',
              position: 3,
              name: categorie.nom,
              item: `https://ahmadileboutique.com/categorie/${categorie.slug || categorie.id}`,
            },
          ],
        },
        {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: categorie.nom,
          description,
          url: `https://ahmadileboutique.com/categorie/${categorie.slug || categorie.id}`,
        },
      ],
    });
  }

  goToProductDetail(produit: Produit): void {
    if (produit.slug) {
      this.router.navigate(['/produit', produit.slug]);
    } else if (produit.id) {
      this.router.navigate(['/produit', produit.id]);
    }
  }
}
