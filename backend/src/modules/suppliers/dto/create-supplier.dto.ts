import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsOptional, IsString, MinLength, MaxLength } from 'class-validator'

export class CreateSupplierDto {
  @ApiProperty({ example: 'Distribuidora El Sol' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name: string

  @ApiPropertyOptional({ example: '+506 8888-8888' })
  @IsOptional()
  @IsString()
  phone?: string

  @ApiPropertyOptional({ example: 'contacto@elsol.com' })
  @IsOptional()
  @IsEmail()
  email?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string
}