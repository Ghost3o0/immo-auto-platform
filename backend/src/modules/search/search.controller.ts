import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SearchService } from './search.service';
import { SearchDto } from './dto';
import { Public } from '../../common/decorators';

@ApiTags('Search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Recherche globale' })
  @ApiResponse({ status: 200, description: 'Résultats de recherche' })
  async search(@Query() dto: SearchDto) {
    const results = await this.searchService.search(dto);
    return {
      success: true,
      data: results,
    };
  }

  @Public()
  @Get('suggestions')
  @ApiOperation({ summary: 'Suggestions pour l\'autocomplete' })
  @ApiResponse({ status: 200, description: 'Suggestions' })
  async getSuggestions(@Query('query') query: string) {
    const suggestions = await this.searchService.getSuggestions(query);
    return {
      success: true,
      data: suggestions,
    };
  }
}
