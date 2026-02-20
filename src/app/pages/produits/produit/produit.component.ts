import { Component, OnInit, OnDestroy, HostListener, AfterViewInit, ElementRef, ViewChildren, QueryList } from '@angular/core';

import { Produit } from '../../../models/produit';
import { ProduitService } from '../../../services/produit/produit.service';
import { CategorieService } from '../../../services/categorie/categorie.service';
import { AuthService } from '../../../services/auth/auth.service';
import { ImageHelper } from '../../../utils/image-helper';
import { SeoService } from '../../../services/seo/seo.service';

import { Categorie } from '../../../models/categorie';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router } from '@angular/router';
import { ViewportScroller } from '@angular/common';
import { trigger, transition, style, animate, stagger, query } from '@angular/animations';
import { PanierService } from '../../../services/panier/panier.service';

@Component({
  selector: 'app-produit',
  templateUrl: './produit.component.html',
  styleUrls: ['./produit.component.css'],
  animations: [
    trigger('fadeIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('stagger', [
      transition('* => *', [
        query(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger('100ms', [
            animate('0.5s ease', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('fadeInGrow', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('0.5s ease-out', 
          style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ]),
    trigger('slideIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateX(-20px)' }),
        animate('0.4s ease-out', 
          style({ opacity: 1, transform: 'translateX(0)' }))
      ])
    ])
  ]
})
export class ProduitComponent implements OnInit, OnDestroy, AfterViewInit {
  produits: Produit[] = [];
  filteredProduits: Produit[] = [];
  featuredCategories: Categorie[] = [];
  categories: Categorie[] = [];
  quantityInputs: { [key: number]: number } = {};
  
  searchTerm: string = '';
  activeFilter: string = 'all';
  activeCategoryId: 'all' | number = 'all';
  sortOption: string = 'default';
  inStockOnly: boolean = false;
  promoOnly: boolean = false;
  minPrice: number | null = null;
  maxPrice: number | null = null;

  currentPage: number = 1;
  pageSize: number = 12;

  heroSlides: string[] = [
    'https://images.clericitessuto.it/w:600/h:400/q:90/f:best/https://shop.newtess.com/comceptw/img/micro-crepe-254-leggera-001-1.jpg',
    'https://i.pinimg.com/1200x/12/24/73/122473253104862df7517321529adb15.jpg',
    'https://i.pinimg.com/1200x/00/41/a6/0041a6009ed75325206a7ee551148646.jpg'
  ];

  currentHeroIndex: number = 0;
  private heroIntervalId: any;
  isLoading: boolean = true;
  isLoadingCategories: boolean = true;
  errorMessage: string = '';
  showFilters: boolean = false;
  isAdmin: boolean = false;
  showLoginPrompt: boolean = false;

  @ViewChildren('productCard') productCardElements!: QueryList<ElementRef<HTMLElement>>;
  private productsObserver?: IntersectionObserver;

  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private route: ActivatedRoute,
    private router: Router,
    private panierService: PanierService,
    private authService: AuthService,
    private seoService: SeoService
  ) {}

  ngOnInit(): void {
    const user = this.authService.getCurrentUser();
    this.isAdmin = !!user && user.role === 'admin';

    // Écoute dynamique des paramètres d'URL (Recherche Navbar + filtre type)
    this.route.queryParamMap.subscribe(params => {
      const q = params.get('q');
      const type = params.get('type');

      this.searchTerm = q || '';
      this.activeFilter = type || 'all';

      this.filterProducts();
      
      // Si une recherche ou un type est actif, on défile vers le catalogue
      if (this.searchTerm || type) {
        setTimeout(() => this.scrollToProducts(), 100);
      }
    });

    this.loadProduits();
    this.loadCategories();
    this.loadAllCategories();
    this.startHeroCarousel();
  }

  ngAfterViewInit(): void {
    if (typeof window === 'undefined' || !(window as any).IntersectionObserver) {
      // Fallback : on affiche directement les cartes sans animation si l'API n'est pas disponible
      this.productCardElements?.forEach(card => card.nativeElement.classList.add('in-view'));
      return;
    }

    this.productsObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const el = entry.target as HTMLElement;
        if (entry.isIntersecting) {
          el.classList.add('in-view');
        } else {
          el.classList.remove('in-view');
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -10% 0px'
    });

    const observeCards = (cards: QueryList<ElementRef<HTMLElement>>) => {
      this.productsObserver?.disconnect();
      cards.forEach(card => this.productsObserver!.observe(card.nativeElement));
    };

    if (this.productCardElements) {
      observeCards(this.productCardElements);
      this.productCardElements.changes.subscribe((cards: QueryList<ElementRef<HTMLElement>>) => {
        observeCards(cards);
      });
    }
  }

  ngOnDestroy(): void {
    if (this.heroIntervalId) clearInterval(this.heroIntervalId);
    if (this.productsObserver) this.productsObserver.disconnect();
  }

  @HostListener('window:scroll')
  onWindowScroll() {
    const backToTop = document.querySelector('.back-to-top');
    if (window.pageYOffset > 300) {
      backToTop?.classList.add('visible');
    } else {
      backToTop?.classList.remove('visible');
    }
  }

  // --- Logique de recherche et scroll ---
  
  onSearchChange(): void {
    this.filterProducts();
    if (this.searchTerm.length > 0) {
      this.scrollToProducts();
    }
  }

  private scrollToProducts(): void {
    const element = document.getElementById('products-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  public filterProducts(): void {
    let filtered = this.produits.filter(p => 
      p.nom.toLowerCase().includes(this.searchTerm.toLowerCase()) || 
      p.description?.toLowerCase().includes(this.searchTerm.toLowerCase()) || false
    );

    if (this.activeCategoryId !== 'all') {
      filtered = filtered.filter(p => p.categorie_id === this.activeCategoryId);
    }

    if (this.activeFilter !== 'all') {
      filtered = filtered.filter(p => p.type === this.activeFilter);
    }

    if (this.inStockOnly) {
      filtered = filtered.filter(p => p.quantite > 0);
    }

    if (this.minPrice != null && !Number.isNaN(this.minPrice)) {
      filtered = filtered.filter(p => p.prix >= this.minPrice!);
    }

    if (this.maxPrice != null && !Number.isNaN(this.maxPrice)) {
      filtered = filtered.filter(p => p.prix <= this.maxPrice!);
    }

    if (this.promoOnly) {
      filtered = filtered.filter(p => p.en_promotion);
    }

    this.applySorting(filtered);
    this.filteredProduits = filtered;
    this.currentPage = 1;
  }

  private applySorting(filtered: Produit[]): void {
    switch (this.sortOption) {
      case 'name': filtered.sort((a, b) => a.nom.localeCompare(b.nom)); break;
      case 'price-low': filtered.sort((a, b) => a.prix - b.prix); break;
      case 'price-high': filtered.sort((a, b) => b.prix - a.prix); break;
      default: filtered.sort((a, b) => (a.id || 0) - (b.id || 0));
    }
  }

  // --- Chargement des données ---

  private loadProduits(): void {
    this.isLoading = true;
    this.produitService.getProduits().subscribe({
      next: (produits) => {
        this.produits = produits;
        this.filterProducts(); // Appliquer le filtre après chargement
        this.initializeQuantities();
        this.isLoading = false;
        this.updateSeoTags();
      },
      error: (error: HttpErrorResponse) => {
        this.errorMessage = 'Erreur lors du chargement des produits';
        this.isLoading = false;
      }
    });
  }

  private loadCategories(): void {
    this.categorieService.getByType('tissu').subscribe({
      next: (categories) => this.featuredCategories = categories.slice(0, 3),
      error: (err) => console.error(err)
    });
  }

  private loadAllCategories(): void {
    this.categorieService.getAll().subscribe({
      next: (categories) => this.categories = categories,
      error: (err) => console.error(err)
    });
  }

  // --- Actions UI ---

  addToCart(produit: Produit, quantite: number = 1): void {
    if (!produit.id) return;

    const user = this.authService.getCurrentUser();
    if (!user) {
      this.showLoginPrompt = true;
      return;
    }

    this.panierService.ajouterProduit(produit.id, quantite).subscribe({
      next: () => this.showAddToCartFeedback(produit.id!),
      error: (err) => {
        if (err?.status === 401) {
          this.showLoginPrompt = true;
        }
      }
    });
  }

  private showAddToCartFeedback(productId: number): void {
    const button = document.querySelector(`.add-btn-${productId}`);
    if (button) {
      button.classList.add('added');
      setTimeout(() => button.classList.remove('added'), 1000);
    }
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.activeFilter = 'all';
    this.activeCategoryId = 'all';
    this.sortOption = 'default';
    this.inStockOnly = false;
    this.promoOnly = false;
    this.minPrice = null;
    this.maxPrice = null;
    this.router.navigate([], { queryParams: { q: null }, queryParamsHandling: 'merge' });
    this.filterProducts();
  }

  // --- Modale de connexion ---

  closeLoginPrompt(): void {
    this.showLoginPrompt = false;
  }

  goToLogin(): void {
    this.showLoginPrompt = false;
    this.router.navigate(['/connexion']);
  }

  // --- Getters & Helpers ---

  get totalPages(): number {
    return Math.ceil(this.filteredProduits.length / this.pageSize) || 1;
  }

  get paginatedProduits(): Produit[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredProduits.slice(start, start + this.pageSize);
  }

  get pages(): number[] {
    return Array.from({ length: this.totalPages }, (_, i) => i + 1);
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'XOF', minimumFractionDigits: 0 }).format(price);
  }

  getUniqueTypes(): string[] {
    return [...new Set(this.produits.map(p => p.type).filter(Boolean))];
  }

  onCategoryChange(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.activeCategoryId = value === 'all' ? 'all' : Number(value);
    this.filterProducts();
  }

  onSortChange(event: Event): void {
    this.sortOption = (event.target as HTMLSelectElement).value;
    this.filterProducts();
  }

  setFilter(filter: string): void { this.activeFilter = filter; this.filterProducts(); }
  setPage(page: number): void { this.currentPage = page; window.scrollTo({ top: 0, behavior: 'smooth' }); }
  prevPage(): void { if (this.currentPage > 1) this.setPage(this.currentPage - 1); }
  nextPage(): void { if (this.currentPage < this.totalPages) this.setPage(this.currentPage + 1); }
  
  isLowStock = (q: number) => q < 10 && q > 0;
  isOutOfStock = (q: number) => q === 0;
  trackByFn = (index: number, item: Produit) => item.id || index;
  onImageError = (e: Event) => (e.target as HTMLImageElement).src = 'assets/images/no-image.jpg';
  getImageUrl = (image?: string) => ImageHelper.getProduitImageUrl(image);
  toggleFilters = () => this.showFilters = !this.showFilters;
  hasActiveFilters = () =>
    this.searchTerm.trim().length > 0 ||
    this.activeFilter !== 'all' ||
    this.activeCategoryId !== 'all' ||
    this.inStockOnly ||
    this.promoOnly ||
    (this.minPrice != null && !Number.isNaN(this.minPrice)) ||
    (this.maxPrice != null && !Number.isNaN(this.maxPrice));
  goToProductDetail = (p: Produit) => this.router.navigate(['/produit', p.slug || p.id]);
  quickView = (p: Produit) => console.log('Quick view:', p.nom);

  private initializeQuantities(): void {
    this.produits.forEach(p => { if (p.id) this.quantityInputs[p.id] = 1; });
  }

  /**
   * SEO: Met à jour les balises Title / Meta pour la liste ou un produit mis en avant
   */
  private updateSeoTags(produit?: Produit): void {
    if (produit) {
      const description = produit.description ||
        'Découvrez nos tissus et mercerie Ahma-Dile : qualité, sélection et service client.';

      this.seoService.update({
        title: `${produit.nom} - Ahma-Dile Tissus & Mercerie`,
        description,
        keywords: `tissu, mercerie, ${produit.nom}, achat en ligne, Ahma-Dile`,
        image: this.getImageUrl(produit.image),
        type: 'product',
        canonicalUrl: `https://ahmadileboutique.com/produit/${produit.slug || produit.id}`,
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'Product',
          name: produit.nom,
          description,
          image: [this.getImageUrl(produit.image)],
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
    } else {
      const description =
        'Explorez notre large collection de tissus, mercerie et accessoires sur Ahma-Dile Boutique.';

      this.seoService.update({
        title: 'Produits - Ahma-Dile Tissus & Mercerie',
        description,
        keywords: 'tissus, mercerie, accessoires, vente en ligne, Ahma-Dile, wax, bazin',
        image: 'assets/images/ahma-dile-logo.png',
        type: 'website',
        canonicalUrl: 'https://ahmadileboutique.com/produits',
        jsonLd: {
          '@context': 'https://schema.org',
          '@type': 'CollectionPage',
          name: 'Produits',
          description,
          url: 'https://ahmadileboutique.com/produits',
        },
      });
    }
  }

  /* ============ HERO CAROUSEL ============ */
  private startHeroCarousel(): void {
    this.heroIntervalId = setInterval(() => this.nextHeroSlide(), 5000);
  }
  nextHeroSlide(): void { this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroSlides.length; }
  prevHeroSlide(): void { this.currentHeroIndex = (this.currentHeroIndex - 1 + this.heroSlides.length) % this.heroSlides.length; }
  goToHeroSlide(i: number): void { this.currentHeroIndex = i; this.startHeroCarousel(); }
}