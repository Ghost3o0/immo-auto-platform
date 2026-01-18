import { IsString, IsOptional, IsArray, ArrayMaxSize } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class UploadImageDto {
  @ApiProperty({ description: 'Image en base64' })
  @IsString()
  data: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  filename?: string;
}

export class UploadImagesDto {
  @ApiProperty({ description: 'Liste d\'images en base64', type: [String] })
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  images: string[];
}
