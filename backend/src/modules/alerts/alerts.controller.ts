import { Controller, Get, Patch, Param, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger'
import { AlertsService } from './alerts.service'
import { AlertResponseDto, PaginatedAlertsDto } from './dto/alert-response.dto'
import { AlertStatus } from '@prisma/client'

@ApiTags('alerts')
@ApiBearerAuth()
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar alertas activas' })
  @ApiQuery({ name: 'page', required: false })
  @ApiQuery({ name: 'pageSize', required: false })
  @ApiQuery({ name: 'status', required: false, enum: AlertStatus })
  async findAll(
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
    @Query('status') status?: AlertStatus,
  ): Promise<PaginatedAlertsDto> {
    return this.alertsService.findAll(page, pageSize, status)
  }

  @Patch(':id/resolve')
  @ApiOperation({ summary: 'Marcar alerta como resuelta' })
  async resolve(@Param('id') id: string): Promise<AlertResponseDto> {
    return this.alertsService.resolve(id)
  }

  @Patch(':id/dismiss')
  @ApiOperation({ summary: 'Descartar alerta' })
  async dismiss(@Param('id') id: string): Promise<AlertResponseDto> {
    return this.alertsService.dismiss(id)
  }
}