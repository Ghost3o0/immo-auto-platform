import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ListingStatus } from '@prisma/client';
import { PropertiesService } from './properties.service';
import { CreatePropertyDto, UpdatePropertyDto, QueryPropertyDto } from './dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('Properties')
@Controller('properties')
export class PropertiesController {
  constructor(private readonly propertiesService: PropertiesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer une nouvelle propriété' })
  @ApiResponse({ status: 201, description: 'Propriété créée' })
  async create(@Body() dto: CreatePropertyDto, @CurrentUser('id') userId: string) {
    const property = await this.propertiesService.create(dto, userId);
    return {
      success: true,
      message: 'Propriété créée avec succès',
      data: property,
    };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Récupérer toutes les propriétés avec filtres' })
  @ApiResponse({ status: 200, description: 'Liste des propriétés' })
  async findAll(@Query() query: QueryPropertyDto) {
    const result = await this.propertiesService.findAll(query);
    return {
      success: true,
      ...result,
    };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer une propriété par son ID' })
  @ApiResponse({ status: 200, description: 'Propriété trouvée' })
  @ApiResponse({ status: 404, description: 'Propriété non trouvée' })
  async findOne(@Param('id') id: string) {
    const property = await this.propertiesService.findOne(id);
    return {
      success: true,
      data: property,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour une propriété' })
  @ApiResponse({ status: 200, description: 'Propriété mise à jour' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Propriété non trouvée' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdatePropertyDto,
    @CurrentUser('id') userId: string,
  ) {
    const property = await this.propertiesService.update(id, dto, userId);
    return {
      success: true,
      message: 'Propriété mise à jour',
      data: property,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer une propriété' })
  @ApiResponse({ status: 200, description: 'Propriété supprimée' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Propriété non trouvée' })
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.propertiesService.delete(id, userId);
    return {
      success: true,
      ...result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour le statut d\'une propriété' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Propriété non trouvée' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ListingStatus,
    @CurrentUser('id') userId: string,
  ) {
    const property = await this.propertiesService.updateStatus(id, status, userId);
    return {
      success: true,
      message: 'Statut mis à jour',
      data: property,
    };
  }
}
