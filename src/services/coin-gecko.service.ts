import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { ConfigService } from '../config/config.service';

@Injectable()
export class CoinGeckoService {
  private readonly logger = new Logger(CoinGeckoService.name);
  private readonly baseUrl: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.coingeckoApiUrl;
  }

  async getTokenPrices(coinIds: string[]): Promise<Record<string, number>> {
    try {
      const response = await axios.get(`${this.baseUrl}/simple/price`, {
        params: {
          ids: coinIds.join(','),
          vs_currencies: 'usd',
        },
      });

      const prices: Record<string, number> = {};
      for (const coinId of coinIds) {
        if (response.data[coinId]) {
          prices[coinId] = response.data[coinId].usd;
        }
      }

      this.logger.log(`Successfully fetched prices for: ${coinIds.join(', ')}`);
      return prices;
    } catch (error) {
      this.logger.error(`Failed to fetch prices: ${error.message}`);
      throw new Error(`Failed to fetch cryptocurrency prices: ${error.message}`);
    }
  }

  async getEthereumPrice(): Promise<number> {
    const prices = await this.getTokenPrices(['ethereum']);
    return prices['ethereum'];
  }

  async getPolygonPrice(): Promise<number> {
    const prices = await this.getTokenPrices(['matic-network']);
    return prices['matic-network'];
  }

  async getEthAndMaticPrices(): Promise<{ ethereum: number; matic: number }> {
    const prices = await this.getTokenPrices(['ethereum', 'matic-network']);
    return {
      ethereum: prices['ethereum'],
      matic: prices['matic-network'],
    };
  }
}