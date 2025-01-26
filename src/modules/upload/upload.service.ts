import { Injectable, BadRequestException } from '@nestjs/common';
import { parse } from 'csv-parse/sync';
import { TransactionDto } from '../analysis/dto/analysis.dto';
import { AnalysisService } from '../analysis/analysis.service';
import { CSVAnalysisResponse } from './dto/upload.dto';

@Injectable()
export class UploadService {
  constructor(private readonly analysisService: AnalysisService) {}

  async analyzeCSV(fileBuffer: Buffer): Promise<CSVAnalysisResponse> {
    try {
      const records = parse(fileBuffer, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
      });

      const transactions: TransactionDto[] = records.map((record: any) => {
        if (!record.date || !record.description || !record.amount) {
          throw new BadRequestException(
            'CSV must contain date, description, and amount columns',
          );
        }

        const amount = parseFloat(record.amount);
        if (isNaN(amount)) {
          throw new BadRequestException('Invalid amount in CSV');
        }

        return {
          date: record.date,
          description: record.description,
          amount,
        };
      });

      let normalizedTransactions = await Promise.all(
        transactions.map(async (transaction) => {
          const response =
            await this.analysisService.analyzeMerchant(transaction);
          return {
            original: transaction.description,
            normalized: response.normalized,
          };
        }),
      );
      normalizedTransactions = normalizedTransactions.filter(
        (transaction, index, self) =>
          index ===
          self.findIndex(
            (t) =>
              t.normalized.merchant.toLowerCase() ===
              transaction.normalized.merchant.toLowerCase(),
          ),
      );

      const patterns = await this.analysisService.analyzePatterns(transactions);

      const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
      const averageAmount = totalAmount / transactions.length;

      return {
        normalized_transactions: normalizedTransactions,
        detected_patterns: patterns.patterns,
        total_amount: Number(totalAmount.toFixed(2)),
        average_amount: Number(averageAmount.toFixed(2)),
        total_transactions: transactions.length,
        merchant_count: normalizedTransactions.length,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        'Failed to process CSV file: ' +
          (error instanceof Error ? error.message : 'Unknown error'),
      );
    }
  }
}
