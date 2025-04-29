// src/services/price-tracker.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Price } from '../entities/price.entity';
import { CoinGeckoService } from './coin-gecko.service';

@Injectable()
export class PriceTrackerService {
  private readonly logger = new Logger(PriceTrackerService.name);

  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    private coinGeckoService: CoinGeckoService,
  ) {}

  @Cron('*/5 * * * *') // Run every 5 minutes
  async trackPrices() {
    this.logger.log('Fetching and storing current crypto prices');
    
    try {
      const prices = await this.coinGeckoService.getEthAndMaticPrices();
      
      // Store ETH price
      await this.priceRepository.save({
        token: 'ethereum',
        price: prices.ethereum,
      });
      
      // Store MATIC price
      await this.priceRepository.save({
        token: 'matic',
        price: prices.matic,
      });
      
      this.logger.log(`Successfully stored prices: ETH: $${prices.ethereum}, MATIC: $${prices.matic}`);
    } catch (error) {
      this.logger.error(`Failed to track prices: ${error.message}`);
    }
  }

  // Method to get stored prices for testing
  async getStoredPrices(limit: number = 10) {
    return await this.priceRepository.find({
      order: { timestamp: 'DESC' },
      take: limit,
    });
  }
}