import { z } from 'zod';

export const emailSchema = z.string().email().max(200);
export const passwordSchema = z.string().min(8).max(200);
export const walletSchema = z.string().min(26).max(64); // TRC20/T... شكل مبسط
export const registerSchema = z.object({ 
  email: emailSchema, 
  password: passwordSchema,
  referralCode: z.string().optional()
});
export const loginSchema = z.object({ email: emailSchema, password: z.string().min(1) });

export const withdrawSchema = z.object({
  amount: z.number().positive().max(1000000),
  address: walletSchema,
});
