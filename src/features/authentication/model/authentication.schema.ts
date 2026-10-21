import { z } from 'zod'

// Limits mirror the backend's bean validation (AuthController.RegisterRequest).
const email = z
  .string()
  .trim()
  .min(1, 'validation.authentication.emailRequired')
  .max(255, 'validation.authentication.emailInvalid')
  .pipe(z.email('validation.authentication.emailInvalid'))

const registrationPassword = z
  .string()
  .min(6, 'validation.authentication.passwordLength')
  .max(100, 'validation.authentication.passwordLength')

export const loginSchema = z.object({
  displayName: z.string(),
  email,
  password: z.string().min(1, 'validation.authentication.passwordRequired').max(100),
})

export const loginFormSchema = loginSchema.extend({
  confirmPassword: z.string(),
})

export const registerSchema = z
  .object({
    confirmPassword: z.string().min(1, 'validation.authentication.confirmPasswordRequired'),
    displayName: z.string().trim().min(1, 'validation.authentication.displayNameRequired').max(100),
    email,
    password: registrationPassword,
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'validation.authentication.passwordMismatch',
    path: ['confirmPassword'],
  })

export type LoginValues = z.infer<typeof loginSchema>
export type RegisterValues = z.infer<typeof registerSchema>
