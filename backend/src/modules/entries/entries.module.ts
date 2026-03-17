import { Module } from '@nestjs/common'
import { EntriesController } from './entries.controller'
import { EntriesService } from './entries.service'
import { StockMovementsModule } from '../stock-movements/stock-movements.module'

@Module({
  imports: [StockMovementsModule],
  controllers: [EntriesController],
  providers: [EntriesService],
  exports: [EntriesService],
})
export class EntriesModule {}