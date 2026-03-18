import { Module } from '@nestjs/common'
import { EntriesController } from './entries.controller'
import { EntriesService } from './entries.service'
import { StockMovementsModule } from '../stock-movements/stock-movements.module'
import { AlertsModule } from '../alerts/alerts.module'

@Module({
  imports: [StockMovementsModule, AlertsModule],
  controllers: [EntriesController],
  providers: [EntriesService],
  exports: [EntriesService],
})
export class EntriesModule {}