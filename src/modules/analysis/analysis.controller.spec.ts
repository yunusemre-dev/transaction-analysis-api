import { Test, TestingModule } from '@nestjs/testing';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { TransactionDto } from './dto/analysis.dto';

describe('AnalysisController', () => {
  let controller: AnalysisController;
  let service: jest.Mocked<AnalysisService>;

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
    service = {
      analyzeMerchant: jest.fn(),
      analyzePatterns: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnalysisController],
      providers: [
        {
          provide: AnalysisService,
          useValue: service,
        },
      ],
    }).compile();

    controller = module.get<AnalysisController>(AnalysisController);
  });

  describe('analyzeMerchant', () => {
    it('should analyze a single merchant transaction', async () => {
      const mockResponse = { normalized: mockNormalizedMerchant };
      service.analyzeMerchant.mockResolvedValue(mockResponse);

      const result = await controller.analyzeMerchant({
        transaction: mockTransaction,
      });

      expect(result).toEqual(mockResponse);
      expect(service.analyzeMerchant).toHaveBeenCalledWith(mockTransaction);
    });
  });

  describe('analyzePatterns', () => {
    it('should analyze patterns in multiple transactions', async () => {
      const mockResponse = { patterns: [mockPattern] };
      service.analyzePatterns.mockResolvedValue(mockResponse);

      const result = await controller.analyzePatterns({
        transactions: [mockTransaction],
      });

      expect(result).toEqual(mockResponse);
      expect(service.analyzePatterns).toHaveBeenCalledWith([mockTransaction]);
    });
  });
}); 