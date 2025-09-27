# Market Page Documentation

## Overview
صفحة السوق تعرض مخططات الشموع اليابانية للعملات الرقمية مع إمكانية اختيار الرمز والفترة الزمنية.

## Features

### 1. MarketToolbar
شريط أدوات يحتوي على:
- **اختيار الرمز**: BTCUSDT, ETHUSDT
- **اختيار الفترة الزمنية**: 1m, 5m, 15m, 1h, 4h, 1d
- **زر التحديث**: لتحديث البيانات يدوياً

### 2. URL Parameters
الصفحة تدعم معاملات الرابط:
- `?symbol=BTCUSDT` - رمز التداول
- `?interval=1h` - الفترة الزمنية

**مثال**: `/market?symbol=ETHUSDT&interval=4h`

### 3. Client-Side Cache
- **TTL**: 30 ثانية
- **مفتاح الكاش**: `${symbol}:${interval}`
- **السلوك**: عرض البيانات المخزنة فوراً ثم تحديث بهدوء

### 4. Auto-Refresh
- تحديث تلقائي كل 10 ثوان
- إلغاء الطلبات المتداخلة باستخدام AbortController

### 5. Error Handling
- **401 Unauthorized**: توجيه تلقائي لصفحة تسجيل الدخول
- رسائل خطأ باللغة العربية

## API Endpoints

### GET /api/market/candles
**Parameters**:
- `symbol` (string): رمز التداول (BTCUSDT, ETHUSDT)
- `interval` (string): الفترة الزمنية (1m, 5m, 15m, 1h, 4h, 1d)
- `limit` (number): عدد الشموع (افتراضي: 200)

**Response**:
```json
{
  "ok": true,
  "symbol": "BTCUSDT",
  "interval": "1h",
  "candles": [
    {
      "time": 1640995200,
      "open": 45000,
      "high": 46000,
      "low": 44000,
      "close": 45500,
      "volume": 1000
    }
  ]
}
```

## Usage Examples

### Basic Usage
```typescript
// Navigate to market page
router.push('/market');

// With specific symbol and interval
router.push('/market?symbol=ETHUSDT&interval=4h');
```

### Programmatic Updates
```typescript
// Update symbol
setSymbol('ETHUSDT');
router.replace('/market?symbol=ETHUSDT&interval=1h', { scroll: false });

// Update interval
setInterval('4h');
router.replace('/market?symbol=BTCUSDT&interval=4h', { scroll: false });
```

## Technical Details

### Dependencies
- `lightweight-charts`: مكتبة الرسوم البيانية
- `next/navigation`: للتنقل وإدارة URL
- `React`: إدارة الحالة والمكونات

### State Management
- `symbol`: رمز التداول الحالي
- `interval`: الفترة الزمنية الحالية
- `candles`: بيانات الشموع
- `loading`: حالة التحميل

### Performance Optimizations
- كاش العميل لتقليل الطلبات
- إلغاء الطلبات المتداخلة
- تحديث URL بدون إعادة تحميل الصفحة
- ResizeObserver لتحسين الأداء

## Troubleshooting

### Common Issues
1. **401 Error**: تأكد من تسجيل الدخول
2. **Empty Chart**: تحقق من اتصال الإنترنت
3. **Slow Loading**: تحقق من حالة الخادم

### Debug Mode
```typescript
// Enable console logging
console.log('Current symbol:', symbol);
console.log('Current interval:', interval);
console.log('Cache status:', cache.has(`${symbol}:${interval}`));
```
