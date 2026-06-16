import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { AppModule } from './app.module';
<<<<<<< HEAD
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';
=======
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
>>>>>>> 01baa886891db1263d9ee5b1ee826fbf9abdf4b9

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

<<<<<<< HEAD
  app.use(helmet());
  app.enableCors();
=======
  // ── Security middleware ────────────────────────────────────────────────────

  app.use(helmet());
  app.getHttpAdapter().getInstance().set('trust proxy', 1);

  // ── Global pipes & filters ─────────────────────────────────────────────────
>>>>>>> 01baa886891db1263d9ee5b1ee826fbf9abdf4b9

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

<<<<<<< HEAD
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ResponseInterceptor());

  app.setGlobalPrefix('api/v1');

  const swaggerConfig = new DocumentBuilder()
    .setTitle('Timetable Management API')
    .setDescription('REST API for managing timetables, lecturers, students, and courses')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') || 3333;

  await app.listen(port);
  console.log(`Application running on http://localhost:${port}/api/v1`);
  console.log(`Swagger docs at http://localhost:${port}/api/docs`);
=======
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
>>>>>>> 01baa886891db1263d9ee5b1ee826fbf9abdf4b9
}
bootstrap();
