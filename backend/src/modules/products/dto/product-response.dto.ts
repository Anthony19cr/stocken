import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class ProductResponseDto {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiPropertyOptional() sku?: string | null
  @ApiProperty() categoryId: string
  @ApiPropertyOptional() categoryName?: string
  @ApiProperty() unitId: string
  @ApiPropertyOptional() unitSymbol?: string
  @ApiPropertyOptional() supplierId?: string | null
  @ApiPropertyOptional() supplierName?: string | null
  @ApiProperty() minimumStock: number
  @ApiPropertyOptional() maximumStock?: number | null
  @ApiProperty() tracksExpiration: boolean
  @ApiProperty() isActive: boolean
  @ApiPropertyOptional() notes?: string | null
  @ApiProperty() createdAt: Date
  @ApiProperty() updatedAt: Date
}

export class ProductWithStockDto extends ProductResponseDto {
  @ApiProperty() currentStock: number
  @ApiProperty() stockStatus: 'OK' | 'LOW' | 'OUT' | 'OVERFLOW'
}

export class PaginatedProductsDto {
  @ApiProperty({ type: [ProductWithStockDto] }) data: ProductWithStockDto[]
  @ApiProperty() total: number
  @ApiProperty() page: number
  @ApiProperty() pageSize: number
}