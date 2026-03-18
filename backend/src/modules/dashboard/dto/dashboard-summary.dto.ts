import { ApiProperty } from '@nestjs/swagger'

export class DashboardSummaryDto {
  @ApiProperty() totalProducts: number
  @ApiProperty() activeProducts: number
  @ApiProperty() lowStockCount: number
  @ApiProperty() outOfStockCount: number
  @ApiProperty() expiringCount: number
  @ApiProperty() activeAlertsCount: number
  @ApiProperty() todayEntries: number
  @ApiProperty() todayOutputs: number
  @ApiProperty() weekMovements: number
}