# دليل النشر في Vercel - Global Hedge AI

## المشكلة الحالية
Vercel لا يدعم SQLite في الإنتاج، ويحتاج إلى قاعدة بيانات PostgreSQL.

## الحل المطبق

### 1. تحديث Prisma Schema
تم تحديث `prisma/schema.prisma` لاستخدام PostgreSQL بدلاً من SQLite:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  extensions = [pgcrypto]
}
```

### 2. إعداد قاعدة البيانات في Vercel

#### أ) إنشاء قاعدة بيانات PostgreSQL
1. اذهب إلى [Supabase](https://supabase.com) أو [Railway](https://railway.app)
2. أنشئ مشروع جديد
3. احصل على رابط الاتصال (Connection String)

#### ب) إضافة متغيرات البيئة في Vercel
1. اذهب إلى مشروعك في Vercel Dashboard
2. اذهب إلى Settings > Environment Variables
3. أضف المتغيرات التالية:

```
DATABASE_URL=postgresql://username:password@host:port/database
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
SESSION_SECRET=your-super-secret-key-here
COMPANY_WALLET_ADDRESS=TYourCompanyWalletAddressHere
NODE_ENV=production
```

### 3. تشغيل Migration
بعد إضافة متغيرات البيئة، قم بتشغيل:

```bash
npx prisma migrate deploy
```

### 4. إعادة النشر
قم بإعادة نشر المشروع في Vercel.

## ملفات التكوين المحدثة

- ✅ `prisma/schema.prisma` - محدث لـ PostgreSQL
- ✅ `.env.example` - مثال على متغيرات البيئة
- ✅ `.env.local` - للتطوير المحلي

## ملاحظات مهمة

1. **تأكد من إضافة جميع متغيرات البيئة في Vercel**
2. **استخدم مفتاح SESSION_SECRET قوي للإنتاج**
3. **غيّر COMPANY_WALLET_ADDRESS لعنوان محفظتك الحقيقي**
4. **تأكد من أن قاعدة البيانات PostgreSQL تعمل قبل النشر**

## اختبار النشر

بعد النشر، تحقق من:
- ✅ لا توجد أخطاء في Build Logs
- ✅ الموقع يعمل بشكل صحيح
- ✅ قاعدة البيانات متصلة
- ✅ جميع الوظائف تعمل

## الدعم

إذا واجهت مشاكل:
1. تحقق من Build Logs في Vercel
2. تأكد من صحة متغيرات البيئة
3. تحقق من اتصال قاعدة البيانات
