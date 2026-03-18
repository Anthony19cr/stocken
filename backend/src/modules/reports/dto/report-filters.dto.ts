import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsDateString, IsOptional, IsUUID } from 'class-validator'

export class ReportFiltersDto {
  @ApiPropertyOptional({ example: '2026-01-01' })
  @IsOptional()
  @IsDateString()
  dateFrom?: string

  @ApiPropertyOptional({ example: '2026-03-31' })
  @IsOptional()
  @IsDateString()
  dateTo?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  categoryId?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  supplierId?: string
}