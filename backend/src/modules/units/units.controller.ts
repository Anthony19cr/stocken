import {
  Controller, Get, Post, Delete,
  Body, Param, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { UnitsService } from './units.service'
import { CreateUnitDto } from './dto/create-unit.dto'
import { UnitResponseDto } from './dto/unit-response.dto'
import { Roles } from '../../shared/decorators/roles.decorator'
import { UserRole } from '@prisma/client'

@ApiTags('units')
@ApiBearerAuth()
@Controller('units')
export class UnitsController {
  constructor(private readonly unitsService: UnitsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar unidades de medida' })
  async findAll(): Promise<UnitResponseDto[]> {
    return this.unitsService.findAll()
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Crear unidad de medida' })
  async create(@Body() dto: CreateUnitDto): Promise<UnitResponseDto> {
    return this.unitsService.create(dto)
  }

  @Delete(':id')
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER)
  @ApiOperation({ summary: 'Desactivar unidad de medida' })
  async deactivate(@Param('id') id: string): Promise<UnitResponseDto> {
    return this.unitsService.deactivate(id)
  }
}