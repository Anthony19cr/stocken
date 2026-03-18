import { Controller, Get, Patch, Param, Body } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { FeatureFlagsService } from './feature-flags.service'
import { UpdateFeatureFlagDto, FeatureFlagResponseDto } from './dto/feature-flag.dto'
import { CurrentUser } from '../../shared/decorators/current-user.decorator'
import type { AuthUser } from '../../shared/decorators/current-user.decorator'
import { Roles } from '../../shared/decorators/roles.decorator'
import { UserRole, FeatureName } from '@prisma/client'

@ApiTags('feature-flags')
@ApiBearerAuth()
@Controller('feature-flags')
export class FeatureFlagsController {
  constructor(private readonly featureFlagsService: FeatureFlagsService) {}

  @Get()
  @ApiOperation({ summary: 'Listar todos los feature flags' })
  async findAll(): Promise<FeatureFlagResponseDto[]> {
    return this.featureFlagsService.findAll()
  }

  @Patch(':feature')
  @Roles(UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Activar o desactivar un feature flag' })
  async update(
    @Param('feature') feature: FeatureName,
    @Body() dto: UpdateFeatureFlagDto,
    @CurrentUser() user: AuthUser,
  ): Promise<FeatureFlagResponseDto> {
    return this.featureFlagsService.update(feature, dto, user.sub)
  }
}