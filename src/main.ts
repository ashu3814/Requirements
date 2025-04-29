import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { ConfigService } from './config/config.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);
  
  const config = new DocumentBuilder()
    .setTitle('Crypto Price Tracker API')
    .setDescription('API for tracking cryptocurrency prices')
    .setVersion('1.0')
    .addTag('crypto')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  try {
    const dataSource = app.get(DataSource);
    if (dataSource.isInitialized) {
      console.log('Database connection established successfully');
    }
  } catch (error) {
    console.error('Failed to connect to database:', error);
  }

  const port = configService.port;
  await app.listen(port);
  console.log(`Application is running on: http://localhost:${port}`);
  console.log(`Swagger documentation available at: http://localhost:${port}/api`);
}
bootstrap();