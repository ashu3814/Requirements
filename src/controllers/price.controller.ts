import { Controller, Get, Param, Query, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiParam, ApiQuery } from '@nestjs/swagger';
import { PriceService } from '../services/price.service';

@ApiTags('prices')
@Controller('prices')
export class PriceController {
  constructor(private readonly priceService: PriceService) {}

  @Get(':token')
  @ApiOperation({ summary: 'Get 24 hour price history for a specific token' })
  @ApiResponse({ status: 200, description: 'Returns hourly price data for the last 24 hours' })
  @ApiParam({ name: 'token', enum: ['ethereum', 'matic'], description: 'Token symbol' })
  @ApiQuery({ name: 'limit', required: false, type: Number, description: 'Number of data points to return (default: 24)' })
  async getTokenPriceHistory(
    @Param('token') token: string,
    @Query('limit') limit: number = 24,
  ) {
    return await this.priceService.getTokenPriceHistory(token, limit);
  }

  @Get()
  @ApiOperation({ summary: 'Get current prices for all tracked tokens' })
  @ApiResponse({ status: 200, description: 'Returns current prices for ETH and MATIC' })
  async getAllCurrentPrices() {
    return await this.priceService.getCurrentPrices();
  }
}