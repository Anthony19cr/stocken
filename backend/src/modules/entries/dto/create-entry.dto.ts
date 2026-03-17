import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsNumber, IsOptional, IsPositive, IsUUID, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class CreateEntryDto {
  @ApiProperty()
  @IsUUID()
  productId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  supplierId?: string

  @ApiProperty({ example: 10 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number

  @ApiPropertyOptional({ example: 1500 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitCost?: number

  @ApiPropertyOptional({ example: '2026-06-01' })
  @IsOptional()
  @IsDateString()
  expirationDate?: string

  @ApiPropertyOptional()
  @IsOptional()
  notes?: string
}