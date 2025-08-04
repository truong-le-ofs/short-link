import { z } from 'zod'
import { URL_REGEX, MAX_CUSTOM_CODE_LENGTH, MIN_CUSTOM_CODE_LENGTH } from './constants'

// Link creation validation schema
export const createLinkSchema = z.object({
  url: z
    .string()
    .min(1, 'URL is required')
    .regex(URL_REGEX, 'Please enter a valid URL'),
  customCode: z
    .string()
    .min(MIN_CUSTOM_CODE_LENGTH, `Custom code must be at least ${MIN_CUSTOM_CODE_LENGTH} characters`)
    .max(MAX_CUSTOM_CODE_LENGTH, `Custom code must be at most ${MAX_CUSTOM_CODE_LENGTH} characters`)
    .regex(/^[a-zA-Z0-9_-]+$/, 'Custom code can only contain letters, numbers, hyphens, and underscores')
    .optional(),
  title: z
    .string()
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  password: z
    .string()
    .min(4, 'Password must be at least 4 characters')
    .max(50, 'Password must be less than 50 characters')
    .optional(),
  expiresAt: z
    .string()
    .datetime('Invalid date format')
    .optional(),
  accessLimit: z
    .number()
    .int('Max clicks must be a whole number')
    .min(1, 'Max clicks must be at least 1')
    .max(1000000, 'Max clicks cannot exceed 1,000,000')
    .optional(),
})

// Link form schema (extends create schema with form-specific fields)
export const linkFormSchema = createLinkSchema.extend({
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.password && data.confirmPassword) {
    return data.password === data.confirmPassword
  }
  return true
}, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// User registration schema
export const registerSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// User login schema
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
  password: z
    .string()
    .min(1, 'Password is required'),
})

// Password reset schema
export const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'Email is required')
    .email('Please enter a valid email address'),
})

// Update password schema
export const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one uppercase letter, one lowercase letter, and one number'),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
})

// Link access schema (for password-protected links)
export const linkAccessSchema = z.object({
  password: z
    .string()
    .min(1, 'Password is required'),
})

// Analytics filter schema
export const analyticsFilterSchema = z.object({
  startDate: z
    .string()
    .datetime('Invalid start date')
    .optional(),
  endDate: z
    .string()
    .datetime('Invalid end date')
    .optional(),
  linkId: z
    .string()
    .uuid('Invalid link ID')
    .optional(),
}).refine((data) => {
  if (data.startDate && data.endDate) {
    return new Date(data.startDate) <= new Date(data.endDate)
  }
  return true
}, {
  message: 'Start date must be before end date',
  path: ['endDate'],
})

// Link update schema
export const updateLinkSchema = z.object({
  title: z
    .string()
    .max(200, 'Title must be less than 200 characters')
    .optional(),
  description: z
    .string()
    .max(500, 'Description must be less than 500 characters')
    .optional(),
  password: z
    .string()
    .min(4, 'Password must be at least 4 characters')
    .max(50, 'Password must be less than 50 characters')
    .nullable()
    .optional(),
  expiresAt: z
    .string()
    .datetime('Invalid date format')
    .nullable()
    .optional(),
  accessLimit: z
    .number()
    .int('Max clicks must be a whole number')
    .min(1, 'Max clicks must be at least 1')
    .max(1000000, 'Max clicks cannot exceed 1,000,000')
    .nullable()
    .optional(),
  is_active: z
    .boolean()
    .optional(),
})

// Meta tag data validation schema
export const metaTagSchema = z.object({
  title: z.string().max(300, 'Meta title must be less than 300 characters').optional(),
  description: z.string().max(500, 'Meta description must be less than 500 characters').optional(),
  image: z.string().url('Invalid image URL').optional(),
  site_name: z.string().max(200, 'Site name must be less than 200 characters').optional(),
  type: z.string().max(50, 'Type must be less than 50 characters').optional(),
  url: z.string().url('Invalid URL').optional(),
  twitter_card: z.string().max(50, 'Twitter card type must be less than 50 characters').optional(),
  twitter_site: z.string().max(100, 'Twitter site must be less than 100 characters').optional(),
  twitter_creator: z.string().max(100, 'Twitter creator must be less than 100 characters').optional(),
  twitter_image: z.string().url('Invalid Twitter image URL').optional(),
  twitter_title: z.string().max(300, 'Twitter title must be less than 300 characters').optional(),
  twitter_description: z.string().max(500, 'Twitter description must be less than 500 characters').optional(),
  favicon: z.string().url('Invalid favicon URL').optional(),
  extracted_at: z.string().datetime('Invalid extraction date').optional(),
  extraction_status: z.enum(['pending', 'success', 'failed', 'timeout']).optional(),
})

// Export type inferences for use in components
export type CreateLinkInput = z.infer<typeof createLinkSchema>
export type LinkFormInput = z.infer<typeof linkFormSchema>
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type UpdatePasswordInput = z.infer<typeof updatePasswordSchema>
export type LinkAccessInput = z.infer<typeof linkAccessSchema>
export type AnalyticsFilterInput = z.infer<typeof analyticsFilterSchema>
export type UpdateLinkInput = z.infer<typeof updateLinkSchema>
export type MetaTagInput = z.infer<typeof metaTagSchema>