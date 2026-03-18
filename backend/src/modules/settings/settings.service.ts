import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { UpdateSettingsDto, SettingsResponseDto } from './dto/settings.dto'

@Injectable()
export class SettingsService {
  constructor(private readonly prisma: PrismaService) {}

  async get(): Promise<SettingsResponseDto> {
    let settings = await this.prisma.tenantSettings.findFirst()

    if (!settings) {
      settings = await this.prisma.tenantSettings.create({
        data: {},
      })
    }

    return settings
  }

  async update(dto: UpdateSettingsDto): Promise<SettingsResponseDto> {
    const settings = await this.get()
    return this.prisma.tenantSettings.update({
      where: { id: settings.id },
      data: dto,
    })
  }
}