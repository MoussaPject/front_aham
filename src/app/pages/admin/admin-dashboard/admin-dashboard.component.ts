import { Component, OnInit } from '@angular/core';
import { HomeService } from '../../../services/home/home.service';


@Component({
  selector: 'app-admin-dashboard',
  templateUrl: './admin-dashboard.component.html',
  styleUrls: ['./admin-dashboard.component.css'],
})
export class AdminDashboardComponent implements OnInit {
  isLoading = false;
  apiError: string | null = null;

  stats = {
    nombreProduits: 0,
    nombreCommandes: 0,
    nombreClients: 0,
    ventesJour: 0,
    ventesSemaine: 0,
    ventesMois: 0,
  };

  constructor(private homeService: HomeService) {}

  ngOnInit(): void {
    this.loadStats();
  }

  loadStats(): void {
    this.isLoading = true;
    this.homeService.getStats().subscribe({
      next: (data) => {
        this.stats = {
          nombreProduits: data.nombreProduits ?? 0,
          nombreCommandes: data.nombreCommandes ?? 0,
          nombreClients: data.nombreClients ?? 0,
          ventesJour: data.ventesJour ?? 0,
          ventesSemaine: data.ventesSemaine ?? 0,
          ventesMois: data.ventesMois ?? 0,
        };
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.apiError = 'Erreur lors du chargement des statistiques du tableau de bord';
        this.isLoading = false;
      },
    });
  }
}
