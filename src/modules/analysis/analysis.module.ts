import { Module } from '@nestjs/common';
import { AnalysisController } from './analysis.controller';
import { AnalysisService } from './analysis.service';
import { OpenAIService } from '../../shared/services/openai.service';

@Module({
  controllers: [AnalysisController],
  providers: [AnalysisService, OpenAIService],
  exports: [AnalysisService],
})
export class AnalysisModule {}
