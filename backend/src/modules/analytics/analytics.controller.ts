import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../../common/guards';
import { CurrentUser } from '../../common/decorators';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('views')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer les statistiques des vues' })
  async getViewsStats(@CurrentUser('id') userId: string) {
    const stats = await this.analyticsService.getUserListingsStats(userId);
    return {
      success: true,
      data: stats,
    };
  }

  @Get('activity')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer les statistiques d\'activité' })
  async getActivityStats(@CurrentUser('id') userId: string) {
    const stats = await this.analyticsService.getUserActivityStats(userId);
    return {
      success: true,
      data: stats,
    };
  }
}
