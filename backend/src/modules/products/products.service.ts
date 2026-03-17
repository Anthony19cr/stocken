import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductFiltersDto } from './dto/product-filters.dto'
import {
  ProductWithStockDto,
  PaginatedProductsDto,
  ProductResponseDto,
} from './dto/product-response.dto'
import {
  AppException,
  ResourceNotFoundException,
} from '../../shared/exceptions/app.exception'
import { Decimal } from '@prisma/client/runtime/library'

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(filters: ProductFiltersDto): Promise<PaginatedProductsDto> {
    const { page = 1, pageSize = 20, search, categoryId, supplierId, isActive, lowStock } = filters

    const where: Record<string, unknown> = {
      isActive: isActive !== undefined ? isActive : true,
      deletedAt: null,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categoryId && { categoryId }),
      ...(supplierId && { supplierId }),
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
        include: {
          category: { select: { name: true } },
          unit: { select: { symbol: true } },
          supplier: { select: { name: true } },
          stockLevel: { select: { currentStock: true } },
        },
      }),
      this.prisma.product.count({ where }),
    ])

    let data = products.map((p) => this.mapToDto(p))

    if (lowStock) {
      data = data.filter((p) => p.stockStatus === 'LOW' || p.stockStatus === 'OUT')
    }

    return { data, total, page, pageSize }
  }

  async findOne(id: string): Promise<ProductWithStockDto> {
    const product = await this.prisma.product.findUnique({
      where: { id, deletedAt: null },
      include: {
        category: { select: { name: true } },
        unit: { select: { symbol: true } },
        supplier: { select: { name: true } },
        stockLevel: { select: { currentStock: true } },
      },
    })

    if (!product) throw new ResourceNotFoundException('Producto', id)
    return this.mapToDto(product)
  }

  async create(dto: CreateProductDto): Promise<ProductResponseDto> {
        if (dto.sku) {
            const existing = await this.prisma.product.findUnique({
            where: { sku: dto.sku },
            })
            if (existing) {
            throw new AppException(
                'SKU_ALREADY_EXISTS',
                `Ya existe un producto con el SKU "${dto.sku}"`,
                undefined,
                409,
            )
            }
        }

        return this.prisma.$transaction(async (tx) => {
            const product = await tx.product.create({
            data: {
                name: dto.name,
                sku: dto.sku,
                categoryId: dto.categoryId,
                unitId: dto.unitId,
                supplierId: dto.supplierId,
                minimumStock: dto.minimumStock,
                maximumStock: dto.maximumStock,
                tracksExpiration: dto.tracksExpiration ?? false,
                notes: dto.notes,
            },
            })

            await tx.stockLevel.create({
            data: {
                productId: product.id,
                currentStock: new Decimal(0),
            },
            })

            return this.mapProductToResponse(product)
        })
    }

    async update(id: string, dto: UpdateProductDto): Promise<ProductResponseDto> {
        await this.findOne(id)
        const product = await this.prisma.product.update({
            where: { id },
            data: dto,
        })
        return this.mapProductToResponse(product)
    }

    async deactivate(id: string): Promise<ProductResponseDto> {
        await this.findOne(id)
        const product = await this.prisma.product.update({
            where: { id },
            data: { isActive: false, deletedAt: new Date() },
        })
        return this.mapProductToResponse(product)
    }

    private mapProductToResponse(product: any): ProductResponseDto {
        return {
            ...product,
            minimumStock: Number(product.minimumStock),
            maximumStock: product.maximumStock ? Number(product.maximumStock) : null,
        }
    }

  private mapToDto(product: any): ProductWithStockDto {
    const currentStock = Number(product.stockLevel?.currentStock ?? 0)
    const minimumStock = Number(product.minimumStock)
    const maximumStock = product.maximumStock ? Number(product.maximumStock) : null

    let stockStatus: 'OK' | 'LOW' | 'OUT' | 'OVERFLOW' = 'OK'
    if (currentStock <= 0) stockStatus = 'OUT'
    else if (currentStock <= minimumStock) stockStatus = 'LOW'
    else if (maximumStock && currentStock >= maximumStock) stockStatus = 'OVERFLOW'

    return {
      id: product.id,
      name: product.name,
      sku: product.sku,
      categoryId: product.categoryId,
      categoryName: product.category?.name,
      unitId: product.unitId,
      unitSymbol: product.unit?.symbol,
      supplierId: product.supplierId,
      supplierName: product.supplier?.name,
      minimumStock,
      maximumStock,
      tracksExpiration: product.tracksExpiration,
      isActive: product.isActive,
      notes: product.notes,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      currentStock,
      stockStatus,
    }
  }
}