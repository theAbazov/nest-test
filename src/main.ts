import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { GlobalValidationPipe } from './common/pipes/validation.pipe';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const logger = new Logger('Bootstrap');

  // Глобальные настройки
  app.setGlobalPrefix('api', {
    exclude: ['/'], // Исключаем корневой путь
  });

  // Глобальные пайпы, фильтры и интерцепторы
  app.useGlobalPipes(new GlobalValidationPipe());
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // CORS настройки
  app.enableCors({
    origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // Swagger документация
  const config = new DocumentBuilder()
    .setTitle('Todo Application API')
    .setDescription('API для управления задачами с аутентификацией и файлами')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Введите JWT токен',
        in: 'header',
      },
      'JWT-auth', // Это имя будет использоваться в декораторах
    )
    .addTag('Auth', 'Аутентификация и авторизация')
    .addTag('Todos', 'Управление задачами')
    .addTag('Files', 'Управление файлами')
    .addTag('WebSocket', 'Real-time обновления')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // Сохраняет токен между сессиями
      tagsSorter: 'alpha',
      operationsSorter: 'method',
    },
    customSiteTitle: 'Todo API Documentation',
  });

  const port = process.env.PORT ?? 3000;
  await app.listen(port);

  logger.log(`🚀 Приложение запущено на http://localhost:${port}`);
  logger.log(`📚 Swagger документация: http://localhost:${port}/api`);
  logger.log(`🔄 WebSocket: ws://localhost:${port}/socket.io/`);
}

bootstrap();
