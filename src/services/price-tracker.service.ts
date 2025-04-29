import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Price } from '../entities/price.entity';
import { CoinGeckoService } from './coin-gecko.service';
import { AlertService } from './alert.service';

@Injectable()
export class PriceTrackerService {
  private readonly logger = new Logger(PriceTrackerService.name);

  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    private coinGeckoService: CoinGeckoService,
    private alertService: AlertService,
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
      
      // Check for price increases and alerts after storing new prices
      await this.alertService.checkPriceIncreases();
      await this.alertService.checkPriceAlerts();
      
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
  
  // Method to get hourly prices for the last 24 hours
  async getHourlyPrices() {
    // Get current time
    const now = new Date();
    // Get time 24 hours ago
    const twentyFourHoursAgo = new Date(now);
    twentyFourHoursAgo.setHours(now.getHours() - 24);
    
    // Query to get hourly data
    // This is a simplified version - in production, you might want to use
    // a more sophisticated approach to get exactly one price point per hour
    const hourlyPrices = await this.priceRepository
      .createQueryBuilder('price')
      .where('price.timestamp >= :startTime', { startTime: twentyFourHoursAgo })
      .orderBy('price.timestamp', 'DESC')
      .getMany();
    
    // Group by token and organize data
    const result: { 
      ethereum: Array<{timestamp: Date, price: number}>;
      matic: Array<{timestamp: Date, price: number}>;
    } = {
      ethereum: [],
      matic: []
    };
    
    hourlyPrices.forEach(price => {
      if (price.token === 'ethereum' || price.token === 'matic') {
        result[price.token as 'ethereum' | 'matic'].push({
          timestamp: price.timestamp,
          price: price.price
        });
      }
    });
    
    return result;
  }
}