import { User, Role } from '@prisma/client';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import { UpdateUserData } from '../types';

/**
 * Get all users with pagination
 * @param page Page number
 * @param limit Items per page
 * @param search Search term for name or email
 * @returns List of users with pagination info
 */
export const getAllUsers = async (
  page: number = 1,
  limit: number = 10,
  search?: string
): Promise<{
  users: any[];
  total: number;
  page: number;
  pages: number;
}> => {
  // Build where clause
  const where: any = {};

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }

  // Calculate pagination
  const skip = (page - 1) * limit;

  // Get total count
  const total = await prisma.user.count({ where });

  // Get users
  const users = await prisma.user.findMany({
    where,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      balance: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          bets: true,
          transactions: true
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
    users,
    total,
    page,
    pages
  };
};

/**
 * Get user by ID with detailed information
 * @param userId User ID
 * @returns User with detailed information if found
 */
export const getUserWithDetails = async (
  userId: string
): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      bets: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      },
      transactions: {
        take: 5,
        orderBy: { createdAt: 'desc' }
      },
      _count: {
        select: {
          bets: true,
          transactions: true
        }
      }
    }
  });
};

/**
 * Update user by ID
 * @param userId User ID
 * @param userData User data to update
 * @returns Updated user
 */
export const updateUser = async (
  userId: string,
  userData: UpdateUserData
): Promise<User> => {
  return prisma.user.update({
    where: { id: userId },
    data: userData
  });
};

/**
 * Update user role
 * @param userId User ID
 * @param role New role
 * @returns Updated user
 */
export const updateUserRole = async (
  userId: string,
  role: Role
): Promise<User> => {
  return prisma.user.update({
    where: { id: userId },
    data: { role }
  });
};

/**
 * Update user balance
 * @param userId User ID
 * @param amount Amount to add (positive) or subtract (negative)
 * @returns Updated user
 */
export const updateUserBalance = async (
  userId: string,
  amount: number
): Promise<User> => {
  const user = await prisma.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error('User not found');
  }

  const newBalance = user.balance + amount;

  if (newBalance < 0) {
    throw new Error('Insufficient balance');
  }

  return prisma.user.update({
    where: { id: userId },
    data: { balance: newBalance }
  });
};
