import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// --- PAGES PUBLIQUES ---
import { HomeComponent } from './pages/home/home.component';
import { ProduitComponent } from './pages/produits/produit/produit.component';
import { ProductDetailComponent } from './pages/produits/detail-produit/detail-produit.component';
import { CategorieComponent } from './pages/categorie/categorie/categorie.component';
import { DetailCategorieComponent } from './pages/categorie/detail-categorie/detail-categorie.component';
import { ConnexionComponent } from './auth/connexion/connexion.component';
import { InscriptionComponent } from './auth/inscription/inscription.component';
import { PanierComponent } from './pages/panier/panier/panier.component';
import { ProfilComponent } from './pages/profil/profil.component';
import { MesCommandesComponent } from './pages/commande/mes-commandes/mes-commandes.component';
import { CommandeComponent } from './pages/commande/commande.component';
import { NotFoundComponent } from './utils/not-found/not-found.component';
import { LivraisonComponent } from './components/livraison/livraison.component';
import { ContactInfoComponent } from './components/contact-info/contact-info.component';
import { NouveautesComponent } from './pages/nouveautes/nouveautes.component';

// --- PAGES ADMIN ---
import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { AdminProfilComponent } from './pages/admin/admin-profil/admin-profil.component';
import { AdminProduitsComponent } from './pages/admin/admin-produits/admin-produits.component';
import { ProduitAjoutComponent } from './pages/produits/produit-ajout/produit-ajout.component';
import { ProduitEditionComponent } from './pages/produits/produit-edition/produit-edition.component';
import { AdminCategoriesComponent } from './pages/admin/admin-categories/admin-categories.component';
import { AdminCategorieDetailComponent } from './pages/admin/admin-categorie-detail/admin-categorie-detail.component';
import { AdminCommandesComponent } from './pages/admin/admin-commandes/admin-commandes.component';
import { AdminCommandeDetailComponent } from './pages/admin/admin-commande-detail/admin-commande-detail.component';
import { AdminUsersComponent } from './pages/admin/admin-users/admin-users.component';
import { AdminUserDetailComponent } from './pages/admin/admin-user-detail/admin-user-detail.component';

// --- GUARDS ---
import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  // --- ROUTES PUBLIQUES ---
  { path: '', component: HomeComponent },
  { path: 'home', redirectTo: '', pathMatch: 'full' },  // Redirection SEO propre

  { path: 'livraison', component: LivraisonComponent },
  { path: 'contact', component: ContactInfoComponent },
  { path: 'nouveautes', component: NouveautesComponent },

  { path: 'connexion', component: ConnexionComponent },
  { path: 'inscription', component: InscriptionComponent },

  // Produits
  { path: 'produits', component: ProduitComponent },                // Listing global
  { path: 'produit/:slug', component: ProductDetailComponent },     // Détail produit SEO-friendly

  // Catégories
  { path: 'categories', component: CategorieComponent },            // Listing catégories
  { path: 'categorie/:slug', component: DetailCategorieComponent }, // Détail catégorie SEO-friendly

  // --- ROUTES CLIENTS CONNECTÉS ---
  { path: 'panier', component: PanierComponent, canActivate: [AuthGuard] },
  { path: 'profil', component: ProfilComponent, canActivate: [AuthGuard] },
  { path: 'mes-commandes', component: MesCommandesComponent, canActivate: [AuthGuard] },
  { path: 'commande/:id', component: CommandeComponent, canActivate: [AuthGuard] },

  // --- ROUTES ADMIN ---
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [AuthGuard, AdminGuard],
    children: [
      { path: 'dashboard', component: AdminDashboardComponent },
      { path: 'profil', component: AdminProfilComponent },

      // Gestion produits
      { path: 'produits', component: AdminProduitsComponent },
      { path: 'produits/ajouter', component: ProduitAjoutComponent },
      { path: 'produits/modifier/:id', component: ProduitEditionComponent },

      // Gestion catégories
      { path: 'categories', component: AdminCategoriesComponent },
      { path: 'categories/:id', component: AdminCategorieDetailComponent },

      // Gestion commandes et utilisateurs
      { path: 'commandes', component: AdminCommandesComponent },
      { path: 'commandes/:id', component: AdminCommandeDetailComponent },
      { path: 'utilisateurs', component: AdminUsersComponent },
      { path: 'utilisateurs/:id', component: AdminUserDetailComponent },
    ],
  },

  // --- ROUTE 404 ---
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: 'top', // remonte en haut à chaque changement de route
      anchorScrolling: 'enabled',       // scroll vers les ancres
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
