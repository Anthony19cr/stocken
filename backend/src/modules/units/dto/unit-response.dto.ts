import { ApiProperty } from '@nestjs/swagger'

export class UnitResponseDto {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() symbol: string
  @ApiProperty() isActive: boolean
  @ApiProperty() createdAt: Date
}