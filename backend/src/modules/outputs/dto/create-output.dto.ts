import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsNumber, IsOptional, IsPositive, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'
import { OutputReason } from '@prisma/client'

export class CreateOutputDto {
  @ApiProperty()
  @IsUUID()
  productId: string

  @ApiProperty({ example: 3 })
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  quantity: number

  @ApiProperty({ enum: OutputReason })
  @IsEnum(OutputReason)
  outputReason: OutputReason

  @ApiPropertyOptional()
  @IsOptional()
  notes?: string
}