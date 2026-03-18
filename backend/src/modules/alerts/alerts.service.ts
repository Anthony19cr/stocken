import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AlertResponseDto, PaginatedAlertsDto } from './dto/alert-response.dto'
import { ResourceNotFoundException } from '../../shared/exceptions/app.exception'
import { AlertType, AlertStatus } from '@prisma/client'

@Injectable()
export class AlertsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    page = 1,
    pageSize = 20,
    status?: AlertStatus,
  ): Promise<PaginatedAlertsDto> {
    const where = {
      ...(status ? { status } : { status: AlertStatus.ACTIVE }),
    }

    const [alerts, total] = await Promise.all([
      this.prisma.alert.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { detectedAt: 'desc' },
        include: {
          product: { select: { name: true, sku: true } },
        },
      }),
      this.prisma.alert.count({ where }),
    ])

    return {
      data: alerts.map((a) => this.mapToDto(a)),
      total,
      page,
      pageSize,
    }
  }

  async resolve(id: string): Promise<AlertResponseDto> {
    const alert = await this.prisma.alert.findUnique({ where: { id } })
    if (!alert) throw new ResourceNotFoundException('Alerta', id)

    const updated = await this.prisma.alert.update({
      where: { id },
      data: { status: AlertStatus.RESOLVED, resolvedAt: new Date() },
      include: { product: { select: { name: true, sku: true } } },
    })

    return this.mapToDto(updated)
  }

  async dismiss(id: string): Promise<AlertResponseDto> {
    const alert = await this.prisma.alert.findUnique({ where: { id } })
    if (!alert) throw new ResourceNotFoundException('Alerta', id)

    const updated = await this.prisma.alert.update({
      where: { id },
      data: { status: AlertStatus.DISMISSED, resolvedAt: new Date() },
      include: { product: { select: { name: true, sku: true } } },
    })

    return this.mapToDto(updated)
  }

  // Evaluar alertas para un producto — llamado después de cada movimiento
  async evaluateProductAlerts(productId: string): Promise<void> {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      include: { stockLevel: true },
    })

    if (!product || !product.isActive) return

    const settings = await this.prisma.tenantSettings.findFirst()
    const currentStock = Number(product.stockLevel?.currentStock ?? 0)
    const minimumStock = Number(product.minimumStock)
    const maximumStock = product.maximumStock ? Number(product.maximumStock) : null

    // Cerrar alertas activas anteriores del mismo producto
    await this.prisma.alert.updateMany({
      where: {
        productId,
        status: AlertStatus.ACTIVE,
        alertType: {
          in: [AlertType.STOCK_LOW, AlertType.STOCK_OUT, AlertType.STOCK_OVERFLOW],
        },
      },
      data: { status: AlertStatus.RESOLVED, resolvedAt: new Date() },
    })

    // Evaluar nuevo estado
    if (currentStock <= 0) {
      await this.createAlertIfNotExists(productId, AlertType.STOCK_OUT)
    } else if (currentStock <= minimumStock) {
      await this.createAlertIfNotExists(productId, AlertType.STOCK_LOW)
    } else if (maximumStock && currentStock >= maximumStock) {
      await this.createAlertIfNotExists(productId, AlertType.STOCK_OVERFLOW)
    }

    // Evaluar vencimiento
    if (product.tracksExpiration && settings?.expirationAlertDays) {
      const alertDate = new Date()
      alertDate.setDate(alertDate.getDate() + settings.expirationAlertDays)

      const expiringEntry = await this.prisma.inventoryEntry.findFirst({
        where: {
          productId,
          expirationDate: { lte: alertDate, gte: new Date() },
        },
      })

      if (expiringEntry) {
        await this.createAlertIfNotExists(productId, AlertType.EXPIRATION_SOON)
      }
    }
  }

  private async createAlertIfNotExists(
    productId: string,
    alertType: AlertType,
  ): Promise<void> {
    const existing = await this.prisma.alert.findFirst({
      where: { productId, alertType, status: AlertStatus.ACTIVE },
    })

    if (!existing) {
      await this.prisma.alert.create({
        data: { productId, alertType, status: AlertStatus.ACTIVE },
      })
    }
  }

  private mapToDto(alert: any): AlertResponseDto {
    return {
      id: alert.id,
      productId: alert.productId,
      productName: alert.product?.name,
      productSku: alert.product?.sku,
      alertType: alert.alertType,
      status: alert.status,
      detectedAt: alert.detectedAt,
      resolvedAt: alert.resolvedAt,
    }
  }
}