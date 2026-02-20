import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProduitService } from '../../../services/produit/produit.service';
import { Categorie } from '../../../models/categorie';
import { CategorieService } from '../../../services/categorie/categorie.service';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-produit-edition',
  templateUrl: './produit-edition.component.html'
})
export class ProduitEditionComponent implements OnInit {
  produit: any;
  selectedFiles: File[] = [];
  categories: Categorie[] = [];
  produitId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private produitService: ProduitService,
    private categorieService: CategorieService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.produitId = +idParam;

      // Charger les données du produit
      this.produitService.getProduits().subscribe({
        next: (data: any) => {
          this.produit = data;
        },
        error: (err: any) => console.error('Erreur chargement produit', err)
      });

      // Charger la liste des catégories (indispensable pour le select)
      this.categorieService.getCategories().subscribe({
        next: (cats: Categorie[]) => {
          this.categories = cats;
        },
        error: (err: any) => console.error('Erreur chargement catégories', err)
      });
    }
  }

  onCategorieChange(categorieId: any): void {
    const selectedId = Number(categorieId);
    const selectedCat = this.categories.find(c => c.id === selectedId);
    if (selectedCat) {
      this.produit.categorie_id = selectedCat.id;
      this.produit.type = selectedCat.type; // Mise à jour automatique du type
    }
  }

  onFilesSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.selectedFiles = input.files ? Array.from(input.files) : [];
  }

  modifierProduit(): void {
    const formData = new FormData();

    // On construit un payload contrôlé avec uniquement les champs utiles
    const payload: any = {
      nom: this.produit.nom,
      description: this.produit.description,
      prix: this.produit.prix,
      prix_promo: this.produit.prix_promo,
      quantite: this.produit.quantite,
      unite: this.produit.unite,
      type: this.produit.type,
      categorie_id: this.produit.categorie_id,
      en_promotion: this.produit.en_promotion ? 1 : 0,
    };

    // Si le produit n'est pas en promotion, on ne doit pas envoyer de prix_promo
    if (!payload.en_promotion) {
      delete payload.prix_promo;
    }

    // Si prix_promo est une chaîne vide ou null, on la supprime pour éviter l'erreur numeric
    if (payload.prix_promo === '' || payload.prix_promo === null || payload.prix_promo === undefined) {
      delete payload.prix_promo;
    }

    // On ajoute tous les champs nettoyés du produit au FormData
    Object.keys(payload).forEach(key => {
      if (payload[key] !== null && payload[key] !== undefined) {
        formData.append(key, payload[key]);
      }
    });

    // Gestion de l'image principale
    if (this.selectedFiles.length > 0) {
      formData.append('image', this.selectedFiles[0]);
    }

    this.produitService.updateProduit(this.produitId, formData).subscribe({
      next: (updatedProduit: any) => {
        // Si plus d'une image a été sélectionnée, on les envoie
        if (this.selectedFiles.length > 1) {
          const extraFiles = this.selectedFiles.slice(1);
          const uploads$ = extraFiles.map(file => 
            this.produitService.uploadProduitImage(this.produitId, file)
          );

          forkJoin(uploads$).subscribe({
            next: () => this.router.navigate(['/admin/produits']),
            error: () => this.router.navigate(['/admin/produits'])
          });
        } else {
          this.router.navigate(['/admin/produits']);
        }
      },
      error: (err: any) => console.error('Erreur lors de la modification', err)
    });
  }
}