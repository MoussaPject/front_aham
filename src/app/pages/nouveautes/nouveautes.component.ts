import { Component, OnInit } from '@angular/core';
import { Produit } from '../../models/produit';
import { ProduitService } from '../../services/produit/produit.service';
import { ImageHelper } from '../../utils/image-helper';
import { SeoService } from '../../services/seo/seo.service';

@Component({
  selector: 'app-nouveautes',
  templateUrl: './nouveautes.component.html',
  styleUrls: ['./nouveautes.component.css']
})
export class NouveautesComponent implements OnInit {
  derniersProduits: Produit[] = [];

  constructor(private produitService: ProduitService, private seoService: SeoService) {}

ngOnInit(): void {
  this.updateSeoTags();
this.produitService.getProduits().subscribe((produits) => {
this.derniersProduits = produits
.filter(p => !!p.created_at)
.sort((a, b) => new Date(b.created_at!).getTime() - new Date(a.created_at!).getTime())
.slice(0, 6); // plus pro visuellement
});
}

  private updateSeoTags(): void {
    const title = 'Nouveautés - Ahma-Dile Boutique | New Drops Tissus & Mercerie';
    const description = 'Découvrez les dernières nouveautés Ahma-Dile : tissus wax, bazin, dentelle et mercerie. Sélection premium pour créateurs, stylistes et couturiers.';

    this.seoService.update({
      title,
      description,
      keywords: 'nouveautés, new drops, tissus, wax, bazin, dentelle, mercerie, Ahma-Dile',
      image: 'assets/images/ahma-dile-logo.png',
      type: 'website',
      canonicalUrl: 'https://ahmadileboutique.com/nouveautes',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Nouveautés',
        description,
        url: 'https://ahmadileboutique.com/nouveautes',
      },
    });
  }

  formatPrice(price: number | undefined): string {
    if (price == null) return '';
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
    }).format(price);
  }

  getImageUrl = (image?: string) => ImageHelper.getStorageUrl(image);
}
