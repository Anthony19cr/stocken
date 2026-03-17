import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { MovementFiltersDto } from './dto/movement-filters.dto'
import { StockMovementResponseDto, PaginatedMovementsDto } from './dto/stock-movement-response.dto'
import { ResourceNotFoundException, BusinessRuleException } from '../../shared/exceptions/app.exception'
import { StockMovementType, MovementDirection, Prisma } from '@prisma/client'
import { Decimal } from '@prisma/client/runtime/library'

export interface CreateMovementInput {
  productId: string
  type: StockMovementType
  direction: MovementDirection
  quantity: number
  unitCost?: number
  referenceId?: string
  reason?: string
  notes?: string
  userId: string
}

@Injectable()
export class StockMovementsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: MovementFiltersDto): Promise<PaginatedMovementsDto> {
    const { page = 1, pageSize = 20, productId, type, dateFrom, dateTo } = filters

    const where: Prisma.StockMovementWhereInput = {
      ...(productId && { productId }),
      ...(type && { type }),
      ...(dateFrom || dateTo
        ? {
            occurredAt: {
              ...(dateFrom && { gte: new Date(dateFrom) }),
              ...(dateTo && { lte: new Date(dateTo) }),
            },
          }
        : {}),
    }

    const [movements, total] = await Promise.all([
      this.prisma.stockMovement.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { occurredAt: 'desc' },
        include: {
          product: { select: { name: true } },
          performedBy: { select: { fullName: true } },
        },
      }),
      this.prisma.stockMovement.count({ where }),
    ])

    const data = movements.map((m) => this.mapToDto(m))
    return { data, total, page, pageSize }
  }

  async findByProduct(productId: string): Promise<StockMovementResponseDto[]> {
    const product = await this.prisma.product.findUnique({ where: { id: productId } })
    if (!product) throw new ResourceNotFoundException('Producto', productId)

    const movements = await this.prisma.stockMovement.findMany({
      where: { productId },
      orderBy: { occurredAt: 'desc' },
      include: {
        product: { select: { name: true } },
        performedBy: { select: { fullName: true } },
      },
    })

    return movements.map((m) => this.mapToDto(m))
  }

  // Método central — llamado por Entries y Outputs
  async createMovement(
    tx: Prisma.TransactionClient,
    input: CreateMovementInput,
  ): Promise<StockMovementResponseDto> {
    // 1. Leer stock actual con lock
    const stockLevel = await tx.stockLevel.findUnique({
      where: { productId: input.productId },
    })

    if (!stockLevel) {
      throw new BusinessRuleException(
        'STOCK_LEVEL_NOT_FOUND',
        'No se encontró el nivel de stock para este producto',
      )
    }

    // 2. Calcular nuevo stock
    const quantity = new Decimal(input.quantity)
    const newStock =
      input.direction === MovementDirection.IN
        ? stockLevel.currentStock.add(quantity)
        : stockLevel.currentStock.sub(quantity)

    // 3. Validar stock negativo
    if (newStock.lessThan(0)) {
      const settings = await tx.tenantSettings.findFirst()
      if (!settings?.allowNegativeStock) {
        throw new BusinessRuleException('INSUFFICIENT_STOCK', 'Stock insuficiente', {
          available: stockLevel.currentStock.toNumber(),
          requested: input.quantity,
        })
      }
    }

    // 4. Crear movimiento inmutable
    const movement = await tx.stockMovement.create({
      data: {
        productId: input.productId,
        type: input.type,
        direction: input.direction,
        quantity,
        stockBefore: stockLevel.currentStock,
        stockAfter: newStock,
        unitCost: input.unitCost ? new Decimal(input.unitCost) : null,
        referenceId: input.referenceId,
        reason: input.reason,
        notes: input.notes,
        performedById: input.userId,
      },
      include: {
        product: { select: { name: true } },
        performedBy: { select: { fullName: true } },
      },
    })

    // 5. Actualizar snapshot de stock
    await tx.stockLevel.update({
      where: { productId: input.productId },
      data: {
        currentStock: newStock,
        lastMovementId: movement.id,
      },
    })

    return this.mapToDto(movement)
  }

  private mapToDto(movement: any): StockMovementResponseDto {
    return {
      id: movement.id,
      productId: movement.productId,
      productName: movement.product?.name,
      type: movement.type,
      direction: movement.direction,
      quantity: Number(movement.quantity),
      stockBefore: Number(movement.stockBefore),
      stockAfter: Number(movement.stockAfter),
      unitCost: movement.unitCost ? Number(movement.unitCost) : null,
      referenceId: movement.referenceId,
      reason: movement.reason,
      notes: movement.notes,
      performedById: movement.performedById,
      performedByName: movement.performedBy?.fullName,
      occurredAt: movement.occurredAt,
      createdAt: movement.createdAt,
    }
  }
}