import { Role, TransactionStatus, TransactionType } from '@prisma/client';
import prisma from '../config/prisma';
import { DashboardStats, UserStats, TransactionStats } from '../types';

/**
 * Get dashboard statistics
 * @returns Dashboard statistics
 */
export const getDashboardStats = async (): Promise<DashboardStats> => {
  // Get total users
  const totalUsers = await prisma.user.count();

  // Get new users today
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const newUsersToday = await prisma.user.count({
    where: {
      createdAt: {
        gte: today
      }
    }
  });

  // Get total transactions
  const totalTransactions = await prisma.transaction.count();

  // Get pending transactions
  const pendingTransactions = await prisma.transaction.count({
    where: {
      status: TransactionStatus.PENDING
    }
  });

  // Get total deposits
  const totalDepositsResult = await prisma.transaction.aggregate({
    where: {
      type: TransactionType.DEPOSIT,
      status: TransactionStatus.COMPLETADA
    },
    _sum: {
      amount: true
    }
  });

  const totalDeposits = totalDepositsResult._sum.amount || 0;

  // Get total withdrawals
  const totalWithdrawalsResult = await prisma.transaction.aggregate({
    where: {
      type: TransactionType.WITHDRAWAL,
      status: TransactionStatus.COMPLETADA
    },
    _sum: {
      amount: true
    }
  });

  const totalWithdrawals = totalWithdrawalsResult._sum.amount || 0;

  return {
    totalUsers,
    newUsersToday,
    totalTransactions,
    pendingTransactions,
    totalDeposits,
    totalWithdrawals
  };
};

/**
 * Get user statistics
 * @returns User statistics
 */
export const getUserStats = async (): Promise<UserStats> => {
  // Get total users
  const totalUsers = await prisma.user.count();

  // Get active users (users who have made a transaction in the last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const activeUsers = await prisma.user.count({
    where: {
      transactions: {
        some: {
          createdAt: {
            gte: thirtyDaysAgo
          }
        }
      }
    }
  });

  // Get admin users
  const adminUsers = await prisma.user.count({
    where: {
      role: Role.ADMIN
    }
  });

  // Get users by date (last 7 days)
  const usersByDate = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    date.setHours(0, 0, 0, 0);

    const nextDate = new Date(date);
    nextDate.setDate(nextDate.getDate() + 1);

    const count = await prisma.user.count({
      where: {
        createdAt: {
          gte: date,
          lt: nextDate
        }
      }
    });

    usersByDate.push({
      date: date.toISOString().split('T')[0],
      count
    });
  }

  return {
    totalUsers,
    activeUsers,
    adminUsers,
    usersByDate
  };
};

/**
 * Get transaction statistics
 * @returns Transaction statistics
 */
export const getTransactionStats = async (): Promise<TransactionStats> => {
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
