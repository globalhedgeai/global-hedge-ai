# 🔧 Global Hedge AI - Environment Configuration

## 📋 **متغيرات البيئة المطلوبة**

### **1. إعدادات قاعدة البيانات**
```env
# PostgreSQL للإنتاج
DATABASE_URL="postgresql://postgres:YOUR_SECURE_PASSWORD@postgres:5432/global_hedge_ai?schema=public"

# SQLite للتطوير
# DATABASE_URL="file:./dev.db"
```

### **2. إعدادات Next.js**
```env
NODE_ENV=production
NEXTAUTH_SECRET="YOUR_SUPER_SECRET_KEY_HERE_MINIMUM_32_CHARACTERS"
NEXTAUTH_URL="https://yourdomain.com"
```

### **3. إعدادات Cloudflare R2 (التخزين السحابي)**
```env
CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key-id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-access-key"
CLOUDFLARE_R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
CLOUDFLARE_R2_BUCKET_NAME="global-hedge-ai-storage"
```

### **4. عناوين العملات المشفرة**
```env
# استبدل هذه العناوين بعناوينك الحقيقية
NEXT_PUBLIC_USDT_TRC20_ADDRESS="TKaAamEouHjG9nZwoTPhgYUerejbBHGMop"
NEXT_PUBLIC_USDT_ERC20_ADDRESS="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
NEXT_PUBLIC_BTC_ADDRESS="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
NEXT_PUBLIC_ETH_ADDRESS="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
NEXT_PUBLIC_BNB_ADDRESS="bnb1..."
NEXT_PUBLIC_ADA_ADDRESS="addr1..."
NEXT_PUBLIC_SOL_ADDRESS="So11111111111111111111111111111111111111112"
NEXT_PUBLIC_MATIC_ADDRESS="0x..."
NEXT_PUBLIC_AVAX_ADDRESS="0x..."
NEXT_PUBLIC_DOT_ADDRESS="1..."
```

### **5. إعدادات قاعدة البيانات المتقدمة**
```env
POSTGRES_PASSWORD="YOUR_SECURE_DB_PASSWORD"
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_POOL_IDLE_TIMEOUT=30000
DATABASE_POOL_CONNECTION_TIMEOUT=60000
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

### **6. إعدادات الأمان**
```env
CORS_ORIGIN="https://yourdomain.com"
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000
```

### **7. إعدادات النسخ الاحتياطية**
```env
BACKUP_ENABLED=true
BACKUP_FREQUENCY=daily
BACKUP_RETENTION_DAYS=30
BACKUP_ENCRYPTION=true
```

### **8. إعدادات البريد الإلكتروني (اختياري)**
```env
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"
```

### **9. إعدادات المراقبة (اختياري)**
```env
SENTRY_DSN="your-sentry-dsn"
ANALYTICS_ID="your-analytics-id"
```

### **10. إعدادات Redis (اختياري للتخزين المؤقت)**
```env
REDIS_URL="redis://localhost:6379"
```

---

## 🔐 **نصائح الأمان**

### **كلمات المرور القوية**
- استخدم كلمات مرور معقدة (32+ حرف)
- تجمع بين الأحرف الكبيرة والصغيرة والأرقام والرموز
- لا تستخدم نفس كلمة المرور في أماكن متعددة

### **مفاتيح API**
- احتفظ بمفاتيح Cloudflare R2 في مكان آمن
- لا تشاركها في الكود أو المستودعات العامة
- استخدم متغيرات البيئة دائماً

### **عناوين العملات المشفرة**
- تأكد من صحة العناوين قبل النشر
- اختبر الإيداعات بمبالغ صغيرة أولاً
- احتفظ بنسخة احتياطية من العناوين

---

## 📝 **ملف البيئة الكامل**

```env
# ===========================================
# Global Hedge AI - Production Environment
# ===========================================

# Database Configuration
DATABASE_URL="postgresql://postgres:YOUR_SECURE_PASSWORD@postgres:5432/global_hedge_ai?schema=public"
POSTGRES_PASSWORD="YOUR_SECURE_DB_PASSWORD"

# Next.js Configuration
NODE_ENV=production
NEXTAUTH_SECRET="YOUR_SUPER_SECRET_KEY_HERE_MINIMUM_32_CHARACTERS"
NEXTAUTH_URL="https://yourdomain.com"

# Cloudflare R2 Storage
CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key-id"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-access-key"
CLOUDFLARE_R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
CLOUDFLARE_R2_BUCKET_NAME="global-hedge-ai-storage"

# Cryptocurrency Addresses (Replace with your actual addresses)
NEXT_PUBLIC_USDT_TRC20_ADDRESS="TKaAamEouHjG9nZwoTPhgYUerejbBHGMop"
NEXT_PUBLIC_USDT_ERC20_ADDRESS="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
NEXT_PUBLIC_BTC_ADDRESS="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
NEXT_PUBLIC_ETH_ADDRESS="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
NEXT_PUBLIC_BNB_ADDRESS="bnb1..."
NEXT_PUBLIC_ADA_ADDRESS="addr1..."
NEXT_PUBLIC_SOL_ADDRESS="So11111111111111111111111111111111111111112"
NEXT_PUBLIC_MATIC_ADDRESS="0x..."
NEXT_PUBLIC_AVAX_ADDRESS="0x..."
NEXT_PUBLIC_DOT_ADDRESS="1..."

# Database Performance
DATABASE_POOL_MIN=2
DATABASE_POOL_MAX=10
DATABASE_POOL_IDLE_TIMEOUT=30000
DATABASE_POOL_CONNECTION_TIMEOUT=60000
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false

# Security
CORS_ORIGIN="https://yourdomain.com"
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_FREQUENCY=daily
BACKUP_RETENTION_DAYS=30
BACKUP_ENCRYPTION=true

# Email Configuration (Optional)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Monitoring (Optional)
SENTRY_DSN="your-sentry-dsn"
ANALYTICS_ID="your-analytics-id"

# Redis (Optional for caching)
REDIS_URL="redis://localhost:6379"
```

---

## 🚀 **خطوات الإعداد**

### **1. إنشاء ملف البيئة**
```bash
cp docs/production-env.example .env.production
```

### **2. تحرير الملف**
```bash
nano .env.production
```

### **3. ملء القيم المطلوبة**
- استبدل `YOUR_SECURE_PASSWORD` بكلمة مرور قوية
- استبدل `YOUR_SUPER_SECRET_KEY_HERE` بمفتاح سري (32+ حرف)
- استبدل `yourdomain.com` بنطاقك
- أضف مفاتيح Cloudflare R2
- استبدل عناوين العملات المشفرة بعناوينك الحقيقية

### **4. التحقق من الإعدادات**
```bash
# فحص صحة الملف
cat .env.production | grep -v "^#" | grep -v "^$"
```

---

## ⚠️ **تحذيرات مهمة**

1. **لا تشارك ملف البيئة** في المستودعات العامة
2. **احتفظ بنسخة احتياطية** من ملف البيئة في مكان آمن
3. **اختبر الإعدادات** قبل النشر للإنتاج
4. **تأكد من صحة العناوين** قبل تفعيل الإيداعات
5. **استخدم كلمات مرور قوية** لجميع الحسابات

---

## 🔧 **استكشاف الأخطاء**

### **مشاكل شائعة:**

1. **خطأ في قاعدة البيانات:**
   - تحقق من صحة `DATABASE_URL`
   - تأكد من تشغيل PostgreSQL

2. **خطأ في Cloudflare R2:**
   - تحقق من صحة مفاتيح API
   - تأكد من وجود الـ bucket

3. **خطأ في SSL:**
   - تحقق من صحة `NEXTAUTH_URL`
   - تأكد من وجود شهادة SSL

4. **خطأ في العملات المشفرة:**
   - تحقق من صحة العناوين
   - تأكد من دعم الشبكة

---

## 📞 **الدعم**

إذا واجهت مشاكل في الإعداد:
1. راجع الوثائق في `docs/`
2. تحقق من السجلات: `docker-compose logs`
3. تأكد من صحة جميع المتغيرات
4. اتصل بالدعم الفني

**🎯 استمتع بمنصتك الجديدة!**
