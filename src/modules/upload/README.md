# Upload Module

The Upload Module handles file uploads for transaction analysis. It provides an endpoint for uploading CSV files containing transaction data.

## Features

- CSV file upload and validation
- Automatic transaction analysis
- File size and type validation

## Endpoint

### Upload Transactions (`POST /api/upload`)

Accepts CSV files with transaction data.

```bash
curl -X POST http://localhost:3000/api/upload \
  -H "Content-Type: multipart/form-data" \
  -F "file=@sample-dataset.csv"
```

#### CSV Format

```csv
date,description,amount
2024-01-01,AMAZON.COM,29.99
2024-01-02,NETFLIX.COM,14.99
```

#### Validation Rules

- Maximum file size: 1MB
- File type: text/csv
- Required columns: date, description, amount

## Architecture

- `upload.controller.ts`: Handles file upload requests
- `dto/`: Data Transfer Objects for response validation

## Dependencies

- Analysis Module: Used for processing uploaded transactions
- NestJS File Interceptor: Used for handling file uploads
