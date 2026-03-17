import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SupplierResponseDto {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiPropertyOptional() phone?: string | null
  @ApiPropertyOptional() email?: string | null
  @ApiPropertyOptional() notes?: string | null
  @ApiProperty() isActive: boolean
  @ApiProperty() createdAt: Date
  @ApiProperty() updatedAt: Date
}

export class PaginatedSuppliersDto {
  @ApiProperty({ type: [SupplierResponseDto] }) data: SupplierResponseDto[]
  @ApiProperty() total: number
  @ApiProperty() page: number
  @ApiProperty() pageSize: number
}