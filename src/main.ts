import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ── Security middleware ────────────────────────────────────────────────────

  app.use(helmet());
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // ── Global pipes & filters ─────────────────────────────────────────────────

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // ── Swagger ────────────────────────────────────────────────────────────────

  const config = new DocumentBuilder()
      .setTitle('Timetable Management System')
      .setDescription(
        '### Timetable Management API v1\n'
      )
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('Auth', 'Registration, login, token refresh')
      .addTag('Users', 'User profile management')
      .addTag('Admin', 'Admin-only operations')
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();
