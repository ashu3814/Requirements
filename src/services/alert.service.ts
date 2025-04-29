import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, MoreThanOrEqual } from 'typeorm';
import { Price } from '../entities/price.entity';
import { PriceAlert } from '../entities/price-alert.entity';
import { EmailService } from './email.service';

@Injectable()
export class AlertService {
  private readonly logger = new Logger(AlertService.name);
  private readonly DEFAULT_RECIPIENT = 'prakash@rainfall.one';
  private readonly PRICE_INCREASE_THRESHOLD = 3; // 3% increase threshold

  constructor(
    @InjectRepository(Price)
    private priceRepository: Repository<Price>,
    @InjectRepository(PriceAlert)
    private priceAlertRepository: Repository<PriceAlert>,
    private emailService: EmailService,
  ) {}

  /**
   * Check for significant price increases (>3% in 1 hour) and send alerts
   */
  async checkPriceIncreases(): Promise<void> {
    this.logger.log('Checking for significant price increases...');
    
    // Get tokens to check
    const tokens = ['ethereum', 'matic'];
    
    for (const token of tokens) {
      await this.checkTokenPriceIncrease(token);
    }
  }

  /**
   * Check price increase for a specific token
   * @param token Token to check (ethereum or matic)
   */
  private async checkTokenPriceIncrease(token: string): Promise<void> {
    try {
      // Get current price
      const currentPrice = await this.priceRepository.findOne({
        where: { token },
        order: { timestamp: 'DESC' },
      });
      
      if (!currentPrice) {
        this.logger.warn(`No current price found for ${token}`);
        return;
      }

      // Get price from 1 hour ago
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

      // Calculate percentage increase
      const percentageIncrease = ((currentPrice.price - previousPrice.price) / previousPrice.price) * 100;
      
      // If increase is above threshold, send alert
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

  /**
   * Check if any price alerts should be triggered
   */
  async checkPriceAlerts(): Promise<void> {
    this.logger.log('Checking for price alerts...');
    
    try {
      // Get all non-triggered alerts
      const alerts = await this.priceAlertRepository.find({
        where: { triggered: false },
      });
      
      if (alerts.length === 0) {
        return;
      }
      
      // Group alerts by token
      const alertsByToken = alerts.reduce((acc, alert) => {
        if (!acc[alert.token]) {
          acc[alert.token] = [];
        }
        acc[alert.token].push(alert);
        return acc;
      }, {});
      
      // Check each token's alerts
      for (const token of Object.keys(alertsByToken)) {
        // Get current price for this token
        const currentPrice = await this.priceRepository.findOne({
          where: { token },
          order: { timestamp: 'DESC' },
        });
        
        if (!currentPrice) {
          continue;
        }
        
        // Check each alert for this token
        for (const alert of alertsByToken[token]) {
          if (currentPrice.price >= alert.targetPrice) {
            // Send alert email
            await this.emailService.sendTargetPriceAlertEmail(
              alert.email,
              token,
              currentPrice.price,
              alert.targetPrice,
            );
            
            // Mark alert as triggered
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

  /**
   * Create a new price alert
   * @param token Token to alert on
   * @param targetPrice Price threshold to trigger alert
   * @param email Email to send alert to
   */
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

  /**
   * Get all active (non-triggered) alerts
   * @returns Array of price alerts
   */
  async getAllAlerts(): Promise<PriceAlert[]> {
    return await this.priceAlertRepository.find({
      where: { triggered: false },
      order: { createdAt: 'DESC' },
    });
  }
}