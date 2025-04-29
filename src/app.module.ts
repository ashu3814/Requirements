import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoinGeckoService } from './services/coin-gecko.service';
import { Price } from './entities/price.entity';
import { PriceAlert } from './entities/price-alert.entity';
import { PriceTrackerService } from './services/price-tracker.service';
import { AlertService } from './services/alert.service';
import { EmailService } from './services/email.service';
import { PriceService } from './services/price.service';
import { PriceController } from './controllers/price.controller';
import { AlertController } from './controllers/alert.controller';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'crypto_user', // Your database username
      password: 'CryptoTrack2025!', // Your database password
      database: 'crypto_tracker',
      entities: [Price, PriceAlert],
      synchronize: true,
    }),
    TypeOrmModule.forFeature([Price, PriceAlert]),
    ScheduleModule.forRoot(),
  ],
  controllers: [
    AppController,
    PriceController,
    AlertController,
  ],
  providers: [
    AppService,
    CoinGeckoService,
    PriceTrackerService,
    AlertService,
    EmailService,
    PriceService,
  ],
})
export class AppModule {}