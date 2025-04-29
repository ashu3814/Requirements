// src/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoinGeckoService } from './services/coin-gecko.service';
import { Price } from './entities/price.entity';
import { PriceTrackerService } from './services/price-tracker.service';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'crypto_user', // Your database username
      password: 'CryptoTrack2025!', // Your database password
      database: 'crypto_tracker',
      entities: [Price],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Price]),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, CoinGeckoService, PriceTrackerService],
})
export class AppModule {}