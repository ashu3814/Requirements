import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNumber, IsString, IsIn, Min } from 'class-validator';

export class CreatePriceAlertDto {
  @ApiProperty({
    description: 'Cryptocurrency token',
    enum: ['ethereum', 'matic'],
    example: 'ethereum',
  })
  @IsString()
  @IsIn(['ethereum', 'matic'])
  token: string;

  @ApiProperty({
    description: 'Target price to trigger alert',
    example: 2000,
  })
  @IsNumber()
  @Min(0)
  targetPrice: number;

  @ApiProperty({
    description: 'Email to send alert to',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;
}