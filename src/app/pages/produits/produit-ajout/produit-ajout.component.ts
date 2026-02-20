import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ProduitService } from '../../../services/produit/produit.service';
import { CategorieService } from '../../../services/categorie/categorie.service';
import { Categorie } from '../../../models/categorie';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-produit-ajout',
  templateUrl: './produit-ajout.component.html'
})
export class ProduitAjoutComponent implements OnInit {
  produit: any = {};
  selectedFiles: File[] = [];
  categories: Categorie[] = [];


  constructor(
    private produitService: ProduitService,
    private categorieService: CategorieService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.categorieService.getCategories().subscribe(data => {
      this.categories = data;
    });
  }

  onCategorieChange(categorieId: number) {
    const selectedCat = this.categories.find(c => c.id === +categorieId);
    if (selectedCat?.id != null) {
      this.produit.categorie_id = selectedCat.id;
      this.produit.type = selectedCat.type;
    }
  }

  onFilesSelected(event: Event) {
    const fileInput = event.target as HTMLInputElement;
    this.selectedFiles = fileInput.files ? Array.from(fileInput.files) : [];
  }

  ajouterProduit() {
    const formData = new FormData();
    for (const key in this.produit) {
      if (this.produit.hasOwnProperty(key)) {
        formData.append(key, this.produit[key]);
      }
    }
    if (this.selectedFiles.length > 0) {
      // La première image est utilisée comme image principale du produit
      formData.append('image', this.selectedFiles[0]);
    }

    this.produitService.createProduit(formData).subscribe((createdProduit) => {
      const produitId = createdProduit.id;

      if (produitId && this.selectedFiles.length > 1) {
        const extraFiles = this.selectedFiles.slice(1);
        const uploads$ = extraFiles.map(file => this.produitService.uploadProduitImage(produitId, file));

        forkJoin(uploads$).subscribe({
          next: () => this.router.navigate(['/produits']),
          error: () => this.router.navigate(['/produits'])
        });
      } else {
        this.router.navigate(['/produits']);
      }
    });
  }

  
  
  
}
