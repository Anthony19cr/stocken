import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { CategoryResponseDto } from './dto/category-response.dto'
import {
  AppException,
  ResourceNotFoundException,
} from '../../shared/exceptions/app.exception'

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(onlyActive = true): Promise<CategoryResponseDto[]> {
    return this.prisma.category.findMany({
      where: onlyActive ? { isActive: true } : undefined,
      orderBy: { name: 'asc' },
    })
  }

  async findOne(id: string): Promise<CategoryResponseDto> {
    const category = await this.prisma.category.findUnique({ where: { id } })
    if (!category) throw new ResourceNotFoundException('Categoría', id)
    return category
  }

  async create(dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    const existing = await this.prisma.category.findUnique({
      where: { name: dto.name },
    })

    if (existing) {
      throw new AppException(
        'CATEGORY_ALREADY_EXISTS',
        `Ya existe una categoría con el nombre "${dto.name}"`,
        undefined,
        409,
      )
    }

    return this.prisma.category.create({ data: { name: dto.name } })
  }

  async update(id: string, dto: UpdateCategoryDto): Promise<CategoryResponseDto> {
    await this.findOne(id)
    return this.prisma.category.update({ where: { id }, data: dto })
  }

  async deactivate(id: string): Promise<CategoryResponseDto> {
    await this.findOne(id)
    return this.prisma.category.update({
      where: { id },
      data: { isActive: false },
    })
  }
}