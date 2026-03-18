import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsHexColor, IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateBrandingDto {
  @ApiPropertyOptional({ example: 'Mi Restaurante' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  restaurantName?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logoUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  faviconUrl?: string

  @ApiPropertyOptional({ example: '#2563EB' })
  @IsOptional()
  @IsHexColor()
  primaryColor?: string

  @ApiPropertyOptional({ example: '#64748B' })
  @IsOptional()
  @IsHexColor()
  secondaryColor?: string

  @ApiPropertyOptional({ example: '#F59E0B' })
  @IsOptional()
  @IsHexColor()
  accentColor?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fontFamily?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  emailFrom?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  supportEmail?: string

  @ApiPropertyOptional({ example: 'es-CR' })
  @IsOptional()
  @IsString()
  locale?: string
}

export class BrandingResponseDto {
  @ApiProperty() id: string
  @ApiProperty() restaurantName: string
  @ApiPropertyOptional() logoUrl?: string | null
  @ApiPropertyOptional() faviconUrl?: string | null
  @ApiProperty() primaryColor: string
  @ApiProperty() secondaryColor: string
  @ApiProperty() accentColor: string
  @ApiProperty() fontFamily: string
  @ApiPropertyOptional() emailFrom?: string | null
  @ApiPropertyOptional() supportEmail?: string | null
  @ApiProperty() locale: string
  @ApiProperty() updatedAt: Date
}