import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsInt, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  restaurantName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  systemName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dateFormat?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  expirationAlertDays?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowNegativeStock?: boolean
}

export class SettingsResponseDto {
  @ApiProperty() id: string
  @ApiProperty() restaurantName: string
  @ApiProperty() systemName: string
  @ApiProperty() timezone: string
  @ApiProperty() currency: string
  @ApiProperty() dateFormat: string
  @ApiProperty() expirationAlertDays: number
  @ApiProperty() allowNegativeStock: boolean
  @ApiProperty() updatedAt: Date
}