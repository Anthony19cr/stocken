import { NestFactory } from '@nestjs/core'
import { ValidationPipe } from '@nestjs/common'
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger'
import helmet from 'helmet'
import { AppModule } from './app.module'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  // Security
  app.use(helmet())
  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') ?? ['http://localhost:5173'],
    credentials: true,
  })

  // Global prefix
  app.setGlobalPrefix(process.env.API_PREFIX ?? 'api/v1')

  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  // Swagger
  const config = new DocumentBuilder()
    .setTitle('Stocken API')
    .setDescription('Restaurant Inventory Management Platform')
    .setVersion('1.0')
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument(app, config)
  SwaggerModule.setup('api/docs', app, document)

  const port = process.env.PORT ?? 3001
  await app.listen(port)

  console.log(`Stocken API running on http://localhost:${port}/api/v1`)
  console.log(`Swagger docs at http://localhost:${port}/api/docs`)
}

bootstrap()