import { Controller, Get } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { DashboardService } from './dashboard.service'
import { DashboardSummaryDto } from './dto/dashboard-summary.dto'

@ApiTags('dashboard')
@ApiBearerAuth()
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Obtener resumen del dashboard' })
  async getSummary(): Promise<DashboardSummaryDto> {
    return this.dashboardService.getSummary()
  }
}