import { Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsDateString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { MerchantAnalysis } from '../schemas/merchant.schema';
import { Pattern } from '../schemas/pattern.schema';

export class TransactionDto {
  @ApiProperty({
    description: 'Original merchant description from the transaction',
    example: 'AMAZON.COM*KB8LL',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Transaction amount',
    example: 29.99,
    type: Number,
  })
  @IsNumber()
  amount: number;

  @ApiProperty({
    description: 'Transaction date in ISO format',
    example: '2024-01-25',
    type: String,
  })
  @IsDateString()
  date: string;
}

export class MerchantAnalysisRequestDto {
  @ApiProperty({
    description: 'Transaction to analyze',
    type: TransactionDto,
  })
  @ValidateNested()
  @Type(() => TransactionDto)
  transaction: TransactionDto;
}

export class TransactionsDto {
  @ApiProperty({
    description: 'List of transactions to analyze',
    type: [TransactionDto],
    example: [
      {
        description: 'AMAZON.COM*KB8LL',
        amount: 29.99,
        date: '2024-01-25',
      },
      {
        description: 'NETFLIX.COM',
        amount: 14.99,
        date: '2024-01-24',
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => TransactionDto)
  transactions: TransactionDto[];
}

export class NormalizedMerchantResponse implements MerchantAnalysis {
  @ApiProperty({
    description: 'Normalized merchant name',
    example: 'Amazon',
  })
  merchant: string;

  @ApiProperty({
    description: 'Primary category of the merchant',
    example: 'Shopping',
  })
  category: string;

  @ApiProperty({
    description: 'Sub-category of the merchant',
    example: 'Online Retail',
  })
  sub_category: string;

  @ApiProperty({
    description: 'Confidence score of the normalization',
    minimum: 0,
    maximum: 1,
    example: 0.95,
  })
  confidence: number;

  @ApiProperty({
    description: 'Whether the transaction is a subscription',
    example: false,
  })
  is_subscription: boolean;

  @ApiProperty({
    description: 'Additional flags for the merchant',
    type: [String],
    example: ['online_purchase'],
  })
  flags: string[];
}

export class MerchantAnalysisResponse {
  @ApiProperty({
    description: 'Normalized merchant information',
    type: NormalizedMerchantResponse,
  })
  @ValidateNested()
  @Type(() => NormalizedMerchantResponse)
  normalized: NormalizedMerchantResponse;
}

export class PatternResponse implements Pattern {
  @ApiProperty({
    description: 'Type of the detected pattern',
    example: 'recurring',
  })
  type: string;

  @ApiProperty({
    description: 'Merchant name associated with the pattern',
    example: 'Netflix',
  })
  merchant: string;

  @ApiProperty({
    description: 'Amount associated with the pattern',
    oneOf: [
      { type: 'number', example: 14.99 },
      { type: 'string', example: '10-15' },
    ],
  })
  amount: number | string;

  @ApiProperty({
    description: 'Frequency of the pattern',
    example: 'monthly',
  })
  frequency: string;

  @ApiProperty({
    description: 'Confidence score of the pattern detection',
    minimum: 0,
    maximum: 1,
    example: 0.85,
  })
  confidence: number;

  @ApiProperty({
    description: 'Expected date of next occurrence',
    example: '2024-02-01T00:00:00Z',
    required: false,
    nullable: true,
  })
  next_expected?: string;

  @ApiProperty({
    description: 'Additional notes about the pattern',
    example: 'Regular monthly subscription',
    required: false,
    nullable: true,
  })
  notes?: string;
}

export class PatternAnalysisResponse {
  @ApiProperty({
    description: 'List of detected transaction patterns',
    type: [PatternResponse],
    example: [
      {
        type: 'recurring',
        merchant: 'Netflix',
        amount: 14.99,
        frequency: 'monthly',
        confidence: 0.85,
        next_expected: '2024-02-01T00:00:00Z',
        notes: 'Regular monthly subscription',
      },
      {
        type: 'variable',
        merchant: 'Amazon',
        amount: '20-50',
        frequency: '2-3 times per month',
        confidence: 0.75,
        notes: 'Regular shopping pattern with variable amounts',
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => PatternResponse)
  patterns: PatternResponse[];
}
