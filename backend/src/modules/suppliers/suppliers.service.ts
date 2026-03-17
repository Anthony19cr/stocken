import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateSupplierDto } from './dto/create-supplier.dto'
import { UpdateSupplierDto } from './dto/update-supplier.dto'
import { SupplierResponseDto, PaginatedSuppliersDto } from './dto/supplier-response.dto'
import { ResourceNotFoundException } from '../../shared/exceptions/app.exception'

@Injectable()
export class SuppliersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page = 1, pageSize = 20, search?: string): Promise<PaginatedSuppliersDto> {
    const where = {
      isActive: true,
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    }

    const [data, total] = await Promise.all([
      this.prisma.supplier.findMany({
        where,
        skip: (page - 1) * pageSize,
        take: pageSize,
        orderBy: { name: 'asc' },
      }),
      this.prisma.supplier.count({ where }),
    ])

    return { data, total, page, pageSize }
  }

  async findOne(id: string): Promise<SupplierResponseDto> {
    const supplier = await this.prisma.supplier.findUnique({ where: { id } })
    if (!supplier) throw new ResourceNotFoundException('Proveedor', id)
    return supplier
  }

  async create(dto: CreateSupplierDto): Promise<SupplierResponseDto> {
    return this.prisma.supplier.create({ data: dto })
  }

  async update(id: string, dto: UpdateSupplierDto): Promise<SupplierResponseDto> {
    await this.findOne(id)
    return this.prisma.supplier.update({ where: { id }, data: dto })
  }

  async deactivate(id: string): Promise<SupplierResponseDto> {
    await this.findOne(id)
    return this.prisma.supplier.update({
      where: { id },
      data: { isActive: false },
    })
  }
}