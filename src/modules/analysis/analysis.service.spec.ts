import { Test, TestingModule } from '@nestjs/testing';
import { InternalServerErrorException } from '@nestjs/common';
import { AnalysisService } from './analysis.service';
import { OpenAIService } from '../../shared/services/openai.service';
import { TransactionDto } from './dto/analysis.dto';

describe('AnalysisService', () => {
  let service: AnalysisService;
  let openaiService: jest.Mocked<OpenAIService>;

  const mockTransaction: TransactionDto = {
    date: '2024-01-01',
    description: 'AMAZON.COM',
    amount: 29.99,
  };

  const mockNormalizedMerchant = {
    merchant: 'Amazon',
    category: 'Shopping',
    sub_category: 'Online Retail',
    confidence: 0.95,
    is_subscription: false,
    flags: ['online_purchase'],
  };

  const mockPattern = {
    type: 'recurring',
    merchant: 'Amazon',
    amount: 29.99,
    frequency: 'monthly',
    confidence: 0.85,
    next_expected: '2024-02-01T00:00:00Z',
    notes: 'Regular monthly purchase pattern detected',
  };

  beforeEach(async () => {
    openaiService = {
      normalizeMerchant: jest.fn(),
      detectPatterns: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalysisService,
        {
          provide: OpenAIService,
          useValue: openaiService,
        },
      ],
    }).compile();

    service = module.get<AnalysisService>(AnalysisService);
  });

  describe('analyzeMerchant', () => {
    it('should normalize a merchant successfully', async () => {
      openaiService.normalizeMerchant.mockResolvedValue(mockNormalizedMerchant);

      const result = await service.analyzeMerchant(mockTransaction);

      expect(result.normalized).toEqual(mockNormalizedMerchant);
      expect(openaiService.normalizeMerchant).toHaveBeenCalledWith(
        mockTransaction,
      );
    });

    it('should handle OpenAI service errors', async () => {
      openaiService.normalizeMerchant.mockRejectedValue(
        new Error('OpenAI API error'),
      );

      try {
        await service.analyzeMerchant(mockTransaction);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to analyze merchant information');
        expect(error.cause).toBe('OpenAI API error');
      }
    });
  });

  describe('analyzePatterns', () => {
    it('should detect patterns successfully', async () => {
      const mockPatterns = { patterns: [mockPattern] };
      openaiService.detectPatterns.mockResolvedValue(mockPatterns);

      const result = await service.analyzePatterns([mockTransaction]);

      expect(result).toEqual(mockPatterns);
      expect(openaiService.detectPatterns).toHaveBeenCalledWith([
        mockTransaction,
      ]);
    });

    it('should handle OpenAI service errors', async () => {
      openaiService.detectPatterns.mockRejectedValue(
        new Error('OpenAI API error'),
      );

      try {
        await service.analyzePatterns([mockTransaction]);
        fail('Expected an error to be thrown');
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('Failed to analyze transaction patterns');
        expect(error.cause).toBe('OpenAI API error');
      }
    });
  });
});
