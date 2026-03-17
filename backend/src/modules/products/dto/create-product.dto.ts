import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator'
import { Type } from 'class-transformer'

export class CreateProductDto {
  @ApiProperty({ example: 'Tomate cherry' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({ example: 'TOM-001' })
  @IsOptional()
  @IsString()
  @Matches(/^[A-Z0-9-]+$/, { message: 'SKU solo puede contener mayúsculas, números y guiones' })
  sku?: string

  @ApiProperty()
  @IsUUID()
  categoryId: string

  @ApiProperty()
  @IsUUID()
  unitId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  supplierId?: string

  @ApiProperty({ example: 5, minimum: 0 })
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minimumStock: number

  @ApiPropertyOptional({ example: 100, minimum: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  maximumStock?: number

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  @IsBoolean()
  tracksExpiration?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string
}