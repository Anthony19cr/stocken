import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { SuppliersService } from './suppliers.service'
import { CreateSupplierDto } from './dto/create-supplier.dto'
import { UpdateSupplierDto } from './dto/update-supplier.dto'
import { SupplierResponseDto, PaginatedSuppliersDto } from './dto/supplier-response.dto'
import { Roles } from '../../shared/decorators/roles.decorator'
import { UserRole } from '@prisma/client'

@ApiTags('suppliers')
@ApiBearerAuth()
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Get()
  @ApiOperation({ summary: 'Listar proveedores' })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('search') search?: string,
  ): Promise<PaginatedSuppliersDto> {
    return this.suppliersService.findAll(page, pageSize, search)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener proveedor por ID' })
  async findOne(@Param('id') id: string): Promise<SupplierResponseDto> {
    return this.suppliersService.findOne(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Crear proveedor' })
  async create(@Body() dto: CreateSupplierDto): Promise<SupplierResponseDto> {
    return this.suppliersService.create(dto)
  }

  @Patch(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Actualizar proveedor' })
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateSupplierDto,
  ): Promise<SupplierResponseDto> {
    return this.suppliersService.update(id, dto)
  }

  @Delete(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Desactivar proveedor' })
  async deactivate(@Param('id') id: string): Promise<SupplierResponseDto> {
    return this.suppliersService.deactivate(id)
  }
}