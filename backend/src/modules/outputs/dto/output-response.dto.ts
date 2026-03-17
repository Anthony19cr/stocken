import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { OutputReason } from '@prisma/client'

export class OutputResponseDto {
  @ApiProperty() id: string
  @ApiProperty() productId: string
  @ApiPropertyOptional() productName?: string
  @ApiProperty() quantity: number
  @ApiProperty({ enum: OutputReason }) outputReason: OutputReason
  @ApiPropertyOptional() notes?: string | null
  @ApiProperty() performedById: string
  @ApiProperty() movementId: string | null
  @ApiProperty() outputDate: Date
  @ApiProperty() createdAt: Date
}

export class PaginatedOutputsDto {
  @ApiProperty({ type: [OutputResponseDto] }) data: OutputResponseDto[]
  @ApiProperty() total: number
  @ApiProperty() page: number
  @ApiProperty() pageSize: number
}