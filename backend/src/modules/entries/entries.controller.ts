import {
  Controller, Get, Post, Body, Param,
  Query, HttpCode, HttpStatus,
} from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { EntriesService } from './entries.service'
import { CreateEntryDto } from './dto/create-entry.dto'
import { EntryResponseDto, PaginatedEntriesDto } from './dto/entry-response.dto'
import { CurrentUser } from '../../shared/decorators/current-user.decorator'
import type { AuthUser } from '../../shared/decorators/current-user.decorator'
import { Roles } from '../../shared/decorators/roles.decorator'
import { UserRole } from '@prisma/client'

@ApiTags('entries')
@ApiBearerAuth()
@Controller('entries')
export class EntriesController {
  constructor(private readonly entriesService: EntriesService) {}

  @Get()
  @ApiOperation({ summary: 'Listar entradas de inventario' })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('productId') productId?: string,
  ): Promise<PaginatedEntriesDto> {
    return this.entriesService.findAll(page, pageSize, productId)
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obtener entrada por ID' })
  async findOne(@Param('id') id: string): Promise<EntryResponseDto> {
    return this.entriesService.findOne(id)
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @Roles(UserRole.TENANT_ADMIN, UserRole.MANAGER, UserRole.WAREHOUSE)
  @ApiOperation({ summary: 'Registrar entrada de inventario' })
  async create(
    @Body() dto: CreateEntryDto,
    @CurrentUser() user: AuthUser,
  ): Promise<EntryResponseDto> {
    return this.entriesService.create(dto, user.sub)
  }
}