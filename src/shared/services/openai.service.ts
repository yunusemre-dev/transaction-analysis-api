import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { MerchantAnalysisSchema } from '../../modules/analysis/schemas/merchant.schema';
import { PatternAnalysisSchema } from '../../modules/analysis/schemas/pattern.schema';
import { TransactionDto } from '../../modules/analysis/dto/analysis.dto';

@Injectable()
export class OpenAIService {
  private openai: OpenAI;

  constructor(private configService: ConfigService) {
    this.openai = new OpenAI({
      apiKey: this.configService.get<string>('openai.apiKey'),
    });
  }

  async normalizeMerchant(transaction: TransactionDto) {
    try {
      const completion = await this.openai.beta.chat.completions.parse({
        model: this.configService.get<string>('openai.model'),
        messages: [
          {
            role: 'system',
            content:
              'You are a financial transaction analyzer. Extract structured information from transaction data.',
          },
          {
            role: 'user',
            content: `Analyze this transaction and normalize the merchant information:
Transaction Description: ${transaction.description}
Amount: ${transaction.amount}
Date: ${transaction.date}

Please provide:
1. Normalized merchant name (e.g., Amazon, Apple)
2. Category
3. Sub-category
4. Whether it's likely a subscription
5. Relevant flags (e.g., online_purchase, marketplace)`,
          },
        ],
        response_format: zodResponseFormat(
          MerchantAnalysisSchema,
          'merchant_analysis',
        ),
      });

      return completion.choices[0].message.parsed;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to analyze merchant information',
        error instanceof Error ? error.message : undefined,
      );
    }
  }

  async detectPatterns(transactions: TransactionDto[]) {
    try {
      const completion = await this.openai.beta.chat.completions.parse({
        model: this.configService.get<string>('openai.model'),
        messages: [
          {
            role: 'system',
            content:
              'You are a financial transaction pattern analyzer. Extract patterns from transaction data.',
          },
          {
            role: 'user',
            content: `Analyze these transactions for patterns:
${JSON.stringify(transactions, null, 2)}

Look for:
1. Payment types (e.g. subscription)
2. Normalized merchant name (e.g., Amazon, Apple, etc.)
3. Recurring amounts (charged amount, put ~ for variable amounts e.g. ~31.50)
4. Frequency of transactions (e.g., daily, weekly, monthly, yearly, 2-3 times a month)
5. Next expected transaction dates (YYYY-MM-DD) (if applicable)
6. Notes on the patterns (if applicable)`,
          },
        ],
        response_format: zodResponseFormat(
          PatternAnalysisSchema,
          'pattern_analysis',
        ),
      });

      return completion.choices[0].message.parsed;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to analyze transaction patterns',
        error instanceof Error ? error.message : undefined,
      );
    }
  }
}
