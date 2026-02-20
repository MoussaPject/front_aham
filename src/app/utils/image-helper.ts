import { environment } from '../../environments/environment';

/**
 * Helper pour générer les URLs des images selon l'environnement
 */
export class ImageHelper {
  
  /**
   * Génère l'URL complète d'une image de stockage
   * @param imagePath - Chemin de l'image (ex: "produits/image.jpg")
   * @returns URL complète ou image par défaut
   */
  static getStorageUrl(imagePath?: string): string {
    if (!imagePath) {
      return 'assets/images/no-image.jpg';
    }
    
    return `${environment.storageUrl}/${imagePath}`;
  }
  
  /**
   * Génère l'URL complète d'une image de produit
   * @param image - Nom de l'image du produit
   * @returns URL complète ou image par défaut
   */
  static getProduitImageUrl(image?: string): string {
    return this.getStorageUrl(image);
  }
  
  /**
   * Génère l'URL complète d'une image de catégorie
   * @param image - Nom de l'image de catégorie
   * @returns URL complète ou image par défaut
   */
  static getCategorieImageUrl(image?: string): string {
    return this.getStorageUrl(image);
  }
  
  /**
   * Génère l'URL complète d'une image utilisateur
   * @param image - Nom de l'image utilisateur
   * @returns URL complète ou image par défaut
   */
  static getUserImageUrl(image?: string): string {
    return this.getStorageUrl(image);
  }
}
