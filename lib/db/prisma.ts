// ============================================
// Prisma Client Singleton
// ============================================

import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Prisma Client singleton instance
 * Prevents multiple instances in development with hot reload
 */
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Helper function to handle database errors gracefully
 */
export function handleDatabaseError(error: unknown, context: string) {
  console.error(`[DB Error] ${context}:`, error);

  // Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: any };

    switch (prismaError.code) {
      case 'P2002':
        return new Error('A record with this value already exists');
      case 'P2025':
        return new Error('Record not found');
      case 'P2003':
        return new Error('Related record not found');
      case 'P2014':
        return new Error('The relation conflict');
      default:
        return new Error(`Database error: ${prismaError.code}`);
    }
  }

  return new Error(`An unexpected error occurred: ${error}`);
}

/**
 * Type-safe transaction helper
 */
export async function withTransaction<T>(
  callback: (tx: Omit<PrismaClient, '$connect' | '$disconnect' | '$on' | '$transaction' | '$extends'>) => Promise<T>
): Promise<T> {
  return await prisma.$transaction(callback);
}
