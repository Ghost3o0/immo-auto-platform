import { Controller, Get, Post, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Favorites')
@Controller('favorites')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FavoritesController {
  constructor(private readonly favoritesService: FavoritesService) {}

  @Get()
  @ApiOperation({ summary: 'Récupérer tous les favoris de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Liste des favoris' })
  async findAll(@CurrentUser('id') userId: string) {
    const favorites = await this.favoritesService.findAll(userId);
    return {
      success: true,
      data: favorites,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Ajouter un favori' })
  @ApiResponse({ status: 201, description: 'Favori ajouté' })
  @ApiResponse({ status: 409, description: 'Favori déjà existant' })
  async create(@Body() dto: CreateFavoriteDto, @CurrentUser('id') userId: string) {
    const favorite = await this.favoritesService.create(dto, userId);
    return {
      success: true,
      message: 'Ajouté aux favoris',
      data: favorite,
    };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Supprimer un favori' })
  @ApiResponse({ status: 200, description: 'Favori supprimé' })
  @ApiResponse({ status: 404, description: 'Favori non trouvé' })
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.favoritesService.delete(id, userId);
    return {
      success: true,
      ...result,
    };
  }

  @Get('check')
  @ApiOperation({ summary: 'Vérifier si un élément est en favori' })
  @ApiResponse({ status: 200, description: 'Statut du favori' })
  async isFavorite(
    @Query('propertyId') propertyId: string,
    @Query('vehicleId') vehicleId: string,
    @CurrentUser('id') userId: string,
  ) {
    const result = await this.favoritesService.isFavorite(userId, propertyId, vehicleId);
    return {
      success: true,
      data: result,
    };
  }
}
