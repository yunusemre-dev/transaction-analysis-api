import { Injectable, InternalServerErrorException } from '@nestjs/common';
import {
  TransactionDto,
  MerchantAnalysisResponse,
  PatternAnalysisResponse,
  NormalizedMerchantResponse,
} from './dto/analysis.dto';
import { OpenAIService } from '../../shared/services/openai.service';

@Injectable()
export class AnalysisService {
  constructor(private readonly openaiService: OpenAIService) {}

  async analyzeMerchant(
    transaction: TransactionDto,
  ): Promise<MerchantAnalysisResponse> {
    try {
      const normalized = (await this.openaiService.normalizeMerchant(
        transaction,
      )) as NormalizedMerchantResponse;
      return { normalized };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to analyze merchant information',
        {
          cause: error instanceof Error ? error.message : 'Unknown error',
        },
      );
    }
  }

  async analyzePatterns(
    transactions: TransactionDto[],
  ): Promise<PatternAnalysisResponse> {
    try {
      return (await this.openaiService.detectPatterns(
        transactions,
      )) as PatternAnalysisResponse;
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to analyze transaction patterns',
        {
          cause: error instanceof Error ? error.message : 'Unknown error',
        },
      );
    }
  }
}
