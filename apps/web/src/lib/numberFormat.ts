// Number formatting utility based on locale
export function formatNumber(number: number, locale: string = 'en'): string {
  // Force English numerals for English locale
  if (locale === 'en') {
    return number.toLocaleString('en-US');
  }
  
  // Use Arabic numerals for Arabic locale
  if (locale === 'ar') {
    return number.toLocaleString('ar-SA');
  }
  
  // Default to English numerals
  return number.toLocaleString('en-US');
}

export function formatCurrency(amount: number, locale: string = 'en'): string {
  if (locale === 'en') {
    return `$${amount.toFixed(2)}`;
  }
  
  if (locale === 'ar') {
    return `${amount.toFixed(2)} $`;
  }
  
  return `$${amount.toFixed(2)}`;
}

export function formatPercentage(value: number, locale: string = 'en'): string {
  if (locale === 'en') {
    return `${value.toFixed(2)}%`;
  }
  
  if (locale === 'ar') {
    return `%${value.toFixed(2)}`;
  }
  
  return `${value.toFixed(2)}%`;
}
