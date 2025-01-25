# Build stage
FROM node:22.8.0 AS builder

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies
RUN pnpm install --frozen-lockfile

# Copy source code
COPY . .

# Build the application (for production)
RUN pnpm build

# Development stage - can be used for development with mounted source code
FROM builder AS development

# Expose debug port
EXPOSE 9229

# Start development server with debugging enabled
CMD ["pnpm", "start:dev"]

# Production stage
FROM node:22.8.0-slim AS production

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Copy built application from builder stage
COPY --from=builder /app/dist ./dist

# Set environment variables
ENV NODE_ENV=production
ENV PORT=4600

# Expose port
EXPOSE 4600

# Start the application
CMD ["node", "dist/main"] 
