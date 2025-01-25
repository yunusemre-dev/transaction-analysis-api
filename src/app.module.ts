import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AnalysisModule } from './modules/analysis/analysis.module';
import { UploadModule } from './modules/upload/upload.module';
import { openaiConfig, appConfig } from './common/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [openaiConfig, appConfig],
      isGlobal: true,
    }),
    AnalysisModule,
    UploadModule,
  ],
})
export class AppModule {}
