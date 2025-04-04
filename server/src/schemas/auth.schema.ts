import { z } from 'zod';

// Schema for user registration
export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters long'),
  }),
});

// Schema for user login
export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email format'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// Schema for updating user details
export const updateDetailsSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long').optional(),
    email: z.string().email('Invalid email format').optional(),
  }).refine(data => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

// Schema for updating password
export const updatePasswordSchema = z.object({
  body: z.object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(6, 'New password must be at least 6 characters long'),
  }),
});
