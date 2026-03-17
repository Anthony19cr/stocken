import { ApiProperty } from '@nestjs/swagger'
import { IsString, MinLength, MaxLength } from 'class-validator'

export class CreateUnitDto {
  @ApiProperty({ example: 'Kilogramo' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name: string

  @ApiProperty({ example: 'kg' })
  @IsString()
  @MinLength(1)
  @MaxLength(10)
  symbol: string
}