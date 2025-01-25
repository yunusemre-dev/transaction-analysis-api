import { Type } from 'class-transformer';
import {
  ValidateNested,
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NormalizedMerchant {
  @ApiProperty({ description: 'Normalized merchant name', example: 'Amazon' })
  @IsString()
  merchant: string;

  @ApiProperty({
    description: 'Primary category of the merchant',
    example: 'Shopping',
  })
  @IsString()
  category: string;

  @ApiProperty({
    description: 'Sub-category of the merchant',
    example: 'Online Retail',
  })
  @IsString()
  sub_category: string;

  @ApiProperty({
    description: 'Confidence score of the normalization',
    minimum: 0,
    maximum: 1,
    example: 0.95,
  })
  @IsNumber()
  confidence: number;

  @ApiProperty({
    description: 'Whether the transaction is a subscription',
    example: false,
  })
  @IsBoolean()
  is_subscription: boolean;

  @ApiProperty({
    description: 'Additional flags for the merchant',
    type: [String],
    example: ['online_purchase'],
  })
  @IsArray()
  @IsString({ each: true })
  flags: string[];
}

export class NormalizedTransaction {
  @ApiProperty({
    description: 'Original merchant description from the transaction',
    example: 'AMAZON.COM*KB8LL',
  })
  @IsString()
  original: string;

  @ApiProperty({ description: 'Normalized merchant information' })
  @ValidateNested()
  @Type(() => NormalizedMerchant)
  normalized: NormalizedMerchant;
}

export class Pattern {
  @ApiProperty({
    description: 'Type of the detected pattern',
    example: 'recurring',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Merchant name associated with the pattern',
    example: 'Netflix',
  })
  @IsString()
  merchant: string;

  @ApiProperty({
    description: 'Amount associated with the pattern',
    oneOf: [
      { type: 'number', example: 14.99 },
      { type: 'string', example: '10-15' },
    ],
  })
  amount: string | number;

  @ApiProperty({ description: 'Frequency of the pattern', example: 'monthly' })
  @IsString()
  frequency: string;

  @ApiProperty({
    description: 'Confidence score of the pattern detection',
    minimum: 0,
    maximum: 1,
    example: 0.85,
  })
  @IsNumber()
  confidence: number;

  @ApiPropertyOptional({
    description: 'Expected date of next occurrence',
    example: '2024-02-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  next_expected?: string;

  @ApiPropertyOptional({
    description: 'Additional notes about the pattern',
    example: 'Regular monthly subscription',
  })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class CSVAnalysisResponse {
  @ApiProperty({
    description: 'List of normalized transactions',
    type: [NormalizedTransaction],
    example: [
      {
        original: 'AMAZON.COM*KB8LL',
        normalized: {
          merchant: 'Amazon',
          category: 'Shopping',
          sub_category: 'Online Retail',
          confidence: 0.95,
          is_subscription: false,
          flags: ['online_purchase'],
        },
      },
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => NormalizedTransaction)
  normalized_transactions: NormalizedTransaction[];

  @ApiProperty({
    description: 'List of detected transaction patterns',
    type: [Pattern],
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
    ],
  })
  @ValidateNested({ each: true })
  @Type(() => Pattern)
  detected_patterns: Pattern[];
}
