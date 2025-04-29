import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '../config/config.service';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: this.configService.emailService,
      auth: {
        user: this.configService.emailUser,
        pass: this.configService.emailPassword,
      },
    });
  }

  async sendPriceAlertEmail(
    recipient: string,
    token: string,
    currentPrice: number,
    previousPrice: number,
    percentageIncrease: number,
  ): Promise<void> {
    const tokenName = token === 'ethereum' ? 'ETH' : 'MATIC';
    
    try {
      const mailOptions = {
        from: this.configService.emailFrom,
        to: recipient,
        subject: `Price Alert: ${tokenName} increased by ${percentageIncrease.toFixed(2)}%`,
        html: `
          <h2>Price Alert for ${tokenName}</h2>
          <p>The price of ${tokenName} has increased by ${percentageIncrease.toFixed(2)}%.</p>
          <ul>
            <li><strong>Chain:</strong> ${tokenName}</li>
            <li><strong>Current Price:</strong> $${currentPrice.toFixed(2)}</li>
            <li><strong>Previous Price (1 hour ago):</strong> $${previousPrice.toFixed(2)}</li>
            <li><strong>Percentage Increase:</strong> ${percentageIncrease.toFixed(2)}%</li>
          </ul>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Price alert email sent to ${recipient} for ${tokenName}`);
    } catch (error) {
      this.logger.error(`Failed to send price alert email: ${error.message}`);
    }
  }

  async sendTargetPriceAlertEmail(
    recipient: string,
    token: string,
    currentPrice: number,
    targetPrice: number,
  ): Promise<void> {
    const tokenName = token === 'ethereum' ? 'ETH' : 'MATIC';
    
    try {
      const mailOptions = {
        from: this.configService.emailFrom,
        to: recipient,
        subject: `Target Price Alert: ${tokenName} has reached your target price`,
        html: `
          <h2>Target Price Alert for ${tokenName}</h2>
          <p>The price of ${tokenName} has reached or exceeded your target price.</p>
          <ul>
            <li><strong>Chain:</strong> ${tokenName}</li>
            <li><strong>Current Price:</strong> $${currentPrice.toFixed(2)}</li>
            <li><strong>Target Price:</strong> $${targetPrice.toFixed(2)}</li>
          </ul>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Target price alert email sent to ${recipient} for ${tokenName}`);
    } catch (error) {
      this.logger.error(`Failed to send target price alert email: ${error.message}`);
    }
  }

  async sendTestEmail(recipient: string): Promise<void> {
    try {
      const mailOptions = {
        from: this.configService.emailFrom,
        to: recipient,
        subject: 'Crypto Price Tracker: Test Email',
        html: `
          <h2>Test Email</h2>
          <p>This is a test email from the Crypto Price Tracker application.</p>
          <p>If you received this email, the email service is working correctly.</p>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Test email sent to ${recipient}`);
    } catch (error) {
      this.logger.error(`Failed to send test email: ${error.message}`);
    }
  }
}