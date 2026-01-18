import {
  IsString,
  IsNumber,
  IsEnum,
  IsOptional,
  IsArray,
  Min,
  Max,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PropertyType, ListingType } from '@prisma/client';

export class CreatePropertyDto {
  @ApiProperty({ example: 'Bel appartement au centre-ville' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Magnifique appartement de 80m² avec vue sur la ville...' })
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description: string;

  @ApiProperty({ example: 250000 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: '123 rue de la Paix' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  address: string;

  @ApiProperty({ example: 'Paris' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiProperty({ example: '75001' })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  zipCode: string;

  @ApiPropertyOptional({ example: 'France' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @ApiPropertyOptional({ example: 48.8566 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ example: 2.3522 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiProperty({ example: 80 })
  @IsNumber()
  @Min(1)
  surface: number;

  @ApiProperty({ example: 4 })
  @IsNumber()
  @Min(1)
  @Max(50)
  rooms: number;

  @ApiProperty({ example: 2 })
  @IsNumber()
  @Min(0)
  @Max(20)
  bedrooms: number;

  @ApiProperty({ example: 1 })
  @IsNumber()
  @Min(0)
  @Max(10)
  bathrooms: number;

  @ApiProperty({ enum: PropertyType, example: PropertyType.APARTMENT })
  @IsEnum(PropertyType)
  type: PropertyType;

  @ApiProperty({ enum: ListingType, example: ListingType.SALE })
  @IsEnum(ListingType)
  listingType: ListingType;

  @ApiPropertyOptional({ example: ['Balcon', 'Parking', 'Cave'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ description: 'Images en base64' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[];
}
