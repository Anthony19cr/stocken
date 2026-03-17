import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { ProductsService } from './products.service'
import { CreateProductDto } from './dto/create-product.dto'
import { UpdateProductDto } from './dto/update-product.dto'
import { ProductFiltersDto } from './dto/product-filters.dto'
import {
  ProductResponseDto,
  ProductWithStockDto,
  PaginatedProductsDto,
} from './dto/product-response.dto'
import { Roles } from '../../shared/decorators/roles.decorator'
import { UserRole } from '@prisma/client'

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar productos con stock actual' })
  @ApiResponse({ status: 200, type: PaginatedProductsDto })
  async findAll(@Query() filters: ProductFiltersDto): Promise<PaginatedProductsDto> {
    return this.productsService.findAll(filters)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener producto por ID' })
  @ApiResponse({ status: 200, type: ProductWithStockDto })
  async findOne(@Param('id') id: string): Promise<ProductWithStockDto> {
    return this.productsService.findOne(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Crear producto' })
  @ApiResponse({ status: 201, type: ProductResponseDto })
  async create(@Body() dto: CreateProductDto): Promise<ProductResponseDto> {
    return this.productsService.create(dto)
  }

  @Patch(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Actualizar producto' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    return this.productsService.update(id, dto)
  }

  @Delete(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Desactivar producto' })
  async deactivate(@Param('id') id: string): Promise<ProductResponseDto> {
    return this.productsService.deactivate(id)
  }
}