import { z } from 'zod';

// Basic schemas
export const emailSchema = z.string().email().max(200);
export const passwordSchema = z.string().min(8).max(200);
export const walletSchema = z.string().min(26).max(64); // TRC20/T... شكل مبسط

// Enhanced wallet validation
export const trc20AddressSchema = z.string().regex(/^T[A-Za-z1-9]{33}$/, 'Invalid TRC20 address');
export const erc20AddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid ERC20 address');
export const btcAddressSchema = z.string().regex(/^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$|^bc1[a-z0-9]{39,59}$/, 'Invalid Bitcoin address');
export const ethAddressSchema = z.string().regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address');

// Cryptocurrency validation
export const cryptocurrencySchema = z.enum([
  'USDT_TRC20',
  'USDT_ERC20', 
  'BTC',
  'ETH',
  'BNB',
  'ADA',
  'SOL',
  'MATIC',
  'AVAX',
  'DOT'
]);

// Amount validation
export const amountSchema = z.number().positive().max(1000000).multipleOf(0.01);

// Transaction ID validation
export const txIdSchema = z.string().min(10).max(100).regex(/^[a-zA-Z0-9]+$/, 'Invalid transaction ID format');

// User schemas
export const registerSchema = z.object({ 
  email: emailSchema, 
  password: passwordSchema,
  referralCode: z.string().optional()
});

export const loginSchema = z.object({ 
  email: emailSchema, 
  password: z.string().min(1) 
});

// Deposit validation
export const depositSchema = z.object({
  amount: amountSchema,
  cryptocurrency: cryptocurrencySchema,
  txId: txIdSchema,
  proofImageUrl: z.string().url().optional(),
}).refine((data) => {
  // Validate wallet address based on cryptocurrency
  switch (data.cryptocurrency) {
    case 'USDT_TRC20':
      return true; // Will be validated separately
    case 'USDT_ERC20':
      return true; // Will be validated separately
    case 'BTC':
      return true; // Will be validated separately
    case 'ETH':
      return true; // Will be validated separately
    default:
      return true;
  }
}, {
  message: "Invalid wallet address for selected cryptocurrency",
  path: ["cryptocurrency"],
});

// Withdrawal validation
export const withdrawSchema = z.object({
  amount: amountSchema,
  cryptocurrency: cryptocurrencySchema,
  toAddress: z.string().min(10).max(100),
}).refine((data) => {
  // Validate withdrawal address based on cryptocurrency
  switch (data.cryptocurrency) {
    case 'USDT_TRC20':
      return trc20AddressSchema.safeParse(data.toAddress).success;
    case 'USDT_ERC20':
      return erc20AddressSchema.safeParse(data.toAddress).success;
    case 'BTC':
      return btcAddressSchema.safeParse(data.toAddress).success;
    case 'ETH':
      return ethAddressSchema.safeParse(data.toAddress).success;
    default:
      return true;
  }
}, {
  message: "Invalid withdrawal address for selected cryptocurrency",
  path: ["toAddress"],
});

// Policy validation
export const policySchema = z.object({
  key: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_]+$/, 'Invalid policy key format'),
  value: z.string().min(1).max(1000),
});

// Message validation
export const messageSchema = z.object({
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(5000),
  type: z.enum(['SYSTEM', 'SUPPORT', 'ANNOUNCEMENT']),
});

// Referral validation
export const referralSchema = z.object({
  referralCode: z.string().min(6).max(20).regex(/^[A-Z0-9]+$/, 'Invalid referral code format'),
});

// Admin validation
export const adminUserUpdateSchema = z.object({
  email: emailSchema.optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPPORT', 'ACCOUNTING']).optional(),
  balance: z.number().min(0).max(1000000).optional(),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File).refine(
    (file) => file.size <= 10 * 1024 * 1024, // 10MB
    'File size must be less than 10MB'
  ).refine(
    (file) => ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(file.type),
    'File must be an image'
  ),
});

// Password reset validation
export const passwordResetSchema = z.object({
  email: emailSchema,
});

export const passwordResetConfirmSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

// Utility functions
export function validateWalletAddress(address: string, cryptoType: string): boolean {
  switch (cryptoType) {
    case 'USDT_TRC20':
      return trc20AddressSchema.safeParse(address).success;
    case 'USDT_ERC20':
      return erc20AddressSchema.safeParse(address).success;
    case 'BTC':
      return btcAddressSchema.safeParse(address).success;
    case 'ETH':
      return ethAddressSchema.safeParse(address).success;
    default:
      return false;
  }
}

export function validateAmount(amount: number, cryptoType: string): boolean {
  const minAmounts = {
    'USDT_TRC20': 10,
    'USDT_ERC20': 10,
    'BTC': 0.001,
    'ETH': 0.01,
    'BNB': 0.1,
    'ADA': 10,
    'SOL': 0.1,
    'MATIC': 1,
    'AVAX': 0.1,
    'DOT': 0.1,
  };
  
  const minAmount = minAmounts[cryptoType as keyof typeof minAmounts] || 0.01;
  return amount >= minAmount && amount <= 1000000;
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, ''); // Remove event handlers
}

export function validateTransactionId(txId: string, cryptoType: string): boolean {
  const patterns = {
    'USDT_TRC20': /^[a-fA-F0-9]{64}$/,
    'USDT_ERC20': /^0x[a-fA-F0-9]{64}$/,
    'BTC': /^[a-fA-F0-9]{64}$/,
    'ETH': /^0x[a-fA-F0-9]{64}$/,
    'BNB': /^[a-fA-F0-9]{64}$/,
    'ADA': /^[a-fA-F0-9]{64}$/,
    'SOL': /^[a-zA-Z0-9]{88}$/,
    'MATIC': /^0x[a-fA-F0-9]{64}$/,
    'AVAX': /^[a-fA-F0-9]{64}$/,
    'DOT': /^[a-fA-F0-9]{64}$/,
  };
  
  const pattern = patterns[cryptoType as keyof typeof patterns];
  return pattern ? pattern.test(txId) : false;
}
