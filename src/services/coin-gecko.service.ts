// src/services/coin-gecko.service.ts
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class CoinGeckoService {
  private readonly logger = new Logger(CoinGeckoService.name);
  private readonly baseUrl = 'https://api.coingecko.com/api/v3';

  /**
   * Fetches current price for specified cryptocurrencies
   * @param coinIds Array of coin IDs (e.g., 'ethereum', 'matic-network')
   * @returns Object with coin prices in USD
   */
  async getTokenPrices(coinIds: string[]): Promise<Record<string, number>> {
    try {
      const response = await axios.get(`${this.baseUrl}/simple/price`, {
        params: {
          ids: coinIds.join(','),
          vs_currencies: 'usd',
        },
      });

      // Transform the response into a simpler format
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

  /**
   * Fetch Ethereum price
   * @returns Current ETH price in USD
   */
  async getEthereumPrice(): Promise<number> {
    const prices = await this.getTokenPrices(['ethereum']);
    return prices['ethereum'];
  }

  /**
   * Fetch Polygon (MATIC) price
   * @returns Current MATIC price in USD
   */
  async getPolygonPrice(): Promise<number> {
    const prices = await this.getTokenPrices(['matic-network']);
    return prices['matic-network'];
  }

  /**
   * Fetch both ETH and MATIC prices at once
   * @returns Object with both prices
   */
  async getEthAndMaticPrices(): Promise<{ ethereum: number; matic: number }> {
    const prices = await this.getTokenPrices(['ethereum', 'matic-network']);
    return {
      ethereum: prices['ethereum'],
      matic: prices['matic-network'],
    };
  }
}