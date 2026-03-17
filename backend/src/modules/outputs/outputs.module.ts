import { Module } from '@nestjs/common'
import { OutputsController } from './outputs.controller'
import { OutputsService } from './outputs.service'
import { StockMovementsModule } from '../stock-movements/stock-movements.module'

@Module({
  imports: [StockMovementsModule],
  controllers: [OutputsController],
  providers: [OutputsService],
  exports: [OutputsService],
})
export class OutputsModule {}