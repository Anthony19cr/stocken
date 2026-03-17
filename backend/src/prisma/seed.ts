import { PrismaClient, UserRole } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Admin user
  const passwordHash = await bcrypt.hash('admin123', 12)

  const admin = await prisma.user.upsert({
    where: { email: 'admin@stocken.com' },
    update: {},
    create: {
      fullName: 'Administrador',
      email: 'admin@stocken.com',
      passwordHash,
      role: UserRole.TENANT_ADMIN,
      isActive: true,
    },
  })

  console.log(`Admin user: ${admin.email}`)

  // Tenant settings
  await prisma.tenantSettings.upsert({
    where: { id: '00000000-0000-0000-0000-000000000001' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000001',
      restaurantName: 'Mi Restaurante',
      systemName: 'Stocken',
      timezone: 'America/Costa_Rica',
      currency: 'CRC',
      dateFormat: 'DD/MM/YYYY',
      expirationAlertDays: 7,
      allowNegativeStock: false,
    },
  })

  console.log('Tenant settings created')

  // Tenant branding
  await prisma.tenantBranding.upsert({
    where: { id: '00000000-0000-0000-0000-000000000002' },
    update: {},
    create: {
      id: '00000000-0000-0000-0000-000000000002',
      restaurantName: 'Mi Restaurante',
      primaryColor: '#2563EB',
      secondaryColor: '#64748B',
      accentColor: '#F59E0B',
    },
  })

  console.log('Tenant branding created')

  // Feature flags
  const features = [
    'SUPPLIER_MANAGEMENT',
    'LOW_STOCK_ALERTS',
    'WASTE_TRACKING',
    'ADVANCED_REPORTS',
  ]

  for (const feature of features) {
    await prisma.featureFlag.upsert({
      where: { feature: feature as any },
      update: {},
      create: { feature: feature as any, isEnabled: true },
    })
  }

  console.log('Feature flags created')
  console.log('Seed complete')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(async () => { await prisma.$disconnect() })