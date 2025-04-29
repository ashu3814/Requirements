import { Controller, Post, Body, Get, ValidationPipe } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AlertService } from '../services/alert.service';
import { CreatePriceAlertDto } from '../dto/create-price-alert.dto';

@ApiTags('alerts')
@Controller('alerts')
export class AlertController {
  constructor(private readonly alertService: AlertService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new price alert' })
  @ApiResponse({ status: 201, description: 'Price alert created successfully' })
  async createAlert(@Body(ValidationPipe) createPriceAlertDto: CreatePriceAlertDto) {
    return await this.alertService.createPriceAlert(
      createPriceAlertDto.token,
      createPriceAlertDto.targetPrice,
      createPriceAlertDto.email,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Get all active price alerts' })
  @ApiResponse({ status: 200, description: 'Returns all active price alerts' })
  async getAllAlerts() {
    return await this.alertService.getAllAlerts();
  }
}