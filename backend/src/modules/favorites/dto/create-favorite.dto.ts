import { IsString, IsOptional, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFavoriteDto {
  @ApiPropertyOptional({ example: 'uuid-property-id' })
  @ValidateIf((o) => !o.vehicleId)
  @IsString()
  propertyId?: string;

  @ApiPropertyOptional({ example: 'uuid-vehicle-id' })
  @ValidateIf((o) => !o.propertyId)
  @IsString()
  vehicleId?: string;
}
