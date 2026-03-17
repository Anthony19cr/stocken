import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator'
import { UserRole } from '@prisma/client'

export class CreateUserDto {
  @ApiProperty({ example: 'Juan Pérez' })
  @IsString()
  fullName: string

  @ApiProperty({ example: 'juan@stocken.com' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string

  @ApiProperty({ example: 'password123', minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string

  @ApiPropertyOptional({ enum: UserRole, default: UserRole.VIEWER })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole
}