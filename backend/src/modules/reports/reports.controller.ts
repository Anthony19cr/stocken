import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { ReportsService } from './reports.service'
import { ReportFiltersDto } from './dto/report-filters.dto'

@ApiTags('reports')
@ApiBearerAuth()
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('movements')
  @ApiOperation({ summary: 'Reporte de movimientos' })
  async getMovements(@Query() filters: ReportFiltersDto) {
    return this.reportsService.getMovements(filters)
  }

  @Get('consumption')
  @ApiOperation({ summary: 'Reporte de consumo por producto' })
  async getConsumption(@Query() filters: ReportFiltersDto) {
    return this.reportsService.getConsumption(filters)
  }

  @Get('low-stock')
  @ApiOperation({ summary: 'Reporte de productos con bajo stock' })
  async getLowStock() {
    return this.reportsService.getLowStock()
  }

  @Get('expiring')
  @ApiOperation({ summary: 'Reporte de productos por vencer' })
  async getExpiring(@Query() filters: ReportFiltersDto) {
    return this.reportsService.getExpiring(filters)
  }

  @Get('entries-by-supplier')
  @ApiOperation({ summary: 'Reporte de entradas por proveedor' })
  async getEntriesBySupplier(@Query() filters: ReportFiltersDto) {
    return this.reportsService.getEntriesBySupplier(filters)
  }
}