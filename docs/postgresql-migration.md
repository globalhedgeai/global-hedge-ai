# PostgreSQL Migration Guide

## Overview

This guide covers migrating from SQLite (development) to PostgreSQL (production) for the Global Hedge AI platform.

## Prerequisites

- PostgreSQL 14+ installed
- Node.js 18+ with pnpm
- Access to production server
- Database backup strategy in place

## Environment Variables

### Development (.env.local)
```env
# SQLite for development
DATABASE_URL="file:./dev.db"
```

### Production (.env.production)
```env
# PostgreSQL for production
DATABASE_URL="postgresql://username:password@localhost:5432/global_hedge_ai?schema=public"

# PostgreSQL connection pool settings
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_POOL_IDLE_TIMEOUT=30000
DATABASE_POOL_CONNECTION_TIMEOUT=60000

# SSL settings for production
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

## Migration Steps

### 1. Update Prisma Schema

The schema is already PostgreSQL-compatible. Key considerations:

- `Decimal` types work with PostgreSQL's `DECIMAL` type
- `DateTime` maps to PostgreSQL's `TIMESTAMP`
- `String` maps to PostgreSQL's `VARCHAR` or `TEXT`
- `Boolean` maps to PostgreSQL's `BOOLEAN`
- `Int` maps to PostgreSQL's `INTEGER`

### 2. Install PostgreSQL Dependencies

```bash
# Install PostgreSQL client
pnpm add pg @types/pg

# Install connection pooling
pnpm add pg-pool
```

### 3. Update Prisma Client Configuration

Create `prisma/postgresql.prisma`:

```prisma
generator client {
  provider = "prisma-client-js"
  previewFeatures = ["postgresqlExtensions"]
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [pgcrypto]
}

// ... rest of schema remains the same
```

### 4. Database Connection Pool

Update `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 5. Migration Commands

```bash
# Generate Prisma client for PostgreSQL
npx prisma generate --schema=prisma/postgresql.prisma

# Create migration
npx prisma migrate dev --name init_postgresql --schema=prisma/postgresql.prisma

# Deploy to production
npx prisma migrate deploy --schema=prisma/postgresql.prisma
```

### 6. Data Migration Script

Create `scripts/migrate-to-postgresql.ts`:

```typescript
import { PrismaClient as SQLiteClient } from '@prisma/client';
import { PrismaClient as PostgreSQLClient } from '@prisma/client';

const sqliteClient = new SQLiteClient({
  datasources: {
    db: {
      url: 'file:./dev.db'
    }
  }
});

const postgresClient = new PostgreSQLClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL
    }
  }
});

async function migrateData() {
  console.log('Starting data migration...');

  try {
    // Migrate users
    const users = await sqliteClient.user.findMany();
    console.log(`Migrating ${users.length} users...`);
    await postgresClient.user.createMany({ data: users });

    // Migrate deposits
    const deposits = await sqliteClient.deposit.findMany();
    console.log(`Migrating ${deposits.length} deposits...`);
    await postgresClient.deposit.createMany({ data: deposits });

    // Migrate withdrawals
    const withdrawals = await sqliteClient.withdrawal.findMany();
    console.log(`Migrating ${withdrawals.length} withdrawals...`);
    await postgresClient.withdrawal.createMany({ data: withdrawals });

    // Migrate other tables...
    const dailyRewardClaims = await sqliteClient.dailyRewardClaim.findMany();
    await postgresClient.dailyRewardClaim.createMany({ data: dailyRewardClaims });

    const randomRewardClaims = await sqliteClient.randomRewardClaim.findMany();
    await postgresClient.randomRewardClaim.createMany({ data: randomRewardClaims });

    const messages = await sqliteClient.message.findMany();
    await postgresClient.message.createMany({ data: messages });

    const referralStats = await sqliteClient.referralStats.findMany();
    await postgresClient.referralStats.createMany({ data: referralStats });

    const referralCodes = await sqliteClient.referralCode.findMany();
    await postgresClient.referralCode.createMany({ data: referralCodes });

    const policies = await sqliteClient.policy.findMany();
    await postgresClient.policy.createMany({ data: policies });

    const auditLogs = await sqliteClient.auditLog.findMany();
    await postgresClient.auditLog.createMany({ data: auditLogs });

    console.log('Data migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  } finally {
    await sqliteClient.$disconnect();
    await postgresClient.$disconnect();
  }
}

migrateData();
```

### 7. Production Deployment

#### Docker Configuration

Create `Dockerfile.postgresql`:

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Install PostgreSQL client
RUN apk add --no-cache postgresql-client

# Copy package files
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install

# Copy source code
COPY . .

# Generate Prisma client
RUN npx prisma generate --schema=prisma/postgresql.prisma

# Build application
RUN pnpm build

EXPOSE 3000

CMD ["pnpm", "start"]
```

#### Docker Compose

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: global_hedge_ai
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: ${POSTGRES_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    ports:
      - "5432:5432"
    restart: unless-stopped

  app:
    build:
      context: .
      dockerfile: Dockerfile.postgresql
    environment:
      DATABASE_URL: postgresql://postgres:${POSTGRES_PASSWORD}@postgres:5432/global_hedge_ai?schema=public
      NODE_ENV: production
    depends_on:
      - postgres
    ports:
      - "3000:3000"
    restart: unless-stopped

volumes:
  postgres_data:
```

### 8. Performance Optimizations

#### Database Indexes

Add to `prisma/postgresql.prisma`:

```prisma
model User {
  // ... existing fields
  
  @@index([email])
  @@index([createdAt])
  @@index([invitedById])
}

model Deposit {
  // ... existing fields
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@index([effectiveAt])
}

model Withdrawal {
  // ... existing fields
  
  @@index([userId])
  @@index([status])
  @@index([createdAt])
  @@index([effectiveAt])
}

model DailyRewardClaim {
  // ... existing fields
  
  @@index([userId])
  @@index([claimDate])
}

model AuditLog {
  // ... existing fields
  
  @@index([timestamp])
  @@index([entityType])
  @@index([actorId])
}
```

#### Connection Pooling

Update `lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const createPrismaClient = () => {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    // PostgreSQL specific optimizations
    ...(process.env.NODE_ENV === 'production' && {
      transactionOptions: {
        maxWait: 5000, // 5 seconds
        timeout: 10000, // 10 seconds
      },
    }),
  });
};

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

### 9. Monitoring and Maintenance

#### Health Check

Create `api/health/database/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Get basic stats
    const userCount = await prisma.user.count();
    const depositCount = await prisma.deposit.count();
    
    return NextResponse.json({
      status: 'healthy',
      database: 'postgresql',
      timestamp: new Date().toISOString(),
      stats: {
        users: userCount,
        deposits: depositCount,
      }
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'unhealthy',
        database: 'postgresql',
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
```

#### Backup Strategy

PostgreSQL backups are handled by the BackupService we created earlier, which works with both SQLite and PostgreSQL.

### 10. Rollback Plan

In case of issues, you can rollback by:

1. Switching `DATABASE_URL` back to SQLite
2. Using the backup system to restore data
3. Reverting to previous deployment

### 11. Testing

#### Unit Tests

Update test configuration to use PostgreSQL test database:

```typescript
// tests/setup.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.TEST_DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db'
    }
  }
});

beforeEach(async () => {
  // Clean database before each test
  await prisma.$executeRaw`TRUNCATE TABLE "User", "Deposit", "Withdrawal" RESTART IDENTITY CASCADE`;
});

afterAll(async () => {
  await prisma.$disconnect();
});
```

## Production Checklist

- [ ] PostgreSQL server configured and running
- [ ] Database user created with appropriate permissions
- [ ] SSL certificates configured
- [ ] Connection pooling enabled
- [ ] Indexes created for performance
- [ ] Backup strategy implemented
- [ ] Monitoring and alerting set up
- [ ] Migration script tested
- [ ] Rollback plan documented
- [ ] Performance benchmarks established

## Security Considerations

1. **Database Access**: Use least privilege principle
2. **SSL/TLS**: Enable encrypted connections
3. **Connection Limits**: Set appropriate connection limits
4. **Audit Logging**: Enable PostgreSQL audit logging
5. **Backup Encryption**: Encrypt backup files
6. **Network Security**: Use VPC and security groups

## Performance Monitoring

Monitor these PostgreSQL metrics:

- Connection count
- Query performance
- Lock contention
- Disk I/O
- Memory usage
- Replication lag (if using read replicas)

This migration will significantly improve the platform's scalability, reliability, and performance for production use.
