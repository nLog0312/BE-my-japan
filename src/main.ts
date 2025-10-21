import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  const port = configService.get('PORT') || process.env.PORT || 8080;
  app.setGlobalPrefix('api/v1', { exclude: [''] });
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true
  }));
  app.enableCors({ origin: '*' });

  if (process.env.NODE_ENV !== 'production') {
    const config = new DocumentBuilder()
      .addBearerAuth()
      .setTitle('MyJapan APIs')
      .setVersion('1.0')
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(process.env.PORT || 8080, '0.0.0.0');
  console.log(`🚀 Server running on http://0.0.0.0:${port}`);
}
bootstrap();
