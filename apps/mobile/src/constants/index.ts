// Constants for Global Hedge AI Mobile App

export const API_BASE_URL = __DEV__ 
  ? 'http://localhost:3000' 
  : process.env.EXPO_PUBLIC_API_URL || 'https://global-hedge-ai-web-new1-hywg29lo9-global-hedge-ais-projects.vercel.app';

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
};

export const FONTS = {
  regular: 'Inter-Regular',
  medium: 'Inter-Medium',
  semiBold: 'Inter-SemiBold',
  bold: 'Inter-Bold',
};

export const SPACING = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};

export const BORDER_RADIUS = {
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  round: 50,
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
  },
  {
    id: 'USDT_ERC20',
    name: 'Tether USD',
    symbol: 'USDT',
    network: 'ERC20',
    icon: '🔵',
    minDeposit: 10,
    minWithdrawal: 5,
  },
  {
    id: 'BTC',
    name: 'Bitcoin',
    symbol: 'BTC',
    network: 'Bitcoin',
    icon: '🟠',
    minDeposit: 0.001,
    minWithdrawal: 0.0005,
  },
  {
    id: 'ETH',
    name: 'Ethereum',
    symbol: 'ETH',
    network: 'Ethereum',
    icon: '🔷',
    minDeposit: 0.01,
    minWithdrawal: 0.005,
  },
];

export const STORAGE_KEYS = {
  USER_TOKEN: 'user_token',
  USER_DATA: 'user_data',
  LANGUAGE: 'language',
  THEME: 'theme',
  NOTIFICATIONS_ENABLED: 'notifications_enabled',
  BIOMETRIC_ENABLED: 'biometric_enabled',
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
};

export const ANIMATION_DURATION = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
};

export const VALIDATION_RULES = {
  EMAIL_REGEX: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  PASSWORD_MIN_LENGTH: 8,
  AMOUNT_MIN_VALUE: 0.01,
  ADDRESS_MIN_LENGTH: 10,
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
};

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'تم تسجيل الدخول بنجاح',
  REGISTER_SUCCESS: 'تم إنشاء الحساب بنجاح',
  DEPOSIT_SUCCESS: 'تم إرسال طلب الإيداع بنجاح',
  WITHDRAWAL_SUCCESS: 'تم إرسال طلب السحب بنجاح',
  PROFILE_UPDATED: 'تم تحديث الملف الشخصي بنجاح',
  PASSWORD_CHANGED: 'تم تغيير كلمة المرور بنجاح',
  FILE_UPLOADED: 'تم رفع الملف بنجاح',
};
