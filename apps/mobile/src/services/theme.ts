// Theme Service for Global Hedge AI Mobile App

import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants';

export type ThemeMode = 'light' | 'dark' | 'auto';

export interface ThemeColors {
  // Primary colors
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  
  // Background colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  
  // Surface colors
  surface: string;
  surfaceForeground: string;
  muted: string;
  mutedForeground: string;
  
  // Accent colors
  accent: string;
  accentForeground: string;
  
  // Status colors
  success: string;
  successForeground: string;
  warning: string;
  warningForeground: string;
  error: string;
  errorForeground: string;
  info: string;
  infoForeground: string;
  
  // Border colors
  border: string;
  input: string;
  ring: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textMuted: string;
  
  // Special colors
  gradientStart: string;
  gradientEnd: string;
  shadow: string;
}

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  isDark: boolean;
}

class ThemeService {
  private currentTheme: Theme | null = null;
  private listeners: ((theme: Theme) => void)[] = [];

  // Light theme colors
  private lightColors: ThemeColors = {
    primary: '#f0b90b',
    primaryForeground: '#000000',
    secondary: '#f1f5f9',
    secondaryForeground: '#0f172a',
    
    background: '#ffffff',
    foreground: '#0f172a',
    card: '#ffffff',
    cardForeground: '#0f172a',
    
    surface: '#f8fafc',
    surfaceForeground: '#0f172a',
    muted: '#f1f5f9',
    mutedForeground: '#64748b',
    
    accent: '#f0b90b',
    accentForeground: '#000000',
    
    success: '#22c55e',
    successForeground: '#ffffff',
    warning: '#f59e0b',
    warningForeground: '#ffffff',
    error: '#ef4444',
    errorForeground: '#ffffff',
    info: '#3b82f6',
    infoForeground: '#ffffff',
    
    border: '#e2e8f0',
    input: '#ffffff',
    ring: '#f0b90b',
    
    text: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    
    gradientStart: '#f0b90b',
    gradientEnd: '#fbbf24',
    shadow: '#000000',
  };

  // Dark theme colors
  private darkColors: ThemeColors = {
    primary: '#f0b90b',
    primaryForeground: '#000000',
    secondary: '#1e293b',
    secondaryForeground: '#f8fafc',
    
    background: '#0b0e11',
    foreground: '#f8fafc',
    card: '#1e2329',
    cardForeground: '#f8fafc',
    
    surface: '#1e293b',
    surfaceForeground: '#f8fafc',
    muted: '#334155',
    mutedForeground: '#94a3b8',
    
    accent: '#f0b90b',
    accentForeground: '#000000',
    
    success: '#22c55e',
    successForeground: '#ffffff',
    warning: '#f59e0b',
    warningForeground: '#ffffff',
    error: '#ef4444',
    errorForeground: '#ffffff',
    info: '#3b82f6',
    infoForeground: '#ffffff',
    
    border: '#334155',
    input: '#1e293b',
    ring: '#f0b90b',
    
    text: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    
    gradientStart: '#f0b90b',
    gradientEnd: '#fbbf24',
    shadow: '#000000',
  };

  async initialize(): Promise<Theme> {
    try {
      const savedMode = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
      const mode: ThemeMode = (savedMode as ThemeMode) || 'auto';
      
      const theme = await this.createTheme(mode);
      this.currentTheme = theme;
      
      return theme;
    } catch (error) {
      console.error('Error initializing theme:', error);
      const defaultTheme = await this.createTheme('auto');
      this.currentTheme = defaultTheme;
      return defaultTheme;
    }
  }

  async createTheme(mode: ThemeMode): Promise<Theme> {
    let isDark = false;
    
    if (mode === 'auto') {
      // Auto mode - use system preference
      isDark = await this.getSystemTheme();
    } else {
      isDark = mode === 'dark';
    }
    
    const colors = isDark ? this.darkColors : this.lightColors;
    
    return {
      mode,
      colors,
      isDark,
    };
  }

  async getSystemTheme(): Promise<boolean> {
    try {
      // This would typically use Appearance API
      // For now, default to dark mode
      return true;
    } catch (error) {
      console.error('Error getting system theme:', error);
      return true;
    }
  }

  async setTheme(mode: ThemeMode): Promise<Theme> {
    try {
      const theme = await this.createTheme(mode);
      this.currentTheme = theme;
      
      // Save to storage
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, mode);
      
      // Notify listeners
      this.notifyListeners(theme);
      
      return theme;
    } catch (error) {
      console.error('Error setting theme:', error);
      throw error;
    }
  }

  getCurrentTheme(): Theme | null {
    return this.currentTheme;
  }

  async toggleTheme(): Promise<Theme> {
    if (!this.currentTheme) {
      await this.initialize();
    }
    
    const newMode: ThemeMode = this.currentTheme!.isDark ? 'light' : 'dark';
    return this.setTheme(newMode);
  }

  async setLightTheme(): Promise<Theme> {
    return this.setTheme('light');
  }

  async setDarkTheme(): Promise<Theme> {
    return this.setTheme('dark');
  }

  async setAutoTheme(): Promise<Theme> {
    return this.setTheme('auto');
  }

  // Theme change listeners
  addListener(listener: (theme: Theme) => void): () => void {
    this.listeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  private notifyListeners(theme: Theme): void {
    this.listeners.forEach(listener => {
      try {
        listener(theme);
      } catch (error) {
        console.error('Error in theme listener:', error);
      }
    });
  }

  // Utility methods
  getThemeName(): string {
    if (!this.currentTheme) return 'Unknown';
    
    switch (this.currentTheme.mode) {
      case 'light':
        return 'فاتح';
      case 'dark':
        return 'مظلم';
      case 'auto':
        return 'تلقائي';
      default:
        return 'Unknown';
    }
  }

  getThemeIcon(): string {
    if (!this.currentTheme) return '🌓';
    
    switch (this.currentTheme.mode) {
      case 'light':
        return '☀️';
      case 'dark':
        return '🌙';
      case 'auto':
        return '🌓';
      default:
        return '🌓';
    }
  }

  isDarkMode(): boolean {
    return this.currentTheme?.isDark || false;
  }

  isLightMode(): boolean {
    return !this.isDarkMode();
  }

  isAutoMode(): boolean {
    return this.currentTheme?.mode === 'auto';
  }

  // Color utilities
  getColor(key: keyof ThemeColors): string {
    return this.currentTheme?.colors[key] || '#000000';
  }

  getPrimaryColor(): string {
    return this.getColor('primary');
  }

  getBackgroundColor(): string {
    return this.getColor('background');
  }

  getTextColor(): string {
    return this.getColor('text');
  }

  getSuccessColor(): string {
    return this.getColor('success');
  }

  getWarningColor(): string {
    return this.getColor('warning');
  }

  getErrorColor(): string {
    return this.getColor('error');
  }

  getInfoColor(): string {
    return this.getColor('info');
  }

  // Gradient utilities
  getGradientColors(): [string, string] {
    return [
      this.getColor('gradientStart'),
      this.getColor('gradientEnd'),
    ];
  }

  // Shadow utilities
  getShadowColor(): string {
    return this.getColor('shadow');
  }

  getShadowOpacity(): number {
    return this.isDarkMode() ? 0.3 : 0.1;
  }
}

export default new ThemeService();
