import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { interval, Subscription } from 'rxjs';
import { SeoService } from '../../services/seo/seo.service';

interface Category {
  id: number;
  slug?: string;
  nom: string;
  imageUrl?: string;
  type?: string;
}

interface Product {
  id: number;
  slug?: string;
  nom: string;
  prix: number;
  image?: string;
  type: string;
  quantite: number;
  categorie_id?: number;
  description?: string;

  unite?: string; // ex: "mètre", "pièce", "lot"

}

// Nouvelle interface pour les slides du Hero
interface HeroSlide {
  image: string;
  badge: string;
  title: string;
  subtitle: string;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  // États du carousel
  currentSlide = 0;
  // Modification : Tableau d'objets pour gérer images locales et textes
  heroSlides: HeroSlide[] = [
    {
      image: 'https://i.pinimg.com/736x/f8/71/8b/f8718bd954f5653a63778caebd92c4ba.jpg',
      badge: 'Ahma-Dile • Tissus & Mercerie',
      title: 'Imaginez, cousez, créez.',
      subtitle: 'Wax, bazin, dentelle, mercerie et accessoires sélectionnés avec soin.'
    },
    {
      image: 'assets/images/2303.w018.n002.1707A.p30.1707.jpg',
      badge: 'Nouveautés • Wax & Bazin',
      title: 'Des couleurs éclatantes.',
      subtitle: 'Découvrez notre nouvelle collection de tissus importés de haute qualité.'
    },
    {
      image: 'assets/images/mercerie.jpg',
      badge: 'Accessoires • Mercerie',
      title: 'La finition parfaite.',
      subtitle: 'Fils, boutons et rubans pour sublimer toutes vos créations de mode.'
    }
  ];
  
  carouselSubscription?: Subscription;

  // États des filtres
  activeFilter = 'all';
  searchTerm = '';
  priceRange = { min: '', max: '' };
  selectedCategory = 'all';
  sortOption = 'default';

  // Données
  categories: Category[] = [];
  products: Product[] = [];
  filteredProducts: Product[] = [];

  // États de chargement
  loading = true;
  error: string | null = null;

  // Newsletter
  newsletterEmail = '';

  // URL de base de votre API (Laravel)
  private readonly API_URL = 'http://127.0.0.1:8000/api';
  private readonly STORAGE_URL = 'http://127.0.0.1:8000/storage';

  constructor(private router: Router, private seoService: SeoService) {}

  ngOnInit(): void {
    this.loadData();
    this.startCarousel();
    this.setPageSEO();
  }

  ngOnDestroy(): void {
    this.stopCarousel();
  }

  /**
   * Charge les données depuis l'API
   */
  async loadData(): Promise<void> {
    try {
      this.loading = true;
      this.error = null;

      const [categoriesResponse, productsResponse] = await Promise.all([
        fetch(`${this.API_URL}/categories`),
        fetch(`${this.API_URL}/produits`)
      ]);

      if (!categoriesResponse.ok || !productsResponse.ok) {
        throw new Error('Erreur lors du chargement des données');
      }

      this.categories = await categoriesResponse.json();

      // Enrichir les catégories avec une URL d'image complète (comme dans CategorieService)
      this.categories = this.categories.map((c: any) => ({
        ...c,
        imageUrl: c.image ? `${this.STORAGE_URL}/${c.image}` : undefined,
      }));

      this.products = await productsResponse.json();

      this.applyFilters();
      this.loading = false;
    } catch (err) {
      console.error('Erreur de chargement:', err);
      this.error = err instanceof Error ? err.message : 'Une erreur est survenue';
      this.loading = false;
    }
  }

  /**
   * Gestion du Carousel
   */
  startCarousel(): void {
    this.carouselSubscription = interval(5000).subscribe(() => {
      this.nextSlide();
    });
  }

  stopCarousel(): void {
    if (this.carouselSubscription) {
      this.carouselSubscription.unsubscribe();
    }
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.heroSlides.length;
  }

  prevSlide(): void {
    this.currentSlide = (this.currentSlide - 1 + this.heroSlides.length) % this.heroSlides.length;
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
  }

  /**
   * Filtres et Tris
   */
  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredProducts = this.products.filter(product => {
      if (this.activeFilter !== 'all' && product.type !== this.activeFilter) return false;
      if (this.searchTerm && !product.nom.toLowerCase().includes(this.searchTerm.toLowerCase())) return false;
      if (this.priceRange.min && product.prix < parseInt(this.priceRange.min)) return false;
      if (this.priceRange.max && product.prix > parseInt(this.priceRange.max)) return false;
      if (this.selectedCategory !== 'all' && product.categorie_id !== parseInt(this.selectedCategory)) return false;
      return true;
    });
    this.sortProducts();
  }

  sortProducts(): void {
    switch (this.sortOption) {
      case 'name-asc': this.filteredProducts.sort((a, b) => a.nom.localeCompare(b.nom)); break;
      case 'name-desc': this.filteredProducts.sort((a, b) => b.nom.localeCompare(a.nom)); break;
      case 'price-asc': this.filteredProducts.sort((a, b) => a.prix - b.prix); break;
      case 'price-desc': this.filteredProducts.sort((a, b) => b.prix - a.prix); break;
    }
  }

  /**
   * Vérifie si au moins un filtre est actif
   * Retourne true si l'utilisateur a modifié la recherche, le prix, le type ou la catégorie
   */
  hasActiveFilters(): boolean {
    return (
      this.activeFilter !== 'all' ||
      this.searchTerm.trim() !== '' ||
      this.priceRange.min !== '' ||
      this.priceRange.max !== '' ||
      this.selectedCategory !== 'all'
    );
  }

  resetFilters(): void {
    this.activeFilter = 'all';
    this.searchTerm = '';
    this.priceRange = { min: '', max: '' };
    this.selectedCategory = 'all';
    this.sortOption = 'default';
    this.applyFilters();
  }

  /**
   * Helpers d'affichage
   */
  formatPrice(price: number): string {
    return `${price.toLocaleString('fr-FR')} FCFA`;
  }

  // Version mise à jour pour gérer le tableau d'objets HeroSlide
  getImageUrl(slide: any): string {
    // Si c'est un objet du carousel hero (chemin local assets)
    if (slide && slide.image) {
      return slide.image;
    }
    // Si c'est un produit (chemin API/Storage)
    if (typeof slide === 'string') {
        if (slide.startsWith('assets/')) return slide;
        if (slide.startsWith('http')) return slide;
        return `${this.STORAGE_URL}/${slide}`;
    }
    return 'assets/images/no-image.jpg';
  }

  onImageError(event: Event): void {
    const img = event.target as HTMLImageElement;
    img.src = 'assets/images/no-image.jpg';
  }

  /**
   * Actions
   */
  addToCart(product: Product): void {
    if (product.quantite === 0) return;
    console.log('Ajout au panier:', product);
    alert(`${product.nom} ajouté au panier !`);
  }

  subscribeNewsletter(event: Event): void {
    event.preventDefault();
    if (!this.newsletterEmail) {
      alert('Veuillez entrer une adresse email valide');
      return;
    }
    alert(`Merci ! Vous êtes maintenant inscrit(e) à notre newsletter.`);
    this.newsletterEmail = '';
  }

  /**
   * SEO: Mettre à jour les balises pour la page d'accueil
   */
  private setPageSEO(): void {
    const title = 'Ahma-Dile Boutique | Tissus et Mercerie de Qualité';
    const description = 'Boutique en ligne de tissus africains, wax, bazin et mercerie. Découvrez nos collections de tissus de qualité et accessoires pour créer vos vêtements traditionnels.';

    this.seoService.update({
      title,
      description,
      keywords: 'tissus africains, wax, bazin, mercerie, ahma-dile, boutique en ligne, gabon, mode africaine',
      image: 'assets/images/ahma-dile-logo.png',
      type: 'website',
      canonicalUrl: 'https://ahmadileboutique.com/',
      jsonLd: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebSite',
          name: 'Ahma-Dile Boutique',
          url: 'https://ahmadileboutique.com/',
        },
        {
          '@context': 'https://schema.org',
          '@type': 'Organization',
          name: 'Ahma-Dile Boutique',
          url: 'https://ahmadileboutique.com/',
          logo: 'https://ahmadileboutique.com/assets/images/ahma-dile-logo.png',
        },
      ],
    });
  }
}