import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { AlertType, AlertStatus } from '@prisma/client'

export class AlertResponseDto {
  @ApiProperty() id: string
  @ApiProperty() productId: string
  @ApiPropertyOptional() productName?: string
  @ApiPropertyOptional() productSku?: string | null
  @ApiProperty({ enum: AlertType }) alertType: AlertType
  @ApiProperty({ enum: AlertStatus }) status: AlertStatus
  @ApiProperty() detectedAt: Date
  @ApiPropertyOptional() resolvedAt?: Date | null
}

export class PaginatedAlertsDto {
  @ApiProperty({ type: [AlertResponseDto] }) data: AlertResponseDto[]
  @ApiProperty() total: number
  @ApiProperty() page: number
  @ApiProperty() pageSize: number
}