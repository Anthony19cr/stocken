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

  @ApiPropertyOptional({ example: '#1b8348' })
  @IsOptional()
  @IsHexColor()
  primaryColor?: string

  @ApiPropertyOptional({ example: '#4cc17f' })
  @IsOptional()
  @IsHexColor()
  secondaryColor?: string

  @ApiPropertyOptional({ example: '#caf6dd' })
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

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  backgroundImageUrl?: string
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
  @ApiPropertyOptional() backgroundImageUrl?: string | null
}