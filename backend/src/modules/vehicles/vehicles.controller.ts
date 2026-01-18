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
import { VehiclesService } from './vehicles.service';
import { CreateVehicleDto, UpdateVehicleDto, QueryVehicleDto } from './dto';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser, Public } from '../../common/decorators';

@ApiTags('Vehicles')
@Controller('vehicles')
export class VehiclesController {
  constructor(private readonly vehiclesService: VehiclesService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouveau véhicule' })
  @ApiResponse({ status: 201, description: 'Véhicule créé' })
  async create(@Body() dto: CreateVehicleDto, @CurrentUser('id') userId: string) {
    const vehicle = await this.vehiclesService.create(dto, userId);
    return {
      success: true,
      message: 'Véhicule créé avec succès',
      data: vehicle,
    };
  }

  @Public()
  @Get()
  @ApiOperation({ summary: 'Récupérer tous les véhicules avec filtres' })
  @ApiResponse({ status: 200, description: 'Liste des véhicules' })
  async findAll(@Query() query: QueryVehicleDto) {
    const result = await this.vehiclesService.findAll(query);
    return {
      success: true,
      ...result,
    };
  }

  @Public()
  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un véhicule par son ID' })
  @ApiResponse({ status: 200, description: 'Véhicule trouvé' })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé' })
  async findOne(@Param('id') id: string) {
    // Enregistrer la vue
    await this.vehiclesService.recordView(id);
    
    const vehicle = await this.vehiclesService.findOne(id);
    return {
      success: true,
      data: vehicle,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour un véhicule' })
  @ApiResponse({ status: 200, description: 'Véhicule mis à jour' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateVehicleDto,
    @CurrentUser('id') userId: string,
  ) {
    const vehicle = await this.vehiclesService.update(id, dto, userId);
    return {
      success: true,
      message: 'Véhicule mis à jour',
      data: vehicle,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Supprimer un véhicule' })
  @ApiResponse({ status: 200, description: 'Véhicule supprimé' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé' })
  async delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    const result = await this.vehiclesService.delete(id, userId);
    return {
      success: true,
      ...result,
    };
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/status')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mettre à jour le statut d\'un véhicule' })
  @ApiResponse({ status: 200, description: 'Statut mis à jour' })
  @ApiResponse({ status: 403, description: 'Non autorisé' })
  @ApiResponse({ status: 404, description: 'Véhicule non trouvé' })
  async updateStatus(
    @Param('id') id: string,
    @Body('status') status: ListingStatus,
    @CurrentUser('id') userId: string,
  ) {
    const vehicle = await this.vehiclesService.updateStatus(id, status, userId);
    return {
      success: true,
      message: 'Statut mis à jour',
      data: vehicle,
    };
  }
}
