# Financial Transaction Analysis System

A NestJS-based API service that analyzes financial transactions using AI to normalize merchant names and detect spending patterns.

## Features

### Transaction Analysis

- Merchant name normalization (e.g., "AMZN\*KB8LL" → "Amazon")
- Merchant categorization with confidence scores
- Subscription detection
- Transaction flags (e.g., online_purchase, marketplace)

### Pattern Detection

- Recurring payment identification
- Variable spending pattern analysis
- Frequency detection (daily, weekly, monthly)
- Next payment prediction

### CSV Processing

- Bulk transaction analysis
- File validation (size, type, format)
- Automatic data normalization
- Pattern detection across multiple transactions

## Tech Stack

- **Framework**: NestJS (Node.js)
- **Language**: TypeScript
- **Validation**:
  - class-validator
  - class-transformer
  - Zod schemas
- **Documentation**: OpenAPI/Swagger
- **AI Integration**: OpenAI API
- **CSV Processing**: csv-parse
- **Testing**: Jest

## Prerequisites

- Node.js (v18 or later)
- pnpm
- OpenAI API key

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd financial-transaction-analysis
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and add your OpenAI API key:
   ```
   OPENAI_API_KEY=your-api-key
   OPENAI_MODEL=gpt-4
   PORT=3000
   ```

## Running the Application

### Development

```bash
pnpm start:dev
```

### Production

```bash
pnpm build
pnpm start:prod
```

### Tests

```bash
pnpm test        # Unit tests
pnpm test:cov    # Coverage report
```

## API Documentation

The API documentation is available at `/api/docs` when the application is running. It provides interactive documentation powered by Swagger.

### Main Endpoints

#### 1. Analyze Single Transaction

```http
POST /api/analyze/merchant
Content-Type: application/json

{
  "transaction": {
    "date": "2024-01-01",
    "description": "AMAZON.COM*KB8LL",
    "amount": 29.99
  }
}
```

#### 2. Analyze Transaction Patterns

```http
POST /api/analyze/patterns
Content-Type: application/json

{
  "transactions": [
    {
      "date": "2024-01-01",
      "description": "NETFLIX.COM",
      "amount": 14.99
    }
  ]
}
```

#### 3. Upload CSV for Analysis

```http
POST /api/upload
Content-Type: multipart/form-data

file=@sample-dataset.csv
```

CSV Format:

```csv
date,description,amount
2024-01-01,AMAZON.COM,29.99
2024-01-02,NETFLIX.COM,14.99
```

## Error Handling

The application implements comprehensive error handling:

- **400 Bad Request**: Invalid input data or CSV format
- **413 Payload Too Large**: File size exceeds limit
- **415 Unsupported Media Type**: Invalid file type
- **500 Internal Server Error**: OpenAI API or processing errors