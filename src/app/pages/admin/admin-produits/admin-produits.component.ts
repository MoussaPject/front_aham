import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Produit } from '../../../models/produit';
import { ProduitService } from '../../../services/produit/produit.service';

@Component({
  selector: 'app-admin-produits',
  templateUrl: './admin-produits.component.html',
  styleUrls: ['./admin-produits.component.css'],
})
export class AdminProduitsComponent implements OnInit {
  produits: Produit[] = [];
  isLoading = false;
  apiError: string | null = null;

  // Filtres / recherche / tri utilisés dans le template
  searchTerm = '';
  filterType: '' | 'tissu' | 'mercerie' = '';
  filterStock: '' | 'disponible' | 'faible' | 'rupture' = '';
  sortBy: 'recent' | 'prix' | 'stock' | 'nom' = 'recent';

  constructor(private produitService: ProduitService, private router: Router) {}

  ngOnInit(): void {
    this.loadProduits();
  }

  loadProduits(): void {
    this.isLoading = true;
    // ✅ Correction TS7006 : On type 'data' en Produit[] et 'err' en any
    this.produitService.getProduits().subscribe({
      next: (data: Produit[]) => {
        this.produits = data;
        this.isLoading = false;
      },
      error: (err: any) => {
        this.apiError = 'Erreur lors du chargement des produits';
        console.error(err);
        this.isLoading = false;
      },
    });
  }

  // Liste filtrée / triée consommée par le template
  get filteredProduits(): Produit[] {
    let result = [...this.produits];

    // Recherche par nom / description
    const term = this.searchTerm?.trim().toLowerCase();
    if (term) {
      // ✅ Correction TS7006 : On type explicitement le paramètre 'p'
      result = result.filter((p: Produit) => {
        const nom = p.nom?.toLowerCase() ?? '';
        const desc = p.description?.toLowerCase() ?? '';
        return nom.includes(term) || desc.includes(term);
      });
    }

    // Filtre type (tissu / mercerie)
    if (this.filterType) {
      result = result.filter((p: Produit) => p.type === this.filterType);
    }

    // Filtre stock
    if (this.filterStock) {
      result = result.filter((p: Produit) => {
        if (this.filterStock === 'rupture') {
          return p.quantite === 0;
        }
        if (this.filterStock === 'faible') {
          return p.quantite > 0 && p.quantite <= 5;
        }
        if (this.filterStock === 'disponible') {
          return p.quantite > 0;
        }
        return true;
      });
    }

    // Tri
    result.sort((a: Produit, b: Produit) => {
      switch (this.sortBy) {
        case 'prix':
          return (a.prix ?? 0) - (b.prix ?? 0);
        case 'stock':
          return (b.quantite ?? 0) - (a.quantite ?? 0);
        case 'nom':
          return (a.nom || '').localeCompare(b.nom || '');
        case 'recent':
        default: {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          if (dateA !== dateB) {
            return dateB - dateA;
          }
          return (b.id ?? 0) - (a.id ?? 0);
        }
      }
    });

    return result;
  }

  goToAdd(): void {
    this.router.navigate(['/admin/produits/ajouter']);
  }

  // ✅ Pour l'admin/modification, on utilise toujours l'ID (numérique)
  goToEdit(id: number | undefined): void {
    if (id == null) { return; }
    this.router.navigate(['/admin/produits/modifier', id]);
  }

  deleteProduit(id: number | undefined): void {
    if (id == null) { return; }
    if (!confirm('Supprimer ce produit ?')) { return; }

    // ✅ Correction TS7006 : Type de l'erreur
    this.produitService.deleteProduit(id).subscribe({
      next: () => this.loadProduits(),
      error: (err: any) => {
        this.apiError = 'Erreur lors de la suppression du produit';
        console.error(err);
      },
    });
  }
}