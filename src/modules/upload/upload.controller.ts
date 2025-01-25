import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { CSVAnalysisResponse } from './dto/upload.dto';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';

@ApiTags('transactions')
@Controller('api')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  @Post('upload')
  @ApiOperation({
    summary: 'Upload and analyze CSV transactions',
    description:
      'Upload a CSV file containing transactions to analyze merchants and detect patterns',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'CSV file containing transactions',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'CSV file successfully analyzed',
    type: CSVAnalysisResponse,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid file format or content',
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadTransactions(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 1024 * 1024 }), // 1MB
          new FileTypeValidator({ fileType: 'text/csv' }),
        ],
      }),
    )
    file: Express.Multer.File,
  ): Promise<CSVAnalysisResponse> {
    return this.uploadService.analyzeCSV(file.buffer);
  }
}
