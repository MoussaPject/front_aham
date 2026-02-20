import { Produit } from './produit';

export interface Commande {
  id: number;
  reference: string;
  total: number;
  statut: string;
  date_commande: string;
  items: CommandeItem[];
  user?: {
    id: number;
    name: string;
    email: string;
    role?: string;
  };
  // Informations de livraison associées à la commande (chargées via relation livraison)
  livraison?: {
    nom_client?: string;
    telephone?: string;
    adresse?: string;
    ville?: string;
    transporteur?: string;
    frais?: number;
    statut?: string;
    date_livraison?: string;
    instructions?: string;
  };

  // Informations de paiement éventuelles
  paiement?: {
    methode?: string;
    montant?: number;
    statut?: string;
  };

  // Champs complémentaires stockés directement sur la commande
  mode_livraison?: string;
  note_client?: string;
}

export interface CommandeItem {
  produit: Produit;
  quantite: number;
  prix_unitaire: number;
}
