import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException } from '@nestjs/common';
import { UploadService } from './upload.service';
import { AnalysisService } from '../analysis/analysis.service';

describe('UploadService', () => {
  let service: UploadService;
  let analysisService: jest.Mocked<AnalysisService>;

  const mockNormalizedMerchant = {
    normalized: {
      merchant: 'Amazon',
      category: 'Shopping',
      sub_category: 'Online Retail',
      confidence: 0.95,
      is_subscription: false,
      flags: ['online_purchase'],
    },
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
    analysisService = {
      analyzeMerchant: jest.fn(),
      analyzePatterns: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: AnalysisService,
          useValue: analysisService,
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
  });

  describe('analyzeCSV', () => {
    const validCSV = 'date,description,amount\n2024-01-01,AMAZON.COM,29.99';
    const invalidCSV = 'invalid,csv\ndata,here';

    beforeEach(() => {
      analysisService.analyzeMerchant.mockResolvedValue(mockNormalizedMerchant);
      analysisService.analyzePatterns.mockResolvedValue({
        patterns: [mockPattern],
      });
    });

    it('should process valid CSV data successfully', async () => {
      const result = await service.analyzeCSV(Buffer.from(validCSV));

      expect(result.normalized_transactions).toHaveLength(1);
      expect(result.detected_patterns).toHaveLength(1);
      expect(analysisService.analyzeMerchant).toHaveBeenCalled();
      expect(analysisService.analyzePatterns).toHaveBeenCalled();
    });

    it('should throw BadRequestException for invalid CSV format', async () => {
      await expect(service.analyzeCSV(Buffer.from(invalidCSV))).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw BadRequestException for invalid amount', async () => {
      const csvWithInvalidAmount =
        'date,description,amount\n2024-01-01,AMAZON.COM,invalid';

      await expect(
        service.analyzeCSV(Buffer.from(csvWithInvalidAmount)),
      ).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException for missing required columns', async () => {
      const csvWithMissingColumns = 'description,amount\nAMAZON.COM,29.99';

      await expect(
        service.analyzeCSV(Buffer.from(csvWithMissingColumns)),
      ).rejects.toThrow(BadRequestException);
    });
  });
});
