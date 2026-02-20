import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { CategorieService } from '../../../services/categorie/categorie.service';
import { Categorie } from '../../../models/categorie';
import { ImageHelper } from '../../../utils/image-helper';
import { SeoService } from '../../../services/seo/seo.service';

@Component({
  selector: 'app-categorie',
  templateUrl: './categorie.component.html',
  styleUrls: ['./categorie.component.css']
})
export class CategorieComponent implements OnInit, OnDestroy {

  form: FormGroup;
  categories: Categorie[] = [];
  filteredCategories: Categorie[] = [];
  featuredCategories: Categorie[] = [];
  editMode = false;
  editingId?: number;
  selectedFile?: File;
  imagePreview?: string;
  isLoading = false;
  apiError: string | null = null;
  currentSlide = 0;
  formVisible = false;
  activeFilter = 'all';
  productsCount = 0;
  private intervalId: any;

  constructor(
    private fb: FormBuilder, 
    private categorieService: CategorieService,
    private route: ActivatedRoute,
    private seoService: SeoService
  ) {

    this.form = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      type: ['', Validators.required],
      description: [''],
      active: [true],
      ordre: [0]
    });
  }

  ngOnInit(): void {
    this.updateSeoTags();
    const type = this.route.snapshot.queryParamMap.get('type');
    if (type) {
      this.activeFilter = type;
      this.scrollToCategories();
    }

    this.loadCategories();
    this.startAutoSlide();
    // À remplacer par un appel API réel pour le nombre de produits
    this.productsCount = 142;
  }

  private updateSeoTags(): void {
    const title = 'Catégories - Ahma-Dile Boutique | Tissus & Mercerie';
    const description = 'Explorez toutes nos catégories de tissus et mercerie : wax, bazin, dentelle et accessoires. Trouvez l’inspiration pour vos créations sur Ahma-Dile Boutique.';

    this.seoService.update({
      title,
      description,
      keywords: 'catégories, tissus, mercerie, wax, bazin, dentelle, accessoires, Ahma-Dile',
      image: 'assets/images/ahma-dile-logo.png',
      type: 'website',
      canonicalUrl: 'https://ahmadileboutique.com/categories',
      jsonLd: {
        '@context': 'https://schema.org',
        '@type': 'CollectionPage',
        name: 'Catégories',
        description,
        url: 'https://ahmadileboutique.com/categories',
      },
    });
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  get nom(): AbstractControl | null { return this.form.get('nom'); }
  get type(): AbstractControl | null { return this.form.get('type'); }
  get description(): AbstractControl | null { return this.form.get('description'); }
  get active(): AbstractControl | null { return this.form.get('active'); }
  get ordre(): AbstractControl | null { return this.form.get('ordre'); }

  loadCategories(): void {
    this.isLoading = true;
    this.categorieService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.filteredCategories = this.categories.filter(category => 
          this.activeFilter === 'all' || category.type === this.activeFilter
        );
        this.featuredCategories = data.slice(0, 4);
        this.isLoading = false;
      },
      error: (err) => {
        this.apiError = 'Erreur lors du chargement des catégories';
        this.isLoading = false;
        console.error(err);
      }
    });
  }

  filterCategories(event: Event): void {
    const input = event.target as HTMLInputElement;
    const searchTerm = input.value.toLowerCase();
    
    this.filteredCategories = this.categories.filter(category => 
      category.nom.toLowerCase().includes(searchTerm) &&
      (this.activeFilter === 'all' || category.type === this.activeFilter)
    );
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.filteredCategories = this.categories.filter(category => 
      filter === 'all' || category.type === filter
    );
  }

  toggleFormVisibility(): void {
    this.formVisible = !this.formVisible;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (!file.type.match('image.*')) {
        this.apiError = 'Seules les images sont autorisées';
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        this.apiError = 'L\'image ne doit pas dépasser 2MB';
        return;
      }

      this.selectedFile = file;
      this.apiError = null;
      
      const reader = new FileReader();
      reader.onload = () => this.imagePreview = reader.result as string;
      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.selectedFile = undefined;
    this.imagePreview = undefined;
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.apiError = null;

    const formData = new FormData();
    formData.append('nom', this.nom?.value);
    formData.append('type', this.type?.value);

    const descriptionControl = this.form.get('description');
    if (descriptionControl && descriptionControl.value) {
      formData.append('description', descriptionControl.value);
    }

    const activeControl = this.form.get('active');
    if (activeControl != null) {
      formData.append('active', activeControl.value ? '1' : '0');
    }

    const ordreControl = this.form.get('ordre');
    if (ordreControl != null && ordreControl.value !== null && ordreControl.value !== '') {
      formData.append('ordre', ordreControl.value.toString());
    }

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    const request = this.editMode && this.editingId ?
      this.categorieService.update(this.editingId, formData) :
      this.categorieService.create(formData);

    request.subscribe({
      next: () => {
        this.loadCategories();
        this.resetForm();
        this.formVisible = false;
      },
      error: (err) => {
        this.apiError = err.error?.message || 'Une erreur est survenue';
        this.isLoading = false;
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  edit(categorie: Categorie): void {
    if (categorie.id == null) {
      this.apiError = 'Impossible de modifier cette catégorie (id manquant).';
      return;
    }

    this.form.patchValue({
      nom: categorie.nom,
      type: categorie.type,
      description: categorie.description ?? '',
      active: categorie.active ?? true,
      ordre: categorie.ordre ?? 0
    });

    this.editMode = true;
    this.editingId = categorie.id;
    this.imagePreview = categorie.imageUrl;
    this.selectedFile = undefined;
    this.formVisible = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  delete(id: number): void {
    if (confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      this.categorieService.delete(id).subscribe({
        next: () => this.loadCategories(),
        error: (err) => {
          this.apiError = 'Échec de la suppression';
          console.error(err);
        }
      });
    }
  }

  resetForm(): void {
    this.form.reset({
      nom: '',
      type: '',
      description: '',
      active: true,
      ordre: 0
    });

    this.editMode = false;
    this.editingId = undefined;
    this.selectedFile = undefined;
    this.imagePreview = undefined;
    this.apiError = null;
    Object.values(this.form.controls).forEach(ctrl => ctrl.markAsUntouched());
  }

  startAutoSlide(): void {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  stopAutoSlide(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  nextSlide(): void {
    this.stopAutoSlide();
    if (this.currentSlide < this.featuredCategories.length - 1) {
      this.currentSlide++;
    } else {
      this.currentSlide = 0;
    }
    this.startAutoSlide();
  }

  prevSlide(): void {
    this.stopAutoSlide();
    if (this.currentSlide > 0) {
      this.currentSlide--;
    } else {
      this.currentSlide = this.featuredCategories.length - 1;
    }
    this.startAutoSlide();
  }

  goToSlide(index: number): void {
    this.stopAutoSlide();
    this.currentSlide = index;
    this.startAutoSlide();
  }

  getProductCount(categoryId: number): number {
    // À remplacer par un appel API réel
    return Math.floor(Math.random() * 50) + 5;
  }

  subscribeNewsletter(event: Event): void {
    event.preventDefault();
    // Implémentez la logique d'abonnement ici
    alert('Merci pour votre abonnement à notre newsletter!');
  }

  trackByCategoryId(index: number, categorie: Categorie): number {
    return categorie.id!;
  }

  scrollToCategories(): void {
  const element = document.getElementById('categories');
  if (element) {
    element.scrollIntoView({
      behavior: 'smooth',
      block: 'start'
    });
  }
}

getImageUrl = (image?: string) => ImageHelper.getStorageUrl(image);

}