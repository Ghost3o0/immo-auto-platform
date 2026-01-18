import { Controller, Get, Put, Post, Delete, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto, ChangePasswordDto, UpdateNotificationPreferencesDto } from './dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par son ID' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findOne(id);
    return {
      success: true,
      data: user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    const user = await this.usersService.update(id, dto, currentUserId);
    return {
      success: true,
      message: 'Profil mis à jour',
      data: user,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async delete(@Param('id') id: string, @CurrentUser('id') currentUserId: string) {
    const result = await this.usersService.delete(id, currentUserId);
    return {
      success: true,
      ...result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/change-password')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Changer le mot de passe d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Mot de passe changé' })
  @ApiResponse({ status: 401, description: 'Mot de passe actuel incorrect' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    const user = await this.usersService.changePassword(id, dto, currentUserId);
    return {
      success: true,
      message: 'Mot de passe changé avec succès',
      data: user,
    };
  }

  @Public()
  @Get(':id/listings')
  @ApiOperation({ summary: 'Récupérer les annonces d\'un utilisateur' })
  @ApiResponse({ status: 200, description: 'Annonces récupérées' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async getUserListings(@Param('id') id: string) {
    const listings = await this.usersService.getUserListings(id);
    return {
      success: true,
      data: listings,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/notification-preferences')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer les préférences de notifications' })
  @ApiResponse({ status: 200, description: 'Préférences récupérées' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async getNotificationPreferences(
    @Param('id') id: string,
    @CurrentUser('id') currentUserId: string,
  ) {
    const preferences = await this.usersService.getNotificationPreferences(id);
    return {
      success: true,
      data: preferences,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id/notification-preferences')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour les préférences de notifications' })
  @ApiResponse({ status: 200, description: 'Préférences mises à jour' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  async updateNotificationPreferences(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationPreferencesDto,
    @CurrentUser('id') currentUserId: string,
  ) {
    const preferences = await this.usersService.updateNotificationPreferences(id, dto, currentUserId);
    return {
      success: true,
      message: 'Préférences mises à jour',
      data: preferences,
    };
  }}