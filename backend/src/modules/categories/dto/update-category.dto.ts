import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateCategoryDto {
  @ApiPropertyOptional({ example: 'Lácteos' })
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}