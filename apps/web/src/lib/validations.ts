import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

export const beneficiarySchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(10, 'Phone number is required'),
  barangay: z.string().min(1, 'Barangay is required'),
  address: z.string().min(10, 'Complete address is required'),
})

export const programApplicationSchema = z.object({
  programId: z.string().min(1, 'Program selection is required'),
  reason: z.string().min(20, 'Please provide detailed reason (minimum 20 characters)'),
  documents: z.array(z.string()).optional(),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type BeneficiaryFormData = z.infer<typeof beneficiarySchema>
export type ProgramApplicationFormData = z.infer<typeof programApplicationSchema>