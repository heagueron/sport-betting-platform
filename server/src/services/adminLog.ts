import { AdminLog } from '@prisma/client';
import prisma from '../config/prisma';
import { AdminLogData } from '../types';

/**
 * Create a new admin log entry
 * @param logData Admin log data
 * @returns Newly created admin log
 */
export const createAdminLog = async (
  logData: AdminLogData
): Promise<AdminLog> => {
  return prisma.adminLog.create({
    data: logData
  });
};

/**
 * Get all admin logs with pagination
 * @param page Page number
 * @param limit Items per page
 * @param userId Filter by user ID
 * @returns List of admin logs with pagination info
 */
export const getAdminLogs = async (
  page: number = 1,
  limit: number = 10,
  userId?: string
): Promise<{
  logs: AdminLog[];
  total: number;
  page: number;
  pages: number;
}> => {
  // Build where clause
  const where: any = {};
  
  if (userId) {
    where.userId = userId;
  }
  
  // Calculate pagination
  const skip = (page - 1) * limit;
  
  // Get total count
  const total = await prisma.adminLog.count({ where });
  
  // Get logs
  const logs = await prisma.adminLog.findMany({
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
    logs,
    total,
    page,
    pages
  };
};

/**
 * Log admin action
 * Helper function to easily log admin actions
 * @param userId Admin user ID
 * @param action Action performed
 * @param details Additional details
 * @param ipAddress IP address of the admin
 * @returns Created log entry
 */
export const logAdminAction = async (
  userId: string,
  action: string,
  details?: string,
  ipAddress?: string
): Promise<AdminLog> => {
  return createAdminLog({
    userId,
    action,
    details,
    ipAddress
  });
};
