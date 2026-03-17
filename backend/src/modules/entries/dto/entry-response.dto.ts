import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class EntryResponseDto {
  @ApiProperty() id: string
  @ApiProperty() productId: string
  @ApiPropertyOptional() productName?: string
  @ApiPropertyOptional() supplierId?: string | null
  @ApiPropertyOptional() supplierName?: string | null
  @ApiProperty() quantity: number
  @ApiPropertyOptional() unitCost?: number | null
  @ApiPropertyOptional() expirationDate?: Date | null
  @ApiPropertyOptional() notes?: string | null
  @ApiProperty() performedById: string
  @ApiProperty() movementId: string | null
  @ApiProperty() entryDate: Date
  @ApiProperty() createdAt: Date
}

export class PaginatedEntriesDto {
  @ApiProperty({ type: [EntryResponseDto] }) data: EntryResponseDto[]
  @ApiProperty() total: number
  @ApiProperty() page: number
  @ApiProperty() pageSize: number
}