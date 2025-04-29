import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Price } from '../entities/price.entity';
import { PriceAlert } from '../entities/price-alert.entity';
import { EmailService } from './email.service';
import { ConfigService } from '../config/config.service';

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);
  private readonly DEFAULT_RECIPIENT: string;
  private readonly PRICE_INCREASE_THRESHOLD: number;

  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    @InjectRepository(PriceAlert)
    private priceAlertRepository: Repository<PriceAlert>,
    private emailService: EmailService,
    private configService: ConfigService,
  ) {
    this.DEFAULT_RECIPIENT = this.configService.defaultRecipient;
    this.PRICE_INCREASE_THRESHOLD = this.configService.priceIncreaseThreshold;
  }

  async checkPriceIncreases(): Promise<void> {
    this.logger.log('Checking for significant price increases...');
    
    const tokens = ['ethereum', 'matic'];
    
    for (const token of tokens) {
      await this.checkTokenPriceIncrease(token);
    }
  }

  private async checkTokenPriceIncrease(token: string): Promise<void> {
    try {
      const currentPrice = await this.priceRepository.findOne({
        where: { token },
        order: { timestamp: 'DESC' },
      });
      
      if (!currentPrice) {
        this.logger.warn(`No current price found for ${token}`);
        return;
      }

      const oneHourAgo = new Date();
      oneHourAgo.setHours(oneHourAgo.getHours() - 1);
      
      const previousPrice = await this.priceRepository.findOne({
        where: { 
          token,
          timestamp: LessThanOrEqual(oneHourAgo)
        },
        order: { timestamp: 'DESC' },
      });
      
      if (!previousPrice) {
        this.logger.warn(`No previous price found for ${token} from 1 hour ago`);
        return;
      }

      const percentageIncrease = ((currentPrice.price - previousPrice.price) / previousPrice.price) * 100;
      
      if (percentageIncrease > this.PRICE_INCREASE_THRESHOLD) {
        this.logger.log(`${token} price increased by ${percentageIncrease.toFixed(2)}% - sending alert email`);
        
        await this.emailService.sendPriceAlertEmail(
          this.DEFAULT_RECIPIENT,
          token,
          currentPrice.price,
          previousPrice.price,
          percentageIncrease,
        );
      } else {
        this.logger.log(`${token} price change (${percentageIncrease.toFixed(2)}%) is below alert threshold`);
      }
    } catch (error) {
      this.logger.error(`Error checking price increase for ${token}: ${error.message}`);
    }
  }

  async checkPriceAlerts(): Promise<void> {
    this.logger.log('Checking for price alerts...');
    
    try {
      const alerts = await this.priceAlertRepository.find({
        where: { triggered: false },
      });
      
      if (alerts.length === 0) {
        return;
      }
      
      const alertsByToken = alerts.reduce((acc, alert) => {
        if (!acc[alert.token]) {
          acc[alert.token] = [];
        }
        acc[alert.token].push(alert);
        return acc;
      }, {});
      
      for (const token of Object.keys(alertsByToken)) {
        const currentPrice = await this.priceRepository.findOne({
          where: { token },
          order: { timestamp: 'DESC' },
        });
        
        if (!currentPrice) {
          continue;
        }
        
        for (const alert of alertsByToken[token]) {
          if (currentPrice.price >= alert.targetPrice) {
            await this.emailService.sendTargetPriceAlertEmail(
              alert.email,
              token,
              currentPrice.price,
              alert.targetPrice,
            );
            
            alert.triggered = true;
            await this.priceAlertRepository.save(alert);
            
            this.logger.log(`Triggered price alert for ${token}: target $${alert.targetPrice}, current $${currentPrice.price}`);
          }
        }
      }
    } catch (error) {
      this.logger.error(`Error checking price alerts: ${error.message}`);
    }
  }

  async createPriceAlert(token: string, targetPrice: number, email: string): Promise<PriceAlert> {
    this.logger.log(`Creating price alert for ${token} at $${targetPrice} for ${email}`);
    
    const alert = this.priceAlertRepository.create({
      token,
      targetPrice,
      email,
      triggered: false,
    });
    
    return await this.priceAlertRepository.save(alert);
  }

  async getAllAlerts(): Promise<PriceAlert[]> {
    return await this.priceAlertRepository.find({
      where: { triggered: false },
      order: { createdAt: 'DESC' },
    });
  }
}