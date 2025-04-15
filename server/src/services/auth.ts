import { User } from '@prisma/client';
import prisma from '../config/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { RegisterData, LoginCredentials } from '../types';
import { AppError, ConflictError } from '../utils/errors';

/**
 * Register a new user
 * @param userData User registration data
 * @returns Newly created user
 */
export const registerUser = async (userData: RegisterData): Promise<User> => {
  try {
    // Check if user with this email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email }
    });

    if (existingUser) {
      throw new ConflictError('Email already in use');
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        name: userData.name,
        email: userData.email,
        password: hashedPassword,
      },
    });

    return user;
  } catch (error: any) {
    // Handle Prisma unique constraint error
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      throw new ConflictError('Email already in use');
    }
    throw error;
  }
};

/**
 * Login a user
 * @param credentials User login credentials
 * @returns User if login successful
 */
export const loginUser = async (credentials: LoginCredentials): Promise<User | null> => {
  console.log('Service: loginUser called with email:', credentials.email);

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: credentials.email },
  });

  // Check if user exists
  if (!user) {
    console.log('Service: user not found with email:', credentials.email);
    return null;
  }

  console.log('Service: user found with email:', credentials.email);

  // Check if password matches
  const isMatch = await bcrypt.compare(credentials.password, user.password);

  if (!isMatch) {
    console.log('Service: password does not match for user:', credentials.email);
    return null;
  }

  console.log('Service: password matches for user:', credentials.email);
  return user;
};

/**
 * Get user by ID
 * @param id User ID
 * @returns User if found
 */
export const getUserById = async (id: string): Promise<User | null> => {
  return prisma.user.findUnique({
    where: { id },
  });
};

/**
 * Generate JWT token
 * @param userId User ID
 * @returns JWT token
 */
export const generateToken = (userId: string): string => {
  const secret = process.env.JWT_SECRET || 'fallbacksecret';
  // Use a fixed expiration time to avoid TypeScript issues
  const options = { expiresIn: '30d' } as jwt.SignOptions;

  return jwt.sign({ id: userId }, secret, options);
};

/**
 * Update user details
 * @param userId User ID
 * @param userData User data to update
 * @returns Updated user
 */
export const updateUserDetails = async (userId: string, userData: { name?: string; email?: string }): Promise<User> => {
  try {
    // Check if email is already in use by another user
    if (userData.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email: userData.email }
      });

      if (existingUser && existingUser.id !== userId) {
        throw new ConflictError('Email already in use');
      }
    }

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        name: userData.name,
        email: userData.email,
      },
    });

    return user;
  } catch (error: any) {
    // Handle Prisma unique constraint error
    if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
      throw new ConflictError('Email already in use');
    }
    throw error;
  }
};
