import { Controller, Get, Patch, Body } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { SettingsService } from './settings.service'
import { UpdateSettingsDto, SettingsResponseDto } from './dto/settings.dto'
import { Roles } from '../../shared/decorators/roles.decorator'
import { UserRole } from '@prisma/client'

@ApiTags('settings')
@ApiBearerAuth()
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener configuración del sistema' })
  async get(): Promise<SettingsResponseDto> {
    return this.settingsService.get()
  }

  @Patch()
  @Roles(UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Actualizar configuración del sistema' })
  async update(@Body() dto: UpdateSettingsDto): Promise<SettingsResponseDto> {
    return this.settingsService.update(dto)
  }
}