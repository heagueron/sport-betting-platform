import { z } from 'zod';
import { Role } from '@prisma/client';

// Define TransactionStatus enum to match the Prisma schema
enum TransactionStatus {
  PENDING = 'PENDING',
  APROBADA = 'APROBADA',
  COMPLETADA = 'COMPLETADA',
  FALLIDA = 'FALLIDA'
}

// Define TransactionType enum to match the Prisma schema
enum TransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
  BET = 'BET',
  WINNING = 'WINNING'
}

// User schemas
export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2).max(50).optional(),
    email: z.string().email().optional()
  }).refine(data => data.name || data.email, {
    message: 'At least one field (name or email) must be provided'
  })
});

export const updateUserRoleSchema = z.object({
  body: z.object({
    role: z.enum([Role.USER, Role.ADMIN])
  })
});

export const updateUserBalanceSchema = z.object({
  body: z.object({
    amount: z.number()
  })
});

// Transaction schemas
export const approveTransactionSchema = z.object({
  body: z.object({
    notes: z.string().optional()
  })
});

export const completeTransactionSchema = z.object({
  body: z.object({
    notes: z.string().optional()
  })
});

export const rejectTransactionSchema = z.object({
  body: z.object({
    notes: z.string().min(1, 'Rejection notes are required')
  })
});

// Query parameter schemas
export const paginationSchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val, 10) : 10)
  })
});

export const userQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val, 10) : 10),
    search: z.string().optional()
  })
});

export const transactionQuerySchema = z.object({
  query: z.object({
    page: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val, 10) : 1),
    limit: z.string().regex(/^\d+$/).optional().transform(val => val ? parseInt(val, 10) : 10),
    status: z.enum([
      TransactionStatus.PENDING,
      TransactionStatus.APROBADA,
      TransactionStatus.COMPLETADA,
      TransactionStatus.FALLIDA
    ]).optional(),
    type: z.enum([
      TransactionType.DEPOSIT,
      TransactionType.WITHDRAWAL,
      TransactionType.BET,
      TransactionType.WINNING
    ]).optional(),
    userId: z.string().uuid().optional()
  })
});
