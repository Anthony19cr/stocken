import { Controller, Get, Param, Query } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { StockMovementsService } from './stock-movements.service'
import { MovementFiltersDto } from './dto/movement-filters.dto'
import { StockMovementResponseDto, PaginatedMovementsDto } from './dto/stock-movement-response.dto'

@ApiTags('stock-movements')
@ApiBearerAuth()
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar movimientos de stock' })
  async findAll(@Query() filters: MovementFiltersDto): Promise<PaginatedMovementsDto> {
    return this.stockMovementsService.findAll(filters)
  }

  @Get('product/:productId')
  @ApiOperation({ summary: 'Historial de movimientos por producto' })
  async findByProduct(
    @Param('productId') productId: string,
  ): Promise<StockMovementResponseDto[]> {
    return this.stockMovementsService.findByProduct(productId)
  }
}