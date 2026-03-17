import { ApiProperty } from '@nestjs/swagger'

export class CategoryResponseDto {
  @ApiProperty() id: string
  @ApiProperty() name: string
  @ApiProperty() isActive: boolean
  @ApiProperty() createdAt: Date
}