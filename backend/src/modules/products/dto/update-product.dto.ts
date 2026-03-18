import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean, IsNumber, IsOptional, IsString,
  IsUUID, Matches, MaxLength, Min, MinLength,
} from 'class-validator'
import { Type } from 'class-transformer'

export class UpdateProductDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9-]+$/, { message: 'SKU solo puede contener mayúsculas, números y guiones' })
  sku?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  unitId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  supplierId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minimumStock?: number

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maximumStock?: number

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  tracksExpiration?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string
}