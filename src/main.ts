// src/main.ts
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Swagger Setup - Make sure this is correctly configured
  const config = new DocumentBuilder()
    .setTitle('Crypto Price Tracker API')
    .setDescription('API for tracking cryptocurrency prices')
    .setVersion('1.0')
    .addTag('crypto') // This should match the ApiTags in your controller
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document); // This makes Swagger available at /api

  // Database connection check
  try {
    const dataSource = app.get(DataSource);
    if (dataSource.isInitialized) {
      console.log('Database connection established successfully');
    }
  } catch (error) {
    console.error('Failed to connect to database:', error);
  }

  await app.listen(3000);
  console.log(`Application is running on: http://localhost:3000`);
  console.log(`Swagger documentation available at: http://localhost:3000/api`);
}
bootstrap();