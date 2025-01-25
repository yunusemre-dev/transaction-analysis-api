import { Controller, Post, Body } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import {
  MerchantAnalysisResponse,
  TransactionsDto,
  PatternAnalysisResponse,
  MerchantAnalysisRequestDto,
} from './dto/analysis.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('transactions')
@Controller('api/analyze')
export class AnalysisController {
  constructor(private readonly analysisService: AnalysisService) {}

  @Post('merchant')
  @ApiOperation({
    summary: 'Analyze a single merchant transaction',
    description:
      'Normalizes merchant name and provides additional merchant information',
  })
  @ApiResponse({
    status: 201,
    description: 'Merchant successfully analyzed',
    type: MerchantAnalysisResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid transaction data',
  })
  analyzeMerchant(
    @Body() data: MerchantAnalysisRequestDto,
  ): Promise<MerchantAnalysisResponse> {
    return this.analysisService.analyzeMerchant(data.transaction);
  }

  @Post('patterns')
  @ApiOperation({
    summary: 'Analyze patterns in multiple transactions',
    description: 'Detects recurring patterns and trends in transaction data',
  })
  @ApiResponse({
    status: 201,
    description: 'Patterns successfully analyzed',
    type: PatternAnalysisResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid transactions data',
  })
  analyzePatterns(
    @Body() data: TransactionsDto,
  ): Promise<PatternAnalysisResponse> {
    return this.analysisService.analyzePatterns(data.transactions);
  }
}
