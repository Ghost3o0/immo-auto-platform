import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { SearchDto } from './dto';
import { ListingStatus } from '@prisma/client';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  /**
   * Recherche globale dans les propriétés et véhicules
   */
  async search(dto: SearchDto) {
    const { query, page = 1, limit = 10 } = dto;

    if (!query || query.length < 2) {
      return {
        properties: [],
        vehicles: [],
      };
    }

    const skip = (page - 1) * limit;

    const [properties, vehicles] = await Promise.all([
      this.prisma.property.findMany({
        where: {
          status: ListingStatus.ACTIVE,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { city: { contains: query, mode: 'insensitive' } },
            { address: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          price: true,
          city: true,
          type: true,
          listingType: true,
          images: {
            take: 1,
          },
        },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.vehicle.findMany({
        where: {
          status: ListingStatus.ACTIVE,
          OR: [
            { title: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { brand: { contains: query, mode: 'insensitive' } },
            { model: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          title: true,
          price: true,
          brand: true,
          model: true,
          year: true,
          listingType: true,
          images: {
            take: 1,
          },
        },
        take: limit,
        skip,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      properties,
      vehicles,
    };
  }

  /**
   * Suggestions pour l'autocomplete
   */
  async getSuggestions(query: string) {
    if (!query || query.length < 2) {
      return [];
    }

    const [properties, vehicles, cities] = await Promise.all([
      this.prisma.property.findMany({
        where: {
          status: ListingStatus.ACTIVE,
          title: { contains: query, mode: 'insensitive' },
        },
        select: {
          id: true,
          title: true,
        },
        take: 3,
      }),
      this.prisma.vehicle.findMany({
        where: {
          status: ListingStatus.ACTIVE,
          OR: [
            { brand: { contains: query, mode: 'insensitive' } },
            { model: { contains: query, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          brand: true,
          model: true,
        },
        take: 3,
      }),
      this.prisma.property.findMany({
        where: {
          status: ListingStatus.ACTIVE,
          city: { contains: query, mode: 'insensitive' },
        },
        select: {
          city: true,
        },
        distinct: ['city'],
        take: 3,
      }),
    ]);

    const suggestions = [
      ...properties.map((p) => ({
        type: 'property' as const,
        id: p.id,
        label: p.title,
      })),
      ...vehicles.map((v) => ({
        type: 'vehicle' as const,
        id: v.id,
        label: `${v.brand} ${v.model}`,
      })),
      ...cities.map((c) => ({
        type: 'city' as const,
        id: null,
        label: c.city,
      })),
    ];

    return suggestions.slice(0, 10);
  }
}
