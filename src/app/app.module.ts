import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CommonModule } from '@angular/common';

// HTTP
import { provideHttpClient, withFetch, withInterceptorsFromDi, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './interceptors/auth.interceptor';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Composants Client
import { NavbarComponent } from './pages/navbar/navbar.component';
import { HomeComponent } from './pages/home/home.component';
import { ProduitComponent } from './pages/produits/produit/produit.component';
import { ProductDetailComponent } from './pages/produits/detail-produit/detail-produit.component';
import { PanierComponent } from './pages/panier/panier/panier.component';
import { CategorieComponent } from './pages/categorie/categorie/categorie.component';
import { DetailCategorieComponent } from './pages/categorie/detail-categorie/detail-categorie.component';
import { ClientCategoriesComponent } from './pages/client-categories/client-categories.component';
import { CommandeComponent } from './pages/commande/commande.component';
import { MesCommandesComponent } from './pages/commande/mes-commandes/mes-commandes.component';
import { ConfirmationComponent } from './confirmation/confirmation.component';
import { ProfilComponent } from './pages/profil/profil.component';
import { ConnexionComponent } from './auth/connexion/connexion.component';
import { InscriptionComponent } from './auth/inscription/inscription.component';
import { NouveautesComponent } from './pages/nouveautes/nouveautes.component';

// Composants Admin
import { AdminLayoutComponent } from './pages/admin/admin-layout/admin-layout.component';
import { AdminDashboardComponent } from './pages/admin/admin-dashboard/admin-dashboard.component';
import { AdminCommandesComponent } from './pages/admin/admin-commandes/admin-commandes.component';
import { AdminCommandeDetailComponent } from './pages/admin/admin-commande-detail/admin-commande-detail.component';
import { AdminProduitsComponent } from './pages/admin/admin-produits/admin-produits.component';
import { ProduitAjoutComponent } from './pages/produits/produit-ajout/produit-ajout.component';
import { ProduitEditionComponent } from './pages/produits/produit-edition/produit-edition.component';
import { AdminCategoriesComponent } from './pages/admin/admin-categories/admin-categories.component';
import { AdminCategorieDetailComponent } from './pages/admin/admin-categorie-detail/admin-categorie-detail.component';
import { AdminUsersComponent } from './pages/admin/admin-users/admin-users.component';
import { AdminUserDetailComponent } from './pages/admin/admin-user-detail/admin-user-detail.component';
import { AdminProfilComponent } from './pages/admin/admin-profil/admin-profil.component';

// Utilitaires et Partagés
import { NotFoundComponent } from './utils/not-found/not-found.component';
import { BanniereComponent } from './shared/banniere/banniere.component';
import { FooterComponent } from './shared/footer/footer.component';
import { CardProduitComponent } from './shared/card-produit/card-produit.component';
import { SectionStatsComponent } from './shared/section-stats/section-stats.component';
import { ContactInfoComponent } from './components/contact-info/contact-info.component';
import { LivraisonComponent } from './components/livraison/livraison.component';
import { TruncatePipe } from './shared/pipes/truncate.pipe';

@NgModule({
  declarations: [
    AppComponent,
    ProduitComponent,
    NavbarComponent,
    ConnexionComponent,
    InscriptionComponent,
    HomeComponent,
    NotFoundComponent,
    PanierComponent,
    BanniereComponent,
    FooterComponent,
    CardProduitComponent,
    SectionStatsComponent,
    ProduitAjoutComponent,
    ProduitEditionComponent,
    TruncatePipe,
    ProductDetailComponent,
    CommandeComponent,
    ConfirmationComponent,
    CategorieComponent,
    DetailCategorieComponent,
    ProfilComponent,
    MesCommandesComponent,
    AdminLayoutComponent,
    AdminDashboardComponent,
    AdminCommandesComponent,
    AdminCommandeDetailComponent,
    AdminCategorieDetailComponent,
    AdminUsersComponent,
    AdminUserDetailComponent,
    AdminProduitsComponent,
    AdminCategoriesComponent,
    AdminProfilComponent,
    ClientCategoriesComponent,
    ContactInfoComponent,
    LivraisonComponent,
    NouveautesComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    CommonModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    BrowserAnimationsModule,
    MatSelectModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule
  ],
  providers: [
    provideHttpClient(
      withFetch(),
      withInterceptorsFromDi() 
    ), 
    { 
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true,
    }, 
    provideAnimationsAsync(), provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }