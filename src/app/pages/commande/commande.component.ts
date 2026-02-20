import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { CommandeService } from '../../services/commande/commande.service';
import { AvisService } from '../../services/Avis/avis-service.service';
import { Commande, CommandeItem } from '../../models/commande.model';

@Component({
  selector: 'app-commande',
  templateUrl: './commande.component.html',
  styleUrls: ['./commande.component.css']
})
export class CommandeComponent implements OnInit {
  commande?: Commande;
  livraisonForm: FormGroup;
  isLoading = false;
  isSaving = false;
  errorMessage: string | null = null;
  successMessage: string | null = null;
  avisNotes: { [produitId: number]: number | null } = {};
  avisCommentaires: { [produitId: number]: string } = {};
  avisLoading: { [produitId: number]: boolean } = {};
  avisSuccess: { [produitId: number]: string | null } = {};
  avisError: { [produitId: number]: string | null } = {};

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private commandeService: CommandeService,
    private avisService: AvisService
  ) {
    this.livraisonForm = this.fb.group({
      nom_client: ['', Validators.required],
      telephone: ['', Validators.required],
      adresse: ['', Validators.required],
      ville: ['', Validators.required],
      instructions: ['']
    });
  }

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    if (!id) {
      this.router.navigate(['/panier']);
      return;
    }
    this.chargerCommande(id);
  }

  chargerCommande(id: number): void {
    this.isLoading = true;
    this.errorMessage = null;

    this.commandeService.getCommande(id).subscribe({
      next: (commande) => {
        this.isLoading = false;
        this.commande = commande;
        if (commande && commande.livraison) {
          this.livraisonForm.patchValue({
            nom_client: commande.livraison.nom_client || '',
            telephone: commande.livraison.telephone || '',
            adresse: commande.livraison.adresse || '',
            ville: commande.livraison.ville || '',
            instructions: commande.livraison.instructions || ''
          });
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Erreur chargement commande :', error);
        this.errorMessage = error?.error?.message || 'Erreur lors du chargement de la commande.';
      }
    });
  }

  onSubmit(): void {
    if (!this.commande || this.livraisonForm.invalid) {
      this.livraisonForm.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    this.errorMessage = null;
    this.successMessage = null;

    this.commandeService
      .creerOuMettreAJourLivraison(this.commande.id, this.livraisonForm.value)
      .subscribe({
        next: () => {
          this.isSaving = false;
          this.successMessage = 'Informations de livraison enregistrées. Vous recevrez un email avec le récapitulatif de votre commande.';
        },
        error: (error) => {
          this.isSaving = false;
          console.error('Erreur enregistrement livraison :', error);
          this.errorMessage = error?.error?.message || 'Erreur lors de l\'enregistrement des informations de livraison.';
        }
      });
  }

  retournerAuCatalogue(): void {
    this.router.navigate(['/mes-commandes']);
  }

  estCommandeLivree(): boolean {
    const s = this.normaliserStatut(this.commande?.statut);
    return s === 'livree' || s === 'livrée';
  }

  private normaliserStatut(statut: string | undefined | null): string {
    return (statut || '').toLowerCase();
  }

  getStepIndex(): number {
    const s = this.normaliserStatut(this.commande?.statut);
    if (s === 'livree' || s === 'livrée') {
      return 4;
    }
    if (s === 'expediee' || s === 'expédiée') {
      return 3;
    }
    if (s === 'confirmee' || s === 'confirmée') {
      return 2;
    }
    // Par défaut "En Attente"
    return 1;
  }

  getStatutLabel(): string {
    const s = this.normaliserStatut(this.commande?.statut);
    switch (s) {
      case 'en_attente':
      case 'en attente':
        return 'En Attente';
      case 'confirmee':
      case 'confirmée':
        return 'Confirmée';
      case 'expediee':
      case 'expédiée':
        return 'Expédiée';
      case 'livree':
      case 'livrée':
        return 'Livrée';
      default:
        return this.commande?.statut || 'En cours';
    }
  }

  getEtapeDescription(): string {
    const s = this.normaliserStatut(this.commande?.statut);

    if (s === 'en_attente' || s === 'en attente') {
      return 'Commande reçue, en attente de confirmation.';
    }
    if (s === 'confirmee' || s === 'confirmée') {
      return 'Commande confirmée, préparation des articles en cours.';
    }
    if (s === 'expediee' || s === 'expédiée') {
      return 'Commande expédiée, votre colis est en route.';
    }
    if (s === 'livree' || s === 'livrée') {
      return 'Commande livrée. Merci pour votre confiance !';
    }

    return 'Commande en cours de traitement.';
  }

  soumettreAvis(item: CommandeItem): void {
    const produit = item?.produit;
    const produitId = produit?.id;

    if (!this.estCommandeLivree() || !produitId) {
      return;
    }

    const note = this.avisNotes[produitId];

    if (!note || note < 1 || note > 5) {
      this.avisError[produitId] = 'Merci de choisir une note entre 1 et 5.';
      return;
    }

    this.avisLoading[produitId] = true;
    this.avisError[produitId] = null;
    this.avisSuccess[produitId] = null;

    this.avisService.ajouterAvis({
      produit_id: produitId,
      note,
      commentaire: this.avisCommentaires[produitId] || undefined,
    }).subscribe({
      next: () => {
        this.avisLoading[produitId] = false;
        this.avisSuccess[produitId] = 'Merci pour votre avis.';
      },
      error: (error) => {
        this.avisLoading[produitId] = false;
        this.avisError[produitId] = error?.error?.message || 'Impossible d\'enregistrer votre avis pour le moment.';
      }
    });
  }

  onImageError(event: Event): void {
    (event.target as HTMLImageElement).src = 'assets/images/no-image.jpg';
  }
}
