import { Controller, Get, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UploadService } from './upload.service';
import { UploadImagesDto } from './dto';
import { JwtAuthGuard } from '../../common/guards';
import { Public } from '../../common/decorators';

@ApiTags('Upload')
@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @UseGuards(JwtAuthGuard)
  @Post('images')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Upload plusieurs images' })
  @ApiResponse({ status: 201, description: 'Images uploadées' })
  async uploadImages(@Body() dto: UploadImagesDto) {
    const images = await this.uploadService.uploadImages(dto.images);
    return {
      success: true,
      message: 'Images uploadées avec succès',
      data: images,
    };
  }

  @Public()
  @Get('images/:id')
  @ApiOperation({ summary: 'Récupérer une image par son ID' })
  @ApiResponse({ status: 200, description: 'Image trouvée' })
  @ApiResponse({ status: 404, description: 'Image non trouvée' })
  async getImage(@Param('id') id: string) {
    const image = await this.uploadService.getImage(id);
    return {
      success: true,
      data: image,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete('images/:id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une image' })
  @ApiResponse({ status: 200, description: 'Image supprimée' })
  @ApiResponse({ status: 404, description: 'Image non trouvée' })
  async deleteImage(@Param('id') id: string) {
    const result = await this.uploadService.deleteImage(id);
    return {
      success: true,
      ...result,
    };
  }
}
