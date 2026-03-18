import { Injectable } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { UpdateFeatureFlagDto, FeatureFlagResponseDto } from './dto/feature-flag.dto'
import { FeatureName } from '@prisma/client'

@Injectable()
export class FeatureFlagsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(): Promise<FeatureFlagResponseDto[]> {
    const flags = await this.prisma.featureFlag.findMany({
      orderBy: { feature: 'asc' },
    })

    // Asegurar que todos los features existan en BD
    const existingFeatures = new Set(flags.map((f) => f.feature))
    const allFeatures = Object.values(FeatureName)
    const missingFeatures = allFeatures.filter((f) => !existingFeatures.has(f))

    if (missingFeatures.length > 0) {
      await this.prisma.featureFlag.createMany({
        data: missingFeatures.map((feature) => ({ feature, isEnabled: false })),
        skipDuplicates: true,
      })
      return this.findAll()
    }

    return flags
  }

  async update(
    feature: FeatureName,
    dto: UpdateFeatureFlagDto,
    userId: string,
  ): Promise<FeatureFlagResponseDto> {
    return this.prisma.featureFlag.upsert({
      where: { feature },
      create: { feature, isEnabled: dto.isEnabled, updatedBy: userId },
      update: { isEnabled: dto.isEnabled, updatedBy: userId },
    })
  }

  async isEnabled(feature: FeatureName): Promise<boolean> {
    const flag = await this.prisma.featureFlag.findUnique({ where: { feature } })
    return flag?.isEnabled ?? false
  }
}