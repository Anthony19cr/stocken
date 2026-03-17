import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { CategoriesService } from './categories.service'
import { CreateCategoryDto } from './dto/create-category.dto'
import { UpdateCategoryDto } from './dto/update-category.dto'
import { CategoryResponseDto } from './dto/category-response.dto'
import { Roles } from '../../shared/decorators/roles.decorator'
import { UserRole } from '@prisma/client'

@ApiTags('categories')
@ApiBearerAuth()
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar categorías' })
  @ApiQuery({ name: 'onlyActive', required: false, type: Boolean })
  async findAll(
    @Query('onlyActive') onlyActive?: string,
  ): Promise<CategoryResponseDto[]> {
    return this.categoriesService.findAll(onlyActive !== 'false')
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener categoría por ID' })
  async findOne(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoriesService.findOne(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Crear categoría' })
  async create(@Body() dto: CreateCategoryDto): Promise<CategoryResponseDto> {
    return this.categoriesService.create(dto)
  }

  @Patch(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Actualizar categoría' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateCategoryDto,
  ): Promise<CategoryResponseDto> {
    return this.categoriesService.update(id, dto)
  }

  @Delete(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Desactivar categoría' })
  async deactivate(@Param('id') id: string): Promise<CategoryResponseDto> {
    return this.categoriesService.deactivate(id)
  }
}