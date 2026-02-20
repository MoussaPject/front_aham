import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Categorie } from '../../../models/categorie';
import { CategorieService } from '../../../services/categorie/categorie.service';

@Component({
  selector: 'app-admin-categories',
  templateUrl: './admin-categories.component.html',
  styleUrls: ['./admin-categories.component.css'],
})
export class AdminCategoriesComponent implements OnInit {
  categories: Categorie[] = [];
  isLoading = false;
  apiError: string | null = null;
  isSaving = false;

  newCategory: {
    nom: string;
    type: 'tissu' | 'mercerie' | '';
    description?: string;
    active: boolean;
    ordre: number | null;
  } = {
    nom: '',
    type: '',
    description: '',
    active: true,
    ordre: 0,
  };

  selectedFile?: File;

  constructor(private categorieService: CategorieService, private router: Router) {}

  ngOnInit(): void {
    this.loadCategories();
  }

  loadCategories(): void {
    this.isLoading = true;
    this.categorieService.getAll().subscribe({
      next: (data) => {
        this.categories = data;
        this.isLoading = false;
      },
      error: (err) => {
        this.apiError = 'Erreur lors du chargement des catégories';
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];
    }
  }

  resetForm(): void {
    this.newCategory = {
      nom: '',
      type: '',
      description: '',
      active: true,
      ordre: 0,
    };
    this.selectedFile = undefined;
    this.apiError = null;
  }

  addCategory(): void {
    if (!this.newCategory.nom || !this.newCategory.type) {
      return;
    }

    this.isSaving = true;
    this.apiError = null;

    const formData = new FormData();
    formData.append('nom', this.newCategory.nom);
    formData.append('type', this.newCategory.type);

    if (this.newCategory.description) {
      formData.append('description', this.newCategory.description);
    }

    formData.append('active', this.newCategory.active ? '1' : '0');

    if (this.newCategory.ordre !== null) {
      formData.append('ordre', String(this.newCategory.ordre));
    }

    if (this.selectedFile) {
      formData.append('image', this.selectedFile);
    }

    this.categorieService.create(formData).subscribe({
      next: () => {
        this.resetForm();
        this.loadCategories();
        this.isSaving = false;
      },
      error: (err) => {
        this.apiError = err.error?.message || 'Erreur lors de la création de la catégorie';
        console.error(err);
        this.isSaving = false;
      },
    });
  }

  toggleActive(cat: Categorie): void {
    if (!cat.id) { return; }
    const formData = new FormData();
    formData.append('nom', cat.nom);
    formData.append('type', cat.type);
    if (cat.description) { formData.append('description', cat.description); }
    formData.append('active', cat.active ? '0' : '1');
    if (typeof cat.ordre === 'number') { formData.append('ordre', String(cat.ordre)); }

    this.categorieService.update(cat.id, formData).subscribe({
      next: () => this.loadCategories(),
      error: (err) => {
        this.apiError = 'Erreur lors de la mise à jour de la catégorie';
        console.error(err);
      },
    });
  }

  deleteCategorie(cat: Categorie): void {
    if (!cat.id || !confirm('Supprimer cette catégorie ?')) { return; }
    this.categorieService.delete(cat.id).subscribe({
      next: () => this.loadCategories(),
      error: (err) => {
        this.apiError = 'Erreur lors de la suppression de la catégorie';
        console.error(err);
      },
    });
  }

  goToDetail(cat: Categorie): void {
    if (!cat.id) { return; }
    this.router.navigate(['/admin/categories', cat.id]);
  }
}
