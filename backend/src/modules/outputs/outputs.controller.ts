import {
  Controller, Get, Post, Body, Param,
  Query, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { OutputsService } from './outputs.service'
import { CreateOutputDto } from './dto/create-output.dto'
import { OutputResponseDto, PaginatedOutputsDto } from './dto/output-response.dto'
import { CurrentUser } from '../../shared/decorators/current-user.decorator'
import type { AuthUser } from '../../shared/decorators/current-user.decorator'
import { Roles } from '../../shared/decorators/roles.decorator'
import { UserRole } from '@prisma/client'

@ApiTags('outputs')
@ApiBearerAuth()
@Controller('outputs')
export class OutputsController {
  constructor(private readonly outputsService: OutputsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar salidas de inventario' })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('productId') productId?: string,
  ): Promise<PaginatedOutputsDto> {
    return this.outputsService.findAll(page, pageSize, productId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener salida por ID' })
  async findOne(@Param('id') id: string): Promise<OutputResponseDto> {
    return this.outputsService.findOne(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  @ApiOperation({ summary: 'Registrar salida de inventario' })
  async create(
    @Body() dto: CreateOutputDto,
    @CurrentUser() user: AuthUser,
  ): Promise<OutputResponseDto> {
    return this.outputsService.create(dto, user.sub)
  }
}