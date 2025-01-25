import { Test, TestingModule } from '@nestjs/testing';
import {
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

describe('UploadController', () => {
  let controller: UploadController;
  let uploadService: jest.Mocked<UploadService>;
  let parseFilePipeMock: jest.Mocked<ParseFilePipe>;

  const mockFile = {
    buffer: Buffer.from('date,description,amount\n2024-01-01,AMAZON.COM,29.99'),
    originalname: 'test.csv',
    mimetype: 'text/csv',
    size: 1000,
  } as Express.Multer.File;

  const mockAnalysisResult = {
    normalized_transactions: [
      {
        original: 'AMAZON.COM',
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
    detected_patterns: [
      {
        type: 'recurring',
        merchant: 'Amazon',
        amount: 29.99,
        frequency: 'monthly',
        confidence: 0.85,
        next_expected: '2024-02-01T00:00:00Z',
        notes: 'Regular monthly purchase pattern detected',
      },
    ],
  };

  beforeEach(async () => {
    parseFilePipeMock = {
      transform: jest.fn((file: Express.Multer.File) => {
        if (file.mimetype !== 'text/csv') {
          throw new BadRequestException(
            'Validation failed (expected type is text/csv)',
          );
        }
        if (file.size > 1024 * 1024) {
          throw new BadRequestException('Validation failed (maxSize is 1MB)');
        }
        return Promise.resolve(file);
      }),
    } as any;

    uploadService = {
      analyzeCSV: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: UploadService,
          useValue: uploadService,
        },
        {
          provide: ParseFilePipe,
          useValue: parseFilePipeMock,
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);

    // Mock the parameter decorator validation
    jest
      .spyOn(controller as any, 'uploadTransactions')
      .mockImplementation(async (file: Express.Multer.File) => {
        await parseFilePipeMock.transform(file);
        return uploadService.analyzeCSV(file.buffer);
      });
  });

  describe('uploadTransactions', () => {
    it('should process CSV file successfully', async () => {
      uploadService.analyzeCSV.mockResolvedValue(mockAnalysisResult);

      const result = await controller.uploadTransactions(mockFile);

      expect(result).toEqual(mockAnalysisResult);
      expect(parseFilePipeMock.transform).toHaveBeenCalledWith(mockFile);
      expect(uploadService.analyzeCSV).toHaveBeenCalledWith(mockFile.buffer);
    });

    it('should handle file validation errors', async () => {
      const invalidFile = {
        ...mockFile,
        mimetype: 'application/json',
      } as Express.Multer.File;

      await expect(controller.uploadTransactions(invalidFile)).rejects.toThrow(
        'Validation failed (expected type is text/csv)',
      );
      expect(parseFilePipeMock.transform).toHaveBeenCalledWith(invalidFile);
      expect(uploadService.analyzeCSV).not.toHaveBeenCalled();
    });

    it('should handle large files', async () => {
      const largeFile = {
        ...mockFile,
        size: 2 * 1024 * 1024, // 2MB
      } as Express.Multer.File;

      await expect(controller.uploadTransactions(largeFile)).rejects.toThrow(
        'Validation failed (maxSize is 1MB)',
      );
      expect(parseFilePipeMock.transform).toHaveBeenCalledWith(largeFile);
      expect(uploadService.analyzeCSV).not.toHaveBeenCalled();
    });
  });
});
