import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { ReportFiltersDto } from './dto/report-filters.dto'

@Injectable()
export class ReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async getMovements(filters: ReportFiltersDto) {
    const where = {
      ...(filters.productId && { productId: filters.productId }),
      ...(filters.dateFrom || filters.dateTo
        ? {
            occurredAt: {
              ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
              ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
            },
          }
        : {}),
    }

    return this.prisma.stockMovement.findMany({
      where,
      orderBy: { occurredAt: 'desc' },
      take: 500,
      include: {
        product: { select: { name: true, sku: true } },
        performedBy: { select: { fullName: true } },
      },
    })
  }

  async getConsumption(filters: ReportFiltersDto) {
    const where = {
      ...(filters.productId && { productId: filters.productId }),
      ...(filters.dateFrom || filters.dateTo
        ? {
            outputDate: {
              ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
              ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
            },
          }
        : {}),
    }

    const outputs = await this.prisma.inventoryOutput.findMany({
      where,
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            category: { select: { name: true } },
            unit: { select: { symbol: true } },
          },
        },
      },
    })

    // Agrupar por producto
    const grouped = outputs.reduce(
      (acc, o) => {
        const key = o.productId
        if (!acc[key]) {
          acc[key] = {
            productId: o.productId,
            productName: o.product.name,
            productSku: o.product.sku,
            categoryName: o.product.category?.name,
            unitSymbol: o.product.unit?.symbol,
            totalQuantity: 0,
            outputCount: 0,
          }
        }
        acc[key].totalQuantity += Number(o.quantity)
        acc[key].outputCount += 1
        return acc
      },
      {} as Record<string, any>,
    )

    return Object.values(grouped).sort((a: any, b: any) => b.totalQuantity - a.totalQuantity)
  }

  async getLowStock() {
    return this.prisma.product.findMany({
      where: { isActive: true, deletedAt: null },
      include: {
        stockLevel: true,
        category: { select: { name: true } },
        unit: { select: { symbol: true } },
      },
    }).then((products) =>
      products
        .filter((p) => Number(p.stockLevel?.currentStock ?? 0) <= Number(p.minimumStock))
        .map((p) => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          categoryName: p.category?.name,
          unitSymbol: p.unit?.symbol,
          currentStock: Number(p.stockLevel?.currentStock ?? 0),
          minimumStock: Number(p.minimumStock),
          deficit: Number(p.minimumStock) - Number(p.stockLevel?.currentStock ?? 0),
        }))
        .sort((a, b) => b.deficit - a.deficit),
    )
  }

  async getExpiring(filters: ReportFiltersDto) {
    const settings = await this.prisma.tenantSettings.findFirst()
    const alertDays = settings?.expirationAlertDays ?? 7

    const alertDate = new Date()
    alertDate.setDate(alertDate.getDate() + alertDays)

    return this.prisma.inventoryEntry.findMany({
      where: {
        expirationDate: {
          lte: alertDate,
          gte: new Date(),
        },
        ...(filters.productId && { productId: filters.productId }),
      },
      orderBy: { expirationDate: 'asc' },
      include: {
        product: {
          select: {
            name: true,
            sku: true,
            unit: { select: { symbol: true } },
          },
        },
      },
    })
  }

  async getEntriesBySupplier(filters: ReportFiltersDto) {
    const where = {
      supplierId: { not: null },
      ...(filters.supplierId && { supplierId: filters.supplierId }),
      ...(filters.dateFrom || filters.dateTo
        ? {
            entryDate: {
              ...(filters.dateFrom && { gte: new Date(filters.dateFrom) }),
              ...(filters.dateTo && { lte: new Date(filters.dateTo) }),
            },
          }
        : {}),
    }

    const entries = await this.prisma.inventoryEntry.findMany({
      where,
      include: {
        supplier: { select: { name: true } },
        product: { select: { name: true } },
      },
    })

    const grouped = entries.reduce(
      (acc, e) => {
        const key = e.supplierId!
        if (!acc[key]) {
          acc[key] = {
            supplierId: key,
            supplierName: e.supplier?.name,
            totalEntries: 0,
            totalValue: 0,
          }
        }
        acc[key].totalEntries += 1
        acc[key].totalValue += Number(e.unitCost ?? 0) * Number(e.quantity)
        return acc
      },
      {} as Record<string, any>,
    )

    return Object.values(grouped).sort((a: any, b: any) => b.totalValue - a.totalValue)
  }
}