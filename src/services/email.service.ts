import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter;

  constructor() {
    // Initialize nodemailer transporter
    // For production, you should use environment variables for these credentials
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'your-email@gmail.com', // Replace with your email or use environment variables
        pass: 'your-app-password', // Replace with your app password or use environment variables
      },
    });
  }

  /**
   * Send a price alert email
   * @param recipient Email recipient
   * @param token Cryptocurrency token (ETH/MATIC)
   * @param currentPrice Current price 
   * @param previousPrice Previous price (1 hour ago)
   * @param percentageIncrease Percentage increase
   */
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
        from: 'your-email@gmail.com', // Replace with your email
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

  /**
   * Send a target price reached alert email
   * @param recipient Email recipient
   * @param token Cryptocurrency token
   * @param currentPrice Current price
   * @param targetPrice Target price that was reached/exceeded
   */
  async sendTargetPriceAlertEmail(
    recipient: string,
    token: string,
    currentPrice: number,
    targetPrice: number,
  ): Promise<void> {
    const tokenName = token === 'ethereum' ? 'ETH' : 'MATIC';
    
    try {
      const mailOptions = {
        from: 'your-email@gmail.com', // Replace with your email
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

  /**
   * Send a test email to verify the email service is working
   * @param recipient Email recipient
   */
  async sendTestEmail(recipient: string): Promise<void> {
    try {
      const mailOptions = {
        from: 'your-email@gmail.com', // Replace with your email
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