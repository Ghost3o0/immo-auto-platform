import { IsString, IsOptional, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateConversationDto {
  @ApiProperty({ description: 'ID du vendeur' })
  @IsString()
  @IsNotEmpty()
  sellerId: string;

  @ApiPropertyOptional({ description: 'ID de la propriété concernée' })
  @IsOptional()
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({ description: 'ID du véhicule concerné' })
  @IsOptional()
  @IsString()
  vehicleId?: string;

  @ApiProperty({ description: 'Premier message de la conversation' })
  @IsString()
  @IsNotEmpty()
  message: string;
}
