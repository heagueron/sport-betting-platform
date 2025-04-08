import { Transaction, TransactionStatus, TransactionType } from '@prisma/client';
import prisma from '../config/prisma';
import { TransactionData } from '../types';

/**
 * Create a new transaction
 * @param transactionData Transaction data
 * @returns Newly created transaction
 */
export const createTransaction = async (
  transactionData: TransactionData
): Promise<Transaction> => {
  return prisma.transaction.create({
    data: transactionData
  });
};

/**
 * Get all transactions with pagination
 * @param page Page number
 * @param limit Items per page
 * @param status Filter by status
 * @param type Filter by type
 * @param userId Filter by user ID
 * @returns List of transactions with pagination info
 */
export const getAllTransactions = async (
  page: number = 1,
  limit: number = 10,
  status?: TransactionStatus,
  type?: TransactionType,
  userId?: string
): Promise<{
  transactions: Transaction[];
  total: number;
  page: number;
  pages: number;
}> => {
  // Build where clause
  const where: any = {};

  if (status) {
    where.status = status;
  }

  if (type) {
    where.type = type;
  }

  if (userId) {
    where.userId = userId;
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count
  const total = await prisma.transaction.count({ where });

  // Get transactions
  const transactions = await prisma.transaction.findMany({
    where,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    skip,
    take: limit
  });

  // Calculate total pages
  const pages = Math.ceil(total / limit);

  return {
    transactions,
    total,
    page,
    pages
  };
};

/**
 * Get transaction by ID
 * @param transactionId Transaction ID
 * @returns Transaction if found
 */
export const getTransactionById = async (
  transactionId: string
): Promise<Transaction | null> => {
  return prisma.transaction.findUnique({
    where: { id: transactionId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
};

/**
 * Update transaction status
 * @param transactionId Transaction ID
 * @param status New status
 * @param notes Optional notes
 * @returns Updated transaction
 */
export const updateTransactionStatus = async (
  transactionId: string,
  status: TransactionStatus,
  notes?: string
): Promise<Transaction> => {
  const updateData: any = { status };

  if (notes) {
    updateData.notes = notes;
  }

  return prisma.transaction.update({
    where: { id: transactionId },
    data: updateData,
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  });
};

/**
 * Get transaction statistics
 * @returns Transaction statistics
 */
export const getTransactionStats = async (): Promise<{
  totalAmount: number;
  byStatus: { status: TransactionStatus; count: number }[];
  byType: { type: TransactionType; count: number }[];
  recentTransactions: Transaction[];
}> => {
  // Get total amount of all completed transactions
  const totalAmountResult = await prisma.transaction.aggregate({
    where: { status: TransactionStatus.COMPLETADA },
    _sum: { amount: true }
  });

  const totalAmount = totalAmountResult._sum.amount || 0;

  // Get count by status
  const statusCounts = await prisma.transaction.groupBy({
    by: ['status'],
    _count: {
      status: true
    },
    orderBy: {
      _count: {
        status: 'desc'
      }
    }
  });

  const byStatus = statusCounts.map(item => ({
    status: item.status,
    count: item._count.status
  }));

  // Get count by type
  const typeCounts = await prisma.transaction.groupBy({
    by: ['type'],
    _count: {
      type: true
    },
    orderBy: {
      _count: {
        type: 'desc'
      }
    }
  });

  const byType = typeCounts.map(item => ({
    type: item.type,
    count: item._count.type
  }));

  // Get recent transactions
  const recentTransactions = await prisma.transaction.findMany({
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  return {
    totalAmount,
    byStatus,
    byType,
    recentTransactions
  };
};
