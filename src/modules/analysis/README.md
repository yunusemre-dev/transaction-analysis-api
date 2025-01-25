# Analysis Module

The Analysis Module is responsible for processing and analyzing transaction data. It provides endpoints for merchant name normalization and pattern detection in transaction data.

## Features

- Merchant name normalization
- Transaction pattern detection
- CSV file analysis

## Endpoints

### 1. Analyze Merchant (`POST /api/analyze/merchant`)

Normalizes a single merchant transaction.

```json
{
  "transaction": {
    "date": "2024-01-01",
    "description": "AMAZON.COM",
    "amount": 29.99
  }
}
```

### 2. Analyze Patterns (`POST /api/analyze/patterns`)

Detects patterns in multiple transactions.

```json
{
  "transactions": [
    {
      "date": "2024-01-01",
      "description": "AMAZON.COM",
      "amount": 29.99
    }
  ]
}
```

## Architecture

- `analysis.controller.ts`: Handles HTTP requests for transaction analysis
- `analysis.service.ts`: Contains business logic for transaction analysis
- `dto/`: Data Transfer Objects for request/response validation
- `schemas/`: Zod schemas for data validation and response formatting

## Dependencies

- OpenAI Service: Used for merchant normalization and pattern detection
- CSV Parser: Used for processing CSV files
