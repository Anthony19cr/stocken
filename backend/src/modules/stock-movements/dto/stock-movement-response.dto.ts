import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { StockMovementType, MovementDirection } from '@prisma/client'

export class StockMovementResponseDto {
  @ApiProperty() id: string
  @ApiProperty() productId: string
  @ApiPropertyOptional() productName?: string
  @ApiProperty({ enum: StockMovementType }) type: StockMovementType
  @ApiProperty({ enum: MovementDirection }) direction: MovementDirection
  @ApiProperty() quantity: number
  @ApiProperty() stockBefore: number
  @ApiProperty() stockAfter: number
  @ApiPropertyOptional() unitCost?: number | null
  @ApiPropertyOptional() referenceId?: string | null
  @ApiPropertyOptional() reason?: string | null
  @ApiPropertyOptional() notes?: string | null
  @ApiProperty() performedById: string
  @ApiPropertyOptional() performedByName?: string
  @ApiProperty() occurredAt: Date
  @ApiProperty() createdAt: Date
}

export class PaginatedMovementsDto {
  @ApiProperty({ type: [StockMovementResponseDto] }) data: StockMovementResponseDto[]
  @ApiProperty() total: number
  @ApiProperty() page: number
  @ApiProperty() pageSize: number
}