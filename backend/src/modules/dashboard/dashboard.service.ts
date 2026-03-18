import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { DashboardSummaryDto } from './dto/dashboard-summary.dto'
import { AlertStatus, AlertType } from '@prisma/client'

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getSummary(): Promise<DashboardSummaryDto> {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)

    const [
      totalProducts,
      activeProducts,
      lowStockCount,
      outOfStockCount,
      activeAlertsCount,
      expiringCount,
      todayEntries,
      todayOutputs,
      weekMovements,
    ] = await Promise.all([
      this.prisma.product.count({ where: { deletedAt: null } }),
      this.prisma.product.count({ where: { isActive: true, deletedAt: null } }),
      this.prisma.alert.count({
        where: { alertType: AlertType.STOCK_LOW, status: AlertStatus.ACTIVE },
      }),
      this.prisma.alert.count({
        where: { alertType: AlertType.STOCK_OUT, status: AlertStatus.ACTIVE },
      }),
      this.prisma.alert.count({ where: { status: AlertStatus.ACTIVE } }),
      this.prisma.alert.count({
        where: {
          alertType: AlertType.EXPIRATION_SOON,
          status: AlertStatus.ACTIVE,
        },
      }),
      this.prisma.inventoryEntry.count({
        where: { entryDate: { gte: today } },
      }),
      this.prisma.inventoryOutput.count({
        where: { outputDate: { gte: today } },
      }),
      this.prisma.stockMovement.count({
        where: { occurredAt: { gte: weekAgo } },
      }),
    ])

    return {
      totalProducts,
      activeProducts,
      lowStockCount,
      outOfStockCount,
      expiringCount,
      activeAlertsCount,
      todayEntries,
      todayOutputs,
      weekMovements,
    }
  }
}