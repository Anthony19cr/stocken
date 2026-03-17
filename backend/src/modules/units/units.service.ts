import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateUnitDto } from './dto/create-unit.dto'
import { UnitResponseDto } from './dto/unit-response.dto'
import {
  AppException,
  ResourceNotFoundException,
} from '../../shared/exceptions/app.exception'

@Injectable()
export class UnitsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<UnitResponseDto[]> {
    return this.prisma.unit.findMany({
      where: { isActive: true },
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: string): Promise<UnitResponseDto> {
    const unit = await this.prisma.unit.findUnique({ where: { id } })
    if (!unit) throw new ResourceNotFoundException('Unidad', id)
    return unit
  }

  async create(dto: CreateUnitDto): Promise<UnitResponseDto> {
    const existing = await this.prisma.unit.findUnique({
      where: { symbol: dto.symbol },
    })

    if (existing) {
      throw new AppException(
        'UNIT_ALREADY_EXISTS',
        `Ya existe una unidad con el símbolo "${dto.symbol}"`,
        undefined,
        409,
      )
    }

    return this.prisma.unit.create({ data: dto })
  }

  async deactivate(id: string): Promise<UnitResponseDto> {
    await this.findOne(id)
    return this.prisma.unit.update({
      where: { id },
      data: { isActive: false },
    })
  }
}