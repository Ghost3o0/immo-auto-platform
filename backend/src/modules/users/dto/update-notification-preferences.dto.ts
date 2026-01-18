import { IsBoolean, IsOptional } from 'class-validator';

export class UpdateNotificationPreferencesDto {
  @IsOptional()
  @IsBoolean()
  emailOnNewMessage?: boolean;

  @IsOptional()
  @IsBoolean()
  emailOnNewFavorite?: boolean;

  @IsOptional()
  @IsBoolean()
  emailOnListingViews?: boolean;

  @IsOptional()
  @IsBoolean()
  emailOnListingExpiry?: boolean;

  @IsOptional()
  @IsBoolean()
  pushNotifications?: boolean;
}
