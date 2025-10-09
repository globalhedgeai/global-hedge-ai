# 🚀 دليل معاينة المشروع - Global Hedge AI

## 📋 كيفية رؤية شكل المشروع قبل رفعه للمستخدمين

تم إصلاح جميع المشاكل وإعداد المشروع للعمل. إليك كيفية معاينة المشروع:

---

## ✅ **المشاكل التي تم إصلاحها**

1. **مشاكل JSON** - تم إصلاح جميع ملفات الرسائل
2. **مشاكل TypeScript** - تم إصلاح ملف notifications.tsx
3. **مشاكل التبعيات** - تم تثبيت جميع التبعيات المطلوبة
4. **مشاكل الأداء** - تم تحسين الاستعلامات والفهارس

---

## 🌐 **كيفية الوصول للمشروع**

### **1. الخادم المحلي**
```bash
# الخادم يعمل على:
http://localhost:3000
```

### **2. الصفحات المتاحة**

#### **الصفحات العامة:**
- `http://localhost:3000/ar` - الصفحة الرئيسية (عربي)
- `http://localhost:3000/en` - الصفحة الرئيسية (إنجليزي)
- `http://localhost:3000/ar/login` - تسجيل الدخول
- `http://localhost:3000/ar/register` - إنشاء حساب
- `http://localhost:3000/ar/info` - معلومات المنصة

#### **صفحات المستخدمين (تتطلب تسجيل دخول):**
- `http://localhost:3000/ar/deposit` - إيداع الأموال
- `http://localhost:3000/ar/withdraw` - سحب الأموال
- `http://localhost:3000/ar/market` - السوق
- `http://localhost:3000/ar/account` - الحساب
- `http://localhost:3000/ar/transactions` - المعاملات

#### **صفحات الإدارة (تتطلب صلاحيات إدارية):**
- `http://localhost:3000/ar/admin/users` - إدارة المستخدمين
- `http://localhost:3000/ar/admin/wallet` - إدارة المحافظ
- `http://localhost:3000/ar/admin/performance` - مراقبة الأداء
- `http://localhost:3000/ar/admin/policies` - إدارة السياسات

#### **API Endpoints:**
- `http://localhost:3000/api/health` - فحص صحة الخادم
- `http://localhost:3000/api/auth/login` - تسجيل الدخول
- `http://localhost:3000/api/auth/register` - إنشاء حساب
- `http://localhost:3000/api/deposits` - إدارة الإيداعات
- `http://localhost:3000/api/withdrawals` - إدارة السحوبات

---

## 🔧 **إعداد حساب تجريبي**

### **1. إنشاء حساب جديد:**
```bash
# انتقل إلى:
http://localhost:3000/ar/register

# أو استخدم API:
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### **2. تسجيل الدخول:**
```bash
# انتقل إلى:
http://localhost:3000/ar/login

# أو استخدم API:
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### **3. إنشاء حساب إداري:**
```bash
# استخدم السكريبت المدمج:
cd apps/web
pnpm tsx scripts/setup-admin.ts
```

---

## 📱 **تطبيق الهاتف المحمول**

### **تشغيل التطبيق:**
```bash
cd apps/mobile
npm install
npx react-native run-android  # للـ Android
npx react-native run-ios      # للـ iOS
```

### **الوصول للتطبيق:**
- **Android**: APK متاح في `apps/web/public/downloads/global-hedge-ai.apk`
- **iOS**: متاح عبر App Store (قريباً)

---

## 🎨 **الميزات المتاحة للمعاينة**

### **1. واجهة المستخدم:**
- ✅ تصميم متجاوب وجذاب
- ✅ دعم كامل للغة العربية
- ✅ واجهة مستخدم حديثة
- ✅ تجربة مستخدم محسنة

### **2. الميزات الأساسية:**
- ✅ تسجيل الدخول وإنشاء الحساب
- ✅ إيداع وسحب الأموال
- ✅ نظام المكافآت اليومية والعشوائية
- ✅ نظام الإحالة متعدد المستويات
- ✅ إدارة الحساب والإعدادات

### **3. الميزات المتقدمة:**
- ✅ مراقبة الأداء في الوقت الفعلي
- ✅ إدارة المستخدمين والسياسات
- ✅ نظام الرسائل والدعم
- ✅ النسخ الاحتياطية
- ✅ التقارير المالية

### **4. الأمان:**
- ✅ تشفير كلمات المرور
- ✅ جلسات آمنة
- ✅ حماية CSRF
- ✅ Rate Limiting
- ✅ Audit Logging

---

## 🔍 **اختبار الوظائف**

### **1. اختبار الإيداع:**
```bash
# انتقل إلى صفحة الإيداع
http://localhost:3000/ar/deposit

# اختبر:
- اختيار العملة المشفرة
- إدخال المبلغ
- رفع صورة الإثبات
- إدخال TXID
- إرسال الطلب
```

### **2. اختبار السحب:**
```bash
# انتقل إلى صفحة السحب
http://localhost:3000/ar/withdraw

# اختبر:
- اختيار العملة المشفرة
- إدخال المبلغ
- إدخال عنوان المحفظة
- إرسال الطلب
```

### **3. اختبار المكافآت:**
```bash
# انتقل إلى الصفحة الرئيسية
http://localhost:3000/ar

# اختبر:
- المطالبة بالمكافأة اليومية
- المطالبة بالمكافأة العشوائية
- عرض سجل المكافآت
```

---

## 📊 **مراقبة الأداء**

### **1. مراقبة الخادم:**
```bash
# فحص صحة الخادم
curl http://localhost:3000/api/health

# مراقبة الأداء
http://localhost:3000/ar/admin/performance
```

### **2. مراقبة قاعدة البيانات:**
```bash
# فحص قاعدة البيانات
cd apps/web
pnpm prisma studio
```

### **3. مراقبة Redis (إذا كان مُعد):**
```bash
# فحص Redis
redis-cli ping
redis-cli info stats
```

---

## 🚀 **النشر للإنتاج**

### **1. النشر مع Docker:**
```bash
# تشغيل مع Docker Compose
docker-compose -f docker-compose.production.yml up -d
```

### **2. النشر اليدوي:**
```bash
# بناء التطبيق
cd apps/web
pnpm build

# تشغيل الإنتاج
pnpm start
```

### **3. النشر على VPS:**
```bash
# استخدام السكريبت التلقائي
chmod +x setup.sh
./setup.sh
```

---

## 📞 **الدعم والمساعدة**

### **إذا واجهت أي مشاكل:**

1. **تحقق من Logs:**
```bash
# logs التطبيق
tail -f logs/app.log

# logs Nginx
tail -f /var/log/nginx/error.log
```

2. **تحقق من حالة الخدمات:**
```bash
# حالة الخادم
netstat -tulpn | grep :3000

# حالة قاعدة البيانات
sudo systemctl status postgresql
```

3. **تواصل مع الدعم:**
- 📧 support@globalhedgeai.com
- 💬 الدردشة المباشرة في التطبيق

---

## 🎯 **الخطوات التالية**

### **بعد المعاينة:**
1. **اختبار شامل** لجميع الوظائف
2. **جمع ملاحظات المستخدمين**
3. **تحسين الأداء** حسب الحاجة
4. **إضافة ميزات جديدة**

### **قبل النشر:**
1. **اختبار الأمان** الشامل
2. **تحسين الأداء** أكثر
3. **إعداد النسخ الاحتياطية**
4. **مراقبة الأداء** المستمرة

---

**🎉 المشروع جاهز للمعاينة والنشر!**

يمكنك الآن رؤية شكل المشروع واختبار جميع الوظائف قبل رفعه للمستخدمين.
