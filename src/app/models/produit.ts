export interface Produit {
  id: number;
  nom: string;
  description?: string;

  prix: number;
  prix_promo?: number;
  prix_au_metre?: number;
  vendu_au_metre?: boolean;

  quantite: number;
  unite: string;
  type: 'tissu' | 'mercerie';

  categorie_id: number;
  categorie?: any;

  image?: string;
  images?: ProduitImage[];

  matiere?: string;
  couleur?: string;
  motif?: string;
  largeur?: string;
  poids?: number;
  origine?: string;

  en_promotion?: boolean;
  visible?: boolean;

  created_at?: string;
  updated_at?: string;
  slug: string; 

  
}


export interface ProduitImage {
  id: number;
  image: string;
  principale: boolean;
}

export interface ProduitSlugResponse {
  produit: Produit;
}

