import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateSupplierDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}