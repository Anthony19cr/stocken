import { Controller, Get, Patch, Body } from '@nestjs/common'
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger'
import { BrandingService } from './branding.service'
import { UpdateBrandingDto, BrandingResponseDto } from './dto/branding.dto'
import { Roles } from '../../shared/decorators/roles.decorator'
import { UserRole } from '@prisma/client'

@ApiTags('branding')
@ApiBearerAuth()
@Controller('branding')
export class BrandingController {
  constructor(private readonly brandingService: BrandingService) {}

  @Get()
  @ApiOperation({ summary: 'Obtener configuración de branding' })
  async get(): Promise<BrandingResponseDto> {
    return this.brandingService.get()
  }

  @Patch()
  @Roles(UserRole.TENANT_ADMIN)
  @ApiOperation({ summary: 'Actualizar branding del sistema' })
  async update(@Body() dto: UpdateBrandingDto): Promise<BrandingResponseDto> {
    return this.brandingService.update(dto)
  }
}