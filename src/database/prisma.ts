import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client singleton instance
 * Prisma recommends one instance per application
 * The client handles connection pooling and lifecycle automatically
 */
const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
});

// Handle graceful shutdown
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});

export default prisma;

