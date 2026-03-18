import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'
import { FeatureName } from '@prisma/client'

export class UpdateFeatureFlagDto {
  @ApiProperty()
  @IsBoolean()
  isEnabled: boolean
}

export class FeatureFlagResponseDto {
  @ApiProperty({ enum: FeatureName }) feature: FeatureName
  @ApiProperty() isEnabled: boolean
  @ApiProperty() updatedAt: Date
}