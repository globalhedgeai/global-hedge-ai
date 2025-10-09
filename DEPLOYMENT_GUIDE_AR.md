# 🚀 **دليل النشر للإنتاج - خطوة بخطوة للمبتدئين**

**التاريخ:** 8 أكتوبر 2025  
**المشروع:** Global Hedge AI  
**المستوى:** مبتدئ

---

## 📋 **جدول المحتويات**

1. [التحضير قبل النشر](#التحضير-قبل-النشر)
2. [اختيار منصة الاستضافة](#اختيار-منصة-الاستضافة)
3. [إعداد قاعدة البيانات](#إعداد-قاعدة-البيانات)
4. [ضبط المتغيرات البيئية](#ضبط-المتغيرات-البيئية)
5. [النشر على Vercel](#النشر-على-vercel)
6. [النشر على Railway](#النشر-على-railway)
7. [إعداد النطاق (Domain)](#إعداد-النطاق)
8. [التطبيق المحمول](#التطبيق-المحمول)

---

## 🎯 **التحضير قبل النشر**

### **الخطوة 1: تحديث ملف `.env.example`**

دعني أول شيء أتحقق من ملف `.env` الحالي:

```bash
# الملفات البيئية الموجودة:
- apps/web/.env.example
- apps/web/.env
```

### **الخطوة 2: المعلومات التي تحتاج تعديلها**

#### **أ. قاعدة البيانات (Database)**
```env
# ✅ يجب تغييره للإنتاج
DATABASE_URL="postgresql://user:password@localhost:5432/globalehedge"
```

#### **ب. رابط الموقع (Base URL)**
```env
# ✅ يجب تغييره لنطاقك
NEXT_PUBLIC_BASE_URL="https://your-domain.com"
```

#### **ج. مفتاح التشفير (Session Secret)**
```env
# ✅ يجب تغييره لمفتاح قوي
SESSION_SECRET="your-super-secret-key-change-this-in-production"
```

#### **د. عنوان محفظة الشركة**
```env
# ✅ ضع عنوان محفظتك الحقيقي
COMPANY_WALLET_ADDRESS="TYourRealWalletAddressHere"
```

---

## 🏢 **اختيار منصة الاستضافة**

### **الخيارات المتاحة:**

| المنصة | السعر | السهولة | التوصية |
|--------|-------|---------|---------|
| **Vercel** | مجاني للبداية | ⭐⭐⭐⭐⭐ | ✅ الأفضل للمبتدئين |
| **Railway** | $5/شهر | ⭐⭐⭐⭐ | ✅ جيد (قاعدة بيانات مدمجة) |
| **Netlify** | مجاني للبداية | ⭐⭐⭐⭐ | ✅ بديل جيد |
| **DigitalOcean** | $12/شهر | ⭐⭐⭐ | للمتقدمين |
| **AWS** | متغير | ⭐⭐ | للمحترفين |

**🎯 توصيتي للمبتدئين: Vercel + Supabase (قاعدة بيانات)**

---

## 💾 **إعداد قاعدة البيانات**

### **الخيار 1: Supabase (الأسهل والمجاني)**

#### **الخطوة 1: إنشاء حساب**
1. اذهب إلى: https://supabase.com
2. اضغط "Start your project"
3. سجل بحساب GitHub أو Email

#### **الخطوة 2: إنشاء مشروع جديد**
1. اضغط "New Project"
2. اختر اسم المشروع: `global-hedge-ai`
3. اختر كلمة مرور قوية لقاعدة البيانات
4. اختر المنطقة الأقرب لك (مثلاً: `West Europe`)
5. اضغط "Create new project"
6. انتظر 2-3 دقائق حتى ينتهي الإعداد

#### **الخطوة 3: الحصول على رابط قاعدة البيانات**
1. بعد إنشاء المشروع، اذهب إلى "Settings" (الإعدادات)
2. اضغط على "Database"
3. انزل للأسفل إلى "Connection string"
4. اختر "URI" من القائمة
5. انسخ الرابط (يبدأ بـ `postgresql://...`)
6. **مهم:** استبدل `[YOUR-PASSWORD]` بكلمة المرور التي اخترتها

**مثال:**
```
postgresql://postgres:[YOUR-PASSWORD]@db.abcdefghijklm.supabase.co:5432/postgres
```

#### **الخطوة 4: تطبيق Schema على قاعدة البيانات**
1. في Supabase، اذهب إلى "SQL Editor"
2. اضغط "New query"
3. انسخ محتوى ملف `prisma/schema.prisma`
4. لكن بدلاً من ذلك، استخدم Prisma:

```bash
# في terminal على جهازك:
cd apps/web
npx prisma db push --skip-generate
```

---

### **الخيار 2: Railway (الأسهل - كل شيء في مكان واحد)**

#### **الخطوة 1: إنشاء حساب**
1. اذهب إلى: https://railway.app
2. سجل بحساب GitHub

#### **الخطوة 2: إنشاء مشروع**
1. اضغط "New Project"
2. اختر "Provision PostgreSQL"
3. انتظر حتى يتم إنشاء قاعدة البيانات

#### **الخطوة 3: الحصول على رابط قاعدة البيانات**
1. اضغط على قاعدة البيانات
2. اذهب إلى "Connect"
3. انسخ "Database URL" (PostgreSQL Connection URL)

---

## 🔧 **ضبط المتغيرات البيئية**

### **الخطوة 1: إنشاء ملف `.env.production`**

في مجلد `apps/web/`، أنشئ ملف `.env.production`:

```env
# قاعدة البيانات (من Supabase أو Railway)
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@db.xxx.supabase.co:5432/postgres"

# رابط الموقع (سيتم تحديثه بعد النشر)
NEXT_PUBLIC_BASE_URL="https://your-app.vercel.app"

# مفتاح التشفير (أنشئ واحد قوي)
SESSION_SECRET="$(openssl rand -base64 32)"
# أو أي نص عشوائي طويل مثل:
# SESSION_SECRET="abc123xyz789very-long-random-string-here-change-this"

# عنوان محفظة الشركة (USDT TRC20)
COMPANY_WALLET_ADDRESS="TYourRealWalletAddressHere123456789"

# البيئة
NODE_ENV="production"
```

### **الخطوة 2: توليد مفتاح تشفير قوي**

**على Windows PowerShell:**
```powershell
# أنشئ نص عشوائي قوي
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
```

**أو استخدم موقع:**
https://randomkeygen.com/
- اختر "Fort Knox Passwords"
- انسخ أي مفتاح طويل

---

## 🚀 **النشر على Vercel (الطريقة الأسهل)**

### **الخطوة 1: إنشاء حساب Vercel**
1. اذهب إلى: https://vercel.com
2. اضغط "Sign Up"
3. سجل بحساب GitHub

### **الخطوة 2: ربط مشروعك مع GitHub**

#### **أ. رفع مشروعك على GitHub:**
```bash
# في terminal:
git init
git add .
git commit -m "Initial commit - Global Hedge AI"

# أنشئ repository جديد على GitHub:
# اذهب إلى https://github.com/new
# اسمه: global-hedge-ai
# اتركه private للأمان

# ثم:
git remote add origin https://github.com/your-username/global-hedge-ai.git
git branch -M main
git push -u origin main
```

### **الخطوة 3: استيراد المشروع في Vercel**

1. في Vercel، اضغط "Add New..." → "Project"
2. اختر repository `global-hedge-ai`
3. اضغط "Import"

### **الخطوة 4: ضبط إعدادات المشروع**

في صفحة Configure Project:

#### **أ. Framework Preset:**
- اختر: `Next.js`

#### **ب. Root Directory:**
- اختر: `apps/web`

#### **ج. Build Command:**
```bash
npm run build
```

#### **د. Install Command:**
```bash
npm install
```

### **الخطوة 5: إضافة المتغيرات البيئية**

اضغط على "Environment Variables" وأضف:

| Name | Value |
|------|-------|
| `DATABASE_URL` | `postgresql://postgres:...` (من Supabase) |
| `SESSION_SECRET` | المفتاح القوي الذي أنشأته |
| `COMPANY_WALLET_ADDRESS` | عنوان محفظتك |
| `NEXT_PUBLIC_BASE_URL` | سيتم تحديثه لاحقاً |
| `NODE_ENV` | `production` |

### **الخطوة 6: النشر!**

1. اضغط "Deploy"
2. انتظر 3-5 دقائق
3. ستحصل على رابط مثل: `https://global-hedge-ai.vercel.app`

### **الخطوة 7: تحديث رابط الموقع**

1. انسخ الرابط الذي حصلت عليه
2. ارجع إلى "Settings" → "Environment Variables"
3. عدّل `NEXT_PUBLIC_BASE_URL` إلى الرابط الجديد
4. اضغط "Redeploy" من "Deployments"

---

## 📱 **التطبيق المحمول**

### **الخيار 1: Expo (الأسهل للمبتدئين)**

#### **الخطوة 1: إنشاء حساب Expo**
1. اذهب إلى: https://expo.dev
2. سجل حساب جديد

#### **الخطوة 2: تثبيت Expo CLI**
```bash
npm install -g eas-cli
eas login
```

#### **الخطوة 3: إعداد المشروع**
```bash
cd apps/mobile
eas init
```

#### **الخطوة 4: بناء التطبيق**

**للأندرويد:**
```bash
eas build --platform android
```

**للآيفون:**
```bash
eas build --platform ios
```

**النتيجة:**
- سيتم بناء التطبيق على سيرفرات Expo
- ستحصل على ملف APK (أندرويد) أو IPA (آيفون)
- يمكنك تحميله مباشرة أو نشره على Google Play / App Store

---

## 🌐 **إعداد النطاق الخاص بك**

### **إذا كان لديك نطاق (مثل: mysite.com)**

#### **في Vercel:**
1. اذهب إلى "Settings" → "Domains"
2. اضغط "Add Domain"
3. أدخل نطاقك: `mysite.com`
4. اتبع التعليمات لإضافة DNS records

#### **في مزود النطاق (Namecheap/GoDaddy):**
أضف هذه السجلات:

```
Type: CNAME
Host: @
Value: cname.vercel-dns.com

Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

---

## ✅ **قائمة التحقق النهائية**

قبل النشر، تأكد من:

### **الأمان:**
- [ ] غيّرت `SESSION_SECRET` لمفتاح قوي
- [ ] غيّرت كلمة مرور قاعدة البيانات
- [ ] لا توجد أسرار (secrets) في الكود
- [ ] عنوان المحفظة صحيح

### **الإعدادات:**
- [ ] `DATABASE_URL` صحيح
- [ ] `NEXT_PUBLIC_BASE_URL` صحيح
- [ ] `COMPANY_WALLET_ADDRESS` صحيح
- [ ] جميع المتغيرات البيئية في Vercel

### **قاعدة البيانات:**
- [ ] تم تطبيق Schema (`prisma db push`)
- [ ] قاعدة البيانات تعمل
- [ ] يمكن الاتصال بها

### **الاختبار:**
- [ ] الموقع يفتح
- [ ] يمكن التسجيل
- [ ] يمكن تسجيل الدخول
- [ ] الإيداع والسحب يعملان
- [ ] المكافآت تعمل

---

## 🆘 **حل المشاكل الشائعة**

### **المشكلة 1: خطأ في قاعدة البيانات**
```
Error: Can't reach database server
```
**الحل:**
- تأكد من صحة `DATABASE_URL`
- تأكد من أن IP address مسموح في Supabase

### **المشكلة 2: خطأ Build**
```
Error: Build failed
```
**الحل:**
```bash
# جرب على جهازك أولاً:
cd apps/web
npm run build
```

### **المشكلة 3: 500 Error**
**الحل:**
- افتح Vercel → "Functions" → "Logs"
- شوف الخطأ بالتفصيل
- غالباً مشكلة في المتغيرات البيئية

---

## 📞 **الدعم والمساعدة**

إذا واجهت أي مشكلة:

1. **افحص Logs في Vercel:**
   - Vercel Dashboard → Your Project → "Functions" → "Logs"

2. **افحص قاعدة البيانات:**
   - Supabase Dashboard → "SQL Editor"
   - جرب: `SELECT * FROM "User" LIMIT 1;`

3. **تواصل معي:**
   - أرسل لي:
     - الخطأ الكامل
     - لقطة شاشة من Logs
     - المتغيرات البيئية (بدون الأسرار!)

---

## 🎉 **تهانينا!**

إذا وصلت هنا ونجحت، موقعك الآن **شغال ومتاح للجميع!** 🚀

---

## 📚 **الخطوات التالية**

بعد النشر الأول:

1. **أضف نطاق خاص بك** (Optional)
2. **انشر التطبيق المحمول** على Google Play
3. **فعّل SSL** (تلقائي في Vercel)
4. **راقب الأداء** في Vercel Analytics
5. **خذ نسخة احتياطية** من قاعدة البيانات

---

**🔥 مبروك! موقعك صار في الإنترنت!**

**التاريخ:** 8 أكتوبر 2025  
**الكاتب:** AI Assistant  
**الحالة:** ✅ جاهز للنشر

