import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsInt, IsOptional, IsUUID, Min } from 'class-validator'
import { Type } from 'class-transformer'
import { StockMovementType } from '@prisma/client'

export class MovementFiltersDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize?: number = 20

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  productId?: string

  @ApiPropertyOptional({ enum: StockMovementType })
  @IsOptional()
  @IsEnum(StockMovementType)
  type?: StockMovementType

  @ApiPropertyOptional()
  @IsOptional()
  dateFrom?: string

  @ApiPropertyOptional()
  @IsOptional()
  dateTo?: string
}