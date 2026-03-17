import { ApiProperty } from '@nestjs/swagger'
import { UserRole } from '@prisma/client'

export class UserResponseDto {
  @ApiProperty() id: string
  @ApiProperty() fullName: string
  @ApiProperty() email: string
  @ApiProperty({ enum: UserRole }) role: UserRole
  @ApiProperty() isActive: boolean
  @ApiProperty() createdAt: Date
  @ApiProperty() updatedAt: Date
}

export class PaginatedUsersDto {
  @ApiProperty({ type: [UserResponseDto] }) data: UserResponseDto[]
  @ApiProperty() total: number
  @ApiProperty() page: number
  @ApiProperty() pageSize: number
}