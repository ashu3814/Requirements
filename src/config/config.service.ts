import { Injectable } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  constructor(private readonly configService: NestConfigService) {}

  // Database config (required)
  get dbType(): string {
    return this.getRequired<string>('DB_TYPE');
  }

  get dbHost(): string {
    return this.getRequired<string>('DB_HOST');
  }

  get dbPort(): number {
    return this.getRequired<number>('DB_PORT');
  }

  get dbUsername(): string {
    return this.getRequired<string>('DB_USERNAME');
  }

  get dbPassword(): string {
    return this.getRequired<string>('DB_PASSWORD');
  }

  get dbDatabase(): string {
    return this.getRequired<string>('DB_DATABASE');
  }

  // Email config (required)
  get emailService(): string {
    return this.getRequired<string>('EMAIL_SERVICE');
  }

  get emailUser(): string {
    return this.getRequired<string>('EMAIL_USER');
  }

  get emailPassword(): string {
    return this.getRequired<string>('EMAIL_PASSWORD');
  }

  get emailFrom(): string {
    return this.getRequired<string>('EMAIL_FROM');
  }

  // API config (required)
  get coingeckoApiUrl(): string {
    return this.getRequired<string>('COINGECKO_API_URL');
  }

  // App config (with defaults)
  get port(): number {
    return this.getOptional<number>('PORT', 3000);
  }

  get defaultRecipient(): string {
    return this.getOptional<string>('DEFAULT_RECIPIENT', 'prakash@rainfall.one');
  }

  get priceIncreaseThreshold(): number {
    return this.getOptional<number>('PRICE_INCREASE_THRESHOLD', 3);
  }

  // Private helper methods
  private getRequired<T>(key: string): T {
    const value = this.configService.get<T>(key);
    if (value === undefined || value === null) {
      throw new Error(`Missing required configuration value for ${key}`);
    }
    return value;
  }

  private getOptional<T>(key: string, defaultValue: T): T {
    const value = this.configService.get<T>(key);
    return value !== undefined ? value : defaultValue;
  }
}