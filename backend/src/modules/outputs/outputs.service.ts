import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateOutputDto } from './dto/create-output.dto'
import { OutputResponseDto, PaginatedOutputsDto } from './dto/output-response.dto'
import { StockMovementsService } from '../stock-movements/stock-movements.service'
import { AlertsService } from '../alerts/alerts.service'
import { ResourceNotFoundException } from '../../shared/exceptions/app.exception'
import { StockMovementType, MovementDirection, OutputReason } from '@prisma/client'

@Injectable()
export class OutputsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockMovementsService: StockMovementsService,
    private readonly alertsService: AlertsService,
  ) {}

  async findAll(page = 1, pageSize = 20, productId?: string): Promise<PaginatedOutputsDto> {
    const where = { ...(productId && { productId }) }

    const [outputs, total] = await Promise.all([
      this.prisma.inventoryOutput.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { outputDate: 'desc' },
        include: { product: { select: { name: true } } },
      }),
      this.prisma.inventoryOutput.count({ where }),
    ])

    return {
      data: outputs.map((o) => this.mapToDto(o)),
      total,
      page,
      pageSize,
    }
  }

  async findOne(id: string): Promise<OutputResponseDto> {
    const output = await this.prisma.inventoryOutput.findUnique({
      where: { id },
      include: { product: { select: { name: true } } },
    })
    if (!output) throw new ResourceNotFoundException('Salida', id)
    return this.mapToDto(output)
  }

  async create(dto: CreateOutputDto, userId: string): Promise<OutputResponseDto> {
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId, deletedAt: null },
    })
    if (!product) throw new ResourceNotFoundException('Producto', dto.productId)

    const movementType =
      dto.outputReason === OutputReason.WASTE || dto.outputReason === OutputReason.EXPIRED
        ? StockMovementType.WASTE
        : StockMovementType.SALE

    const output = await this.prisma.$transaction(async (tx) => {
      const movement = await this.stockMovementsService.createMovement(tx, {
        productId: dto.productId,
        type: movementType,
        direction: MovementDirection.OUT,
        quantity: dto.quantity,
        reason: dto.outputReason,
        notes: dto.notes,
        userId,
      })

      return tx.inventoryOutput.create({
        data: {
          productId: dto.productId,
          quantity: dto.quantity,
          outputReason: dto.outputReason,
          notes: dto.notes,
          performedById: userId,
          movementId: movement.id,
        },
        include: { product: { select: { name: true } } },
      })
    })

    // Evaluar alertas fuera de la transacción
    await this.alertsService.evaluateProductAlerts(dto.productId)

    return this.mapToDto(output)
  }

  private mapToDto(output: any): OutputResponseDto {
    return {
      id: output.id,
      productId: output.productId,
      productName: output.product?.name,
      quantity: Number(output.quantity),
      outputReason: output.outputReason,
      notes: output.notes,
      performedById: output.performedById,
      movementId: output.movementId,
      outputDate: output.outputDate,
      createdAt: output.createdAt,
    }
  }
}