import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { CoinGeckoService } from './services/coin-gecko.service';
import { PriceTrackerService } from './services/price-tracker.service';
import { AlertService } from './services/alert.service';
import { EmailService } from './services/email.service';
import { CreatePriceAlertDto } from './dto/create-price-alert.dto';

@ApiTags('crypto')
@Controller()
export class AppController {
  constructor(
    private readonly coinGeckoService: CoinGeckoService,
    private readonly priceTrackerService: PriceTrackerService,
    private readonly alertService: AlertService,
    private readonly emailService: EmailService,
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

  @Get('hourly-prices')
  @ApiOperation({ summary: 'Get hourly prices for the last 24 hours' })
  @ApiResponse({ status: 200, description: 'Returns hourly prices for the last 24 hours' })
  async getHourlyPrices() {
    return await this.priceTrackerService.getHourlyPrices();
  }

  @Post('price-alert')
  @ApiOperation({ summary: 'Set a price alert' })
  @ApiResponse({ status: 201, description: 'Price alert created' })
  async createPriceAlert(@Body() createPriceAlertDto: CreatePriceAlertDto) {
    return await this.alertService.createPriceAlert(
      createPriceAlertDto.token,
      createPriceAlertDto.targetPrice,
      createPriceAlertDto.email,
    );
  }

  @Post('test-email')
  @ApiOperation({ summary: 'Send a test email to verify email functionality' })
  @ApiResponse({ status: 200, description: 'Test email sent' })
  async sendTestEmail(@Body('email') email: string) {
    await this.emailService.sendTestEmail(email);
    return { message: 'Test email sent' };
  }
}