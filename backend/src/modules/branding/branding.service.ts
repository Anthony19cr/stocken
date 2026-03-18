import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { UpdateBrandingDto, BrandingResponseDto } from './dto/branding.dto'

@Injectable()
export class BrandingService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<BrandingResponseDto> {
    let branding = await this.prisma.tenantBranding.findFirst()

    if (!branding) {
      branding = await this.prisma.tenantBranding.create({ data: {} })
    }

    return branding
  }

  async update(dto: UpdateBrandingDto): Promise<BrandingResponseDto> {
    const branding = await this.get()
    return this.prisma.tenantBranding.update({
      where: { id: branding.id },
      data: dto,
    })
  }
}