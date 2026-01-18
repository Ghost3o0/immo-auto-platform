import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class UploadService {
  private readonly maxFileSize = 5 * 1024 * 1024; // 5MB
  private readonly allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  constructor(private prisma: PrismaService) {}

  /**
   * Upload plusieurs images
   */
  async uploadImages(images: string[]) {
    const uploadedImages = [];

    for (const data of images) {
      const mimeType = this.getMimeType(data);

      // Vérifier le type MIME
      if (!this.allowedMimeTypes.includes(mimeType)) {
        throw new BadRequestException(`Type de fichier non supporté: ${mimeType}`);
      }

      // Vérifier la taille approximative
      const sizeInBytes = (data.length * 3) / 4;
      if (sizeInBytes > this.maxFileSize) {
        throw new BadRequestException('L\'image dépasse la taille maximale autorisée (5MB)');
      }

      const image = await this.prisma.image.create({
        data: {
          data,
          mimeType,
        },
      });

      uploadedImages.push({
        id: image.id,
        mimeType: image.mimeType,
      });
    }

    return uploadedImages;
  }

  /**
   * Récupère une image par son ID
   */
  async getImage(id: string) {
    const image = await this.prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Image non trouvée');
    }

    return image;
  }

  /**
   * Supprime une image
   */
  async deleteImage(id: string) {
    const image = await this.prisma.image.findUnique({
      where: { id },
    });

    if (!image) {
      throw new NotFoundException('Image non trouvée');
    }

    await this.prisma.image.delete({
      where: { id },
    });

    return { message: 'Image supprimée avec succès' };
  }

  /**
   * Détermine le type MIME d'une image base64
   */
  private getMimeType(base64: string): string {
    if (base64.startsWith('data:image/jpeg') || base64.startsWith('data:image/jpg')) {
      return 'image/jpeg';
    }
    if (base64.startsWith('data:image/png')) {
      return 'image/png';
    }
    if (base64.startsWith('data:image/gif')) {
      return 'image/gif';
    }
    if (base64.startsWith('data:image/webp')) {
      return 'image/webp';
    }
    return 'image/jpeg';
  }
}
