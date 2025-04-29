// src/app.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CoinGeckoService } from './services/coin-gecko.service';
import { PriceTrackerService } from './services/price-tracker.service';

@ApiTags('crypto')
@Controller()
export class AppController {
  constructor(
    private readonly coinGeckoService: CoinGeckoService,
    private readonly priceTrackerService: PriceTrackerService,
  ) {}

  @Get()
  getHello(): string {
    return 'Crypto Price Tracker API';
  }

  @Get('prices')
  @ApiOperation({ summary: 'Get current ETH and MATIC prices' })
  @ApiResponse({ status: 200, description: 'Returns current prices' })
  async getCurrentPrices() {
    return await this.coinGeckoService.getEthAndMaticPrices();
  }

  @Get('stored-prices')
  @ApiOperation({ summary: 'Get stored historical prices' })
  @ApiResponse({ status: 200, description: 'Returns stored prices' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getStoredPrices(@Query('limit') limit: number = 10) {
    return await this.priceTrackerService.getStoredPrices(limit);
  }
}