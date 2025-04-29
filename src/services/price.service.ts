import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Price } from '../entities/price.entity';
import { CoinGeckoService } from './coin-gecko.service';

@Injectable()
export class PriceService {
  private readonly logger = new Logger(PriceService.name);

  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    private coinGeckoService: CoinGeckoService,
  ) {}

  /**
   * Get price history for a specific token
   * @param token Token symbol (ethereum or matic)
   * @param limit Number of data points to return
   * @returns Array of price data points
   */
  async getTokenPriceHistory(token: string, limit: number = 24): Promise<Price[]> {
    if (!['ethereum', 'matic'].includes(token)) {
      throw new NotFoundException(`Token ${token} not supported. Use 'ethereum' or 'matic'.`);
    }

    // Get price data from the last 24 hours
    const twentyFourHoursAgo = new Date();
    twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

    const prices = await this.priceRepository.find({
      where: {
        token,
        timestamp: LessThan(new Date()),
      },
      order: {
        timestamp: 'DESC',
      },
      take: limit,
    });

    return prices;
  }

  /**
   * Get current prices for all tracked tokens
   * @returns Object with current prices
   */
  async getCurrentPrices(): Promise<{ ethereum: number; matic: number }> {
    try {
      return await this.coinGeckoService.getEthAndMaticPrices();
    } catch (error) {
      this.logger.error(`Failed to fetch current prices: ${error.message}`);
      throw new Error('Failed to fetch current prices from CoinGecko');
    }
  }
}