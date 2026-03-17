import { ApiProperty } from '@nestjs/swagger'

export class AuthUserDto {
  @ApiProperty() id: string
  @ApiProperty() fullName: string
  @ApiProperty() email: string
  @ApiProperty() role: string
}

export class AuthResponseDto {
  @ApiProperty() accessToken: string
  @ApiProperty() refreshToken: string
  @ApiProperty({ type: AuthUserDto }) user: AuthUserDto
}