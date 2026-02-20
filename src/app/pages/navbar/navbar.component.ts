import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../services/auth/auth.service';
import { PanierService } from '../../services/panier/panier.service';
import { Router, ActivatedRoute } from '@angular/router'; 
import { Subscription, Subject, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap, catchError } from 'rxjs/operators';
import { Produit } from '../../models/produit';
import { ProduitService } from '../../services/produit/produit.service';
import { ImageHelper } from '../../utils/image-helper';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  mobileMenuOpen = false;
  isLoggedIn = false;
  cartItemCount: number = 0;
  isUserDropdownOpen: boolean = false;
  isCategoriesDropdownOpen: boolean = false;
  isProductsDropdownOpen: boolean = false;

  navSearchTerm: string = '';
  searchResults: Produit[] = [];
  showSearchDropdown: boolean = false;
  isSearching: boolean = false;
  userName: string | null = null;
  userImageUrl: string | null = null;
  showTopBar = true;
  isNavFixed: boolean = false;
  isBrowser: boolean;

  private bannerHeight = 0;

  private authSubscription: Subscription | undefined;
  private searchSubscription: Subscription | undefined;
  private searchTerm$ = new Subject<string>();

  @ViewChild('userDropdown') userDropdownRef: ElementRef | undefined;

  constructor(
    private router: Router,
    private authService: AuthService,
    private route: ActivatedRoute, 
    private panierService: PanierService,
    private produitService: ProduitService,
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  closeTopBar() { this.showTopBar = false; }

  ngOnInit(): void {

    this.authSubscription = this.authService.isLoggedIn$.subscribe(status => {
      this.isLoggedIn = status;
      if (status) {
        const user = this.authService.getCurrentUser();
        this.userName = user?.name || null;
        this.userImageUrl = user?.image ? ImageHelper.getStorageUrl(user.image) : null;
        
        if (this.isBrowser) {
          this.getCartItemCount();
        }
      } else {
        this.userName = null;
        this.userImageUrl = null;
        this.cartItemCount = 0;
      }
    });

    if (this.isBrowser) {
      // Par défaut, on fixe le navbar en haut au chargement de la page
      this.isNavFixed = true;

      // Calculer la hauteur de la bannière (hero) une fois le DOM rendu
      // puis ajuster éventuellement l'état selon la position de scroll
      setTimeout(() => {
        this.computeBannerHeight();
        this.onWindowScroll();
      }, 0);
    }

    this.searchSubscription = this.searchTerm$
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        switchMap((term) => {
          this.isSearching = true;
          return this.produitService.searchProduits(term).pipe(
            catchError(() => of([]))
          );
        })
      )
      .subscribe((results) => {
        this.searchResults = results;
        this.isSearching = false;
        this.showSearchDropdown = this.navSearchTerm.trim().length >= 2;
      });
  }

  onSearchInput(event: any): void {
    const term = event.target.value;
    this.navSearchTerm = term;

    if (term.length >= 2) {
      this.searchTerm$.next(term);
      this.showSearchDropdown = true;
    } else {
      this.searchResults = [];
      this.showSearchDropdown = false;
    }
  }

  ngOnDestroy(): void {
    if (this.authSubscription) { this.authSubscription.unsubscribe(); }
    if (this.searchSubscription) { this.searchSubscription.unsubscribe(); }
  }

  getCartItemCount(): void {
    if (!this.isBrowser) return;

    this.panierService.getPanier().subscribe({
      next: (panierData) => {
        this.cartItemCount = panierData?.items ? 
          panierData.items.reduce((sum: number, item: any) => sum + item.quantite, 0) : 0;
      },
      error: () => { this.cartItemCount = 0; }
    });
  }

  onSearchSubmit(): void {
    const q = this.navSearchTerm.trim();
    this.router.navigate(['/produits'], { queryParams: q ? { q } : {} });
    this.mobileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  onClick(event: Event): void {
    if (this.isUserDropdownOpen && this.userDropdownRef && !this.userDropdownRef.nativeElement.contains(event.target)) {
      this.isUserDropdownOpen = false;
    }

    if (this.showSearchDropdown && !this.elementRef.nativeElement.contains(event.target)) {
      this.showSearchDropdown = false;
    }

    // Fermer les menus déroulants Catégories / Produits lors d'un clic en dehors
    if (this.isCategoriesDropdownOpen || this.isProductsDropdownOpen) {
      if (!this.elementRef.nativeElement.contains(event.target)) {
        this.isCategoriesDropdownOpen = false;
        this.isProductsDropdownOpen = false;
      }
    }
  }

  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    if (!this.isBrowser) return;

    if (!this.bannerHeight) {
      this.computeBannerHeight();
    }

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
    const threshold = this.bannerHeight || window.innerHeight * 0.8;

    // Tant que l'on est dans la zone « bannière » (haut de page), on fixe le navbar.
    // Au-delà de ce seuil, il redevient normal et défile avec la page.
    this.isNavFixed = scrollTop < threshold;
  }

  private computeBannerHeight(): void {
    if (!this.isBrowser) return;

    // Essayer d'abord la section hero de la home
    const hero = document.querySelector('.hero-section') as HTMLElement | null;
    if (hero) {
      this.bannerHeight = hero.offsetHeight;
      return;
    }

    // Sinon, tenter une banniere partagée
    const sharedBanner = document.querySelector('app-banniere section') as HTMLElement | null;
    if (sharedBanner) {
      this.bannerHeight = sharedBanner.offsetHeight;
      return;
    }

    // Fallback : 80% de la hauteur de la fenêtre
    this.bannerHeight = window.innerHeight * 0.8;
  }

  onSelectSearchResult(produit: Produit): void {
    this.navSearchTerm = produit.nom;
    this.showSearchDropdown = false;
    this.mobileMenuOpen = false;
    this.router.navigate(['/produit', produit.slug || produit.id]);
  }

  private closeMenus() {
    this.isUserDropdownOpen = false;
    this.mobileMenuOpen = false;
    this.isCategoriesDropdownOpen = false;
    this.isProductsDropdownOpen = false;
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    this.isUserDropdownOpen = false;
  }

  toggleUserDropdown(event: Event): void {
    this.isUserDropdownOpen = !this.isUserDropdownOpen;
    event.stopPropagation();
  }

  toggleCategoriesDropdown(event: Event): void {
    event.stopPropagation();
    this.isCategoriesDropdownOpen = !this.isCategoriesDropdownOpen;
    if (this.isCategoriesDropdownOpen) {
      this.isProductsDropdownOpen = false;
    }
  }

  toggleProductsDropdown(event: Event): void {
    event.stopPropagation();
    this.isProductsDropdownOpen = !this.isProductsDropdownOpen;
    if (this.isProductsDropdownOpen) {
      this.isCategoriesDropdownOpen = false;
    }
  }

  logout(): void {
    this.authService.logout();
    this.mobileMenuOpen = false;
    this.isUserDropdownOpen = false;
  }

  onAvatarError(): void {
    // En cas d'erreur de chargement de l'image, on repasse sur l'avatar par défaut
    this.userImageUrl = null;
  }

  goToProfile(): void { this.router.navigate(['/profil']); this.closeMenus(); }
  goToOrders(): void { this.router.navigate(['/mes-commandes']); this.closeMenus(); }
  goToLogin(): void { this.router.navigate(['/connexion']); this.closeMenus(); }
  goToRegister(): void { this.router.navigate(['/inscription']); this.closeMenus(); }
}