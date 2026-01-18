/**
 * Interface image
 */
export interface Image {
  id: string;
  data: string; // Base64 encoded image data
  mimeType: string;
  filename?: string;
  propertyId?: string;
  vehicleId?: string;
  createdAt: Date;
}

/**
 * DTO pour l'upload d'image
 */
export interface UploadImageDto {
  data: string; // Base64 encoded
  mimeType: string;
  filename?: string;
}

/**
 * Réponse upload d'image
 */
export interface ImageUploadResponse {
  id: string;
  data: string;
  mimeType: string;
}
