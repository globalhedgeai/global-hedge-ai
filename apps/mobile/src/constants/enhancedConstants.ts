// Enhanced Constants for Global Hedge AI Mobile App

export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000/api' 
  : process.env.EXPO_PUBLIC_API_URL || 'https://api.global-hedge-ai.com/api';

export const COLORS = {
  primary: '#f0b90b',
  secondary: '#2b3139',
  background: '#0b0e11',
  surface: '#1e2329',
  text: '#ffffff',
  textSecondary: '#848e9c',
  success: '#02c076',
  warning: '#f0b90b',
  error: '#f84960',
  info: '#1890ff',
  border: '#2b3139',
  // Additional colors
  accent: '#00d4aa',
  danger: '#ff4757',
  light: '#f8f9fa',
  dark: '#212529',
  muted: '#6c757d',
};

export const FONTS = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
  // Additional fonts
  light: 'Inter-Light',
  thin: 'Inter-Thin',
  black: 'Inter-Black',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  // Additional spacing
  xxxl: 64,
  xxxxl: 96,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
  // Additional border radius
  xs: 2,
  xxl: 24,
  xxxl: 32,
};

export const SUPPORTED_LANGUAGES = [
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'tr', name: 'Türkçe', flag: '🇹🇷' },
];

export const CRYPTOCURRENCIES = [
  {
    id: 'USDT_TRC20',
    name: 'Tether USD',
    symbol: 'USDT',
    network: 'TRC20',
    icon: '🟡',
    minDeposit: 10,
    minWithdrawal: 5,
    color: '#26a17b',
  },
  {
    id: 'USDT_ERC20',
    name: 'Tether USD',
    symbol: 'USDT',
    network: 'ERC20',
    icon: '🔵',
    minDeposit: 10,
    minWithdrawal: 5,
    color: '#26a17b',
  },
  {
    id: 'BTC',
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'Bitcoin',
    icon: '🟠',
    minDeposit: 0.001,
    minWithdrawal: 0.0005,
    color: '#f7931a',
  },
  {
    id: 'ETH',
    name: 'Ethereum',
    symbol: 'ETH',
    network: 'Ethereum',
    icon: '🔷',
    minDeposit: 0.01,
    minWithdrawal: 0.005,
    color: '#627eea',
  },
  {
    id: 'BNB',
    name: 'Binance Coin',
    symbol: 'BNB',
    network: 'BSC',
    icon: '🟨',
    minDeposit: 0.1,
    minWithdrawal: 0.05,
    color: '#f3ba2f',
  },
  {
    id: 'ADA',
    name: 'Cardano',
    symbol: 'ADA',
    network: 'Cardano',
    icon: '🔵',
    minDeposit: 10,
    minWithdrawal: 5,
    color: '#0033ad',
  },
  {
    id: 'SOL',
    name: 'Solana',
    symbol: 'SOL',
    network: 'Solana',
    icon: '🟣',
    minDeposit: 0.1,
    minWithdrawal: 0.05,
    color: '#9945ff',
  },
  {
    id: 'MATIC',
    name: 'Polygon',
    symbol: 'MATIC',
    network: 'Polygon',
    icon: '🟣',
    minDeposit: 1,
    minWithdrawal: 0.5,
    color: '#8247e5',
  },
  {
    id: 'AVAX',
    name: 'Avalanche',
    symbol: 'AVAX',
    network: 'Avalanche',
    icon: '🔴',
    minDeposit: 0.1,
    minWithdrawal: 0.05,
    color: '#e84142',
  },
  {
    id: 'DOT',
    name: 'Polkadot',
    symbol: 'DOT',
    network: 'Polkadot',
    icon: '🟣',
    minDeposit: 0.1,
    minWithdrawal: 0.05,
    color: '#e6007a',
  },
];

export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  REFRESH_TOKEN: 'refresh_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language',
  THEME: 'theme',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  BIOMETRIC_ENABLED: 'biometric_enabled',
  // Additional storage keys
  ONBOARDING_COMPLETED: 'onboarding_completed',
  LAST_SYNC_TIME: 'last_sync_time',
  CACHED_DATA: 'cached_data',
  SETTINGS: 'settings',
  ANALYTICS_ENABLED: 'analytics_enabled',
};

export const NOTIFICATION_TYPES = {
  DEPOSIT_APPROVED: 'deposit_approved',
  DEPOSIT_REJECTED: 'deposit_rejected',
  WITHDRAWAL_APPROVED: 'withdrawal_approved',
  WITHDRAWAL_REJECTED: 'withdrawal_rejected',
  DAILY_REWARD: 'daily_reward',
  RANDOM_REWARD: 'random_reward',
  MESSAGE_RECEIVED: 'message_received',
  SYSTEM_ANNOUNCEMENT: 'system_announcement',
  // Additional notification types
  REFERRAL_BONUS: 'referral_bonus',
  ACCOUNT_UPDATE: 'account_update',
  SECURITY_ALERT: 'security_alert',
  MAINTENANCE: 'maintenance',
};

export const SCREEN_NAMES = {
  LOGIN: 'Login',
  REGISTER: 'Register',
  HOME: 'Home',
  MARKET: 'Market',
  DEPOSIT: 'Deposit',
  WITHDRAW: 'Withdraw',
  ACCOUNT: 'Account',
  TRANSACTIONS: 'Transactions',
  MESSAGES: 'Messages',
  SETTINGS: 'Settings',
  PROFILE: 'Profile',
  // Additional screen names
  ONBOARDING: 'Onboarding',
  SPLASH: 'Splash',
  REFERRAL: 'Referral',
  SUPPORT: 'Support',
  ANALYTICS: 'Analytics',
  NOTIFICATIONS: 'Notifications',
};

export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  // Additional durations
  VERY_FAST: 100,
  VERY_SLOW: 1000,
};

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  AMOUNT_MIN_VALUE: 0.01,
  ADDRESS_MIN_LENGTH: 10,
  // Additional validation rules
  REFERRAL_CODE_LENGTH: 8,
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
};

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'خطأ في الاتصال بالشبكة',
  INVALID_CREDENTIALS: 'بيانات الدخول غير صحيحة',
  USER_NOT_FOUND: 'المستخدم غير موجود',
  INSUFFICIENT_BALANCE: 'الرصيد غير كافي',
  INVALID_AMOUNT: 'المبلغ غير صحيح',
  INVALID_ADDRESS: 'عنوان المحفظة غير صحيح',
  UPLOAD_FAILED: 'فشل في رفع الملف',
  GENERIC_ERROR: 'حدث خطأ غير متوقع',
  // Additional error messages
  SESSION_EXPIRED: 'انتهت صلاحية الجلسة',
  INVALID_TOKEN: 'رمز غير صحيح',
  RATE_LIMIT_EXCEEDED: 'تم تجاوز الحد المسموح',
  MAINTENANCE_MODE: 'الموقع في وضع الصيانة',
  INVALID_FILE_TYPE: 'نوع الملف غير مدعوم',
  FILE_TOO_LARGE: 'حجم الملف كبير جداً',
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'تم تسجيل الدخول بنجاح',
  REGISTER_SUCCESS: 'تم إنشاء الحساب بنجاح',
  DEPOSIT_SUCCESS: 'تم إرسال طلب الإيداع بنجاح',
  WITHDRAWAL_SUCCESS: 'تم إرسال طلب السحب بنجاح',
  PROFILE_UPDATED: 'تم تحديث الملف الشخصي بنجاح',
  PASSWORD_CHANGED: 'تم تغيير كلمة المرور بنجاح',
  FILE_UPLOADED: 'تم رفع الملف بنجاح',
  // Additional success messages
  REWARD_CLAIMED: 'تم المطالبة بالمكافأة بنجاح',
  REFERRAL_SENT: 'تم إرسال رابط الدعوة بنجاح',
  SETTINGS_SAVED: 'تم حفظ الإعدادات بنجاح',
  SUPPORT_TICKET_CREATED: 'تم إنشاء تذكرة الدعم بنجاح',
  NOTIFICATION_SENT: 'تم إرسال الإشعار بنجاح',
};

// Additional constants
export const APP_CONFIG = {
  VERSION: '1.0.0',
  BUILD_NUMBER: '1',
  MINIMUM_APP_VERSION: '1.0.0',
  SUPPORT_EMAIL: 'support@globalhedgeai.com',
  PRIVACY_POLICY_URL: 'https://globalhedgeai.com/privacy',
  TERMS_OF_SERVICE_URL: 'https://globalhedgeai.com/terms',
  SUPPORT_URL: 'https://globalhedgeai.com/support',
};

export const THEME_CONFIG = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
};

export const REFERRAL_TIERS = [
  { tier: 1, minInvites: 0, maxInvites: 4, bonus: 0 },
  { tier: 2, minInvites: 5, maxInvites: 9, bonus: 25 },
  { tier: 3, minInvites: 10, maxInvites: 19, bonus: 30 },
  { tier: 4, minInvites: 20, maxInvites: 49, bonus: 35 },
  { tier: 5, minInvites: 50, maxInvites: null, bonus: 40 },
];

export const TRANSACTION_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  PROCESSING: 'PROCESSING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
};

export const PRIORITY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent',
};

export const CACHE_DURATION = {
  SHORT: 5 * 60 * 1000, // 5 minutes
  MEDIUM: 30 * 60 * 1000, // 30 minutes
  LONG: 60 * 60 * 1000, // 1 hour
  VERY_LONG: 24 * 60 * 60 * 1000, // 24 hours
};
