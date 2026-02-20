export interface Categorie {
  id?: number;
  slug?: string;
  nom: string;
  type: 'tissu' | 'mercerie';
  image?: string;
  imageUrl?: string;
  description?: string;
  active?: boolean;
  ordre?: number;
}
