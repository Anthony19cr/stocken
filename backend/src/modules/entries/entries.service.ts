import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateEntryDto } from './dto/create-entry.dto'
import { EntryResponseDto, PaginatedEntriesDto } from './dto/entry-response.dto'
import { StockMovementsService } from '../stock-movements/stock-movements.service'
import { ResourceNotFoundException } from '../../shared/exceptions/app.exception'
import { StockMovementType, MovementDirection } from '@prisma/client'

@Injectable()
export class EntriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stockMovementsService: StockMovementsService,
  ) {}

  async findAll(page = 1, pageSize = 20, productId?: string): Promise<PaginatedEntriesDto> {
    const where = {
      ...(productId && { productId }),
    }

    const [entries, total] = await Promise.all([
      this.prisma.inventoryEntry.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { entryDate: 'desc' },
        include: {
          product: { select: { name: true } },
          supplier: { select: { name: true } },
        },
      }),
      this.prisma.inventoryEntry.count({ where }),
    ])

    return {
      data: entries.map((e) => this.mapToDto(e)),
      total,
      page,
      pageSize,
    }
  }

  async findOne(id: string): Promise<EntryResponseDto> {
    const entry = await this.prisma.inventoryEntry.findUnique({
      where: { id },
      include: {
        product: { select: { name: true } },
        supplier: { select: { name: true } },
      },
    })
    if (!entry) throw new ResourceNotFoundException('Entrada', id)
    return this.mapToDto(entry)
  }

  async create(dto: CreateEntryDto, userId: string): Promise<EntryResponseDto> {
    // Verificar que el producto existe
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId, deletedAt: null },
    })
    if (!product) throw new ResourceNotFoundException('Producto', dto.productId)

    return this.prisma.$transaction(async (tx) => {
      // 1. Crear el movimiento de stock
      const movement = await this.stockMovementsService.createMovement(tx, {
        productId: dto.productId,
        type: StockMovementType.PURCHASE,
        direction: MovementDirection.IN,
        quantity: dto.quantity,
        unitCost: dto.unitCost,
        reason: 'Entrada de inventario',
        notes: dto.notes,
        userId,
      })

      // 2. Crear el registro de entrada
      const entry = await tx.inventoryEntry.create({
        data: {
          productId: dto.productId,
          supplierId: dto.supplierId,
          quantity: dto.quantity,
          unitCost: dto.unitCost,
          expirationDate: dto.expirationDate ? new Date(dto.expirationDate) : null,
          notes: dto.notes,
          performedById: userId,
          movementId: movement.id,
        },
        include: {
          product: { select: { name: true } },
          supplier: { select: { name: true } },
        },
      })

      return this.mapToDto(entry)
    })
  }

  private mapToDto(entry: any): EntryResponseDto {
    return {
      id: entry.id,
      productId: entry.productId,
      productName: entry.product?.name,
      supplierId: entry.supplierId,
      supplierName: entry.supplier?.name,
      quantity: Number(entry.quantity),
      unitCost: entry.unitCost ? Number(entry.unitCost) : null,
      expirationDate: entry.expirationDate,
      notes: entry.notes,
      performedById: entry.performedById,
      movementId: entry.movementId,
      entryDate: entry.entryDate,
      createdAt: entry.createdAt,
    }
  }
}