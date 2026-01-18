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
import { VehicleType, ListingType, FuelType, Transmission } from '@prisma/client';

export class CreateVehicleDto {
  @ApiProperty({ example: 'Renault Clio 4 essence' })
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string;

  @ApiProperty({ example: 'Voiture en excellent état, révision complète...' })
  @IsString()
  @MinLength(20)
  @MaxLength(5000)
  description: string;

  @ApiProperty({ example: 12500 })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 'Renault' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  brand: string;

  @ApiProperty({ example: 'Clio' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  model: string;

  @ApiProperty({ example: 2020 })
  @IsNumber()
  @Min(1900)
  @Max(new Date().getFullYear() + 1)
  year: number;

  @ApiProperty({ example: 45000 })
  @IsNumber()
  @Min(0)
  mileage: number;

  @ApiProperty({ enum: FuelType, example: FuelType.PETROL })
  @IsEnum(FuelType)
  fuelType: FuelType;

  @ApiProperty({ enum: Transmission, example: Transmission.MANUAL })
  @IsEnum(Transmission)
  transmission: Transmission;

  @ApiProperty({ example: 'Blanc' })
  @IsString()
  @MinLength(1)
  @MaxLength(50)
  color: string;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(2)
  @Max(10)
  doors: number;

  @ApiProperty({ example: 5 })
  @IsNumber()
  @Min(1)
  @Max(12)
  seats: number;

  @ApiPropertyOptional({ example: 90 })
  @IsOptional()
  @IsNumber()
  @Min(1)
  power?: number;

  @ApiProperty({ enum: VehicleType, example: VehicleType.CAR })
  @IsEnum(VehicleType)
  type: VehicleType;

  @ApiProperty({ enum: ListingType, example: ListingType.SALE })
  @IsEnum(ListingType)
  listingType: ListingType;

  @ApiProperty({ example: 'Paris' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiPropertyOptional({ example: ['GPS', 'Climatisation', 'Bluetooth'] })
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
