# ⚡ **دليل النشر السريع - 10 دقائق**

## 🎯 **الخطوات الأساسية فقط**

---

### **1️⃣ إنشاء قاعدة بيانات (2 دقيقة)**

**استخدم Supabase (مجاني):**

1. اذهب إلى: https://supabase.com
2. اضغط "Start your project" → سجل بـ GitHub
3. اضغط "New Project"
4. اختر:
   - Name: `global-hedge-ai`
   - Password: اختر كلمة مرور قوية (احفظها!)
   - Region: `West Europe` أو الأقرب لك
5. اضغط "Create new project" → انتظر 2 دقيقة
6. اذهب إلى Settings → Database → Connection string
7. انسخ الرابط (يبدأ بـ `postgresql://...`)
8. **مهم:** استبدل `[YOUR-PASSWORD]` بكلمة المرور

✅ **جاهز!** احفظ هذا الرابط

---

### **2️⃣ رفع الكود على GitHub (3 دقائق)**

```bash
# في terminal:
git init
git add .
git commit -m "Initial commit"

# أنشئ repository على GitHub:
# https://github.com/new → اسمه: global-hedge-ai

git remote add origin https://github.com/YOUR-USERNAME/global-hedge-ai.git
git branch -M main
git push -u origin main
```

✅ **جاهز!** الكود الآن على GitHub

---

### **3️⃣ النشر على Vercel (3 دقائق)**

1. اذهب إلى: https://vercel.com
2. اضغط "Sign Up" → سجل بـ GitHub
3. اضغط "Add New..." → "Project"
4. اختر repository `global-hedge-ai`
5. اضغط "Import"
6. في "Configure Project":
   - Framework: `Next.js`
   - Root Directory: `apps/web`
7. اضغط "Environment Variables"
8. أضف:

| Name | Value |
|------|-------|
| `DATABASE_URL` | الرابط من Supabase |
| `SESSION_SECRET` | أي نص عشوائي طويل (30+ حرف) |
| `COMPANY_WALLET_ADDRESS` | عنوان محفظتك (USDT TRC20) |
| `NODE_ENV` | `production` |

9. اضغط "Deploy" → انتظر 3 دقائق

✅ **جاهز!** ستحصل على رابط مثل: `https://your-app.vercel.app`

---

### **4️⃣ تحديث رابط الموقع (1 دقيقة)**

1. انسخ الرابط الذي حصلت عليه
2. في Vercel → Settings → Environment Variables
3. أضف متغير جديد:
   - Name: `NEXT_PUBLIC_BASE_URL`
   - Value: `https://your-app.vercel.app`
4. اضغط "Save"
5. اذهب إلى Deployments → اضغط "Redeploy"

✅ **جاهز!**

---

### **5️⃣ تطبيق Schema على قاعدة البيانات (1 دقيقة)**

```bash
# على جهازك:
cd apps/web

# أنشئ ملف .env وضع فيه رابط قاعدة البيانات:
DATABASE_URL="postgresql://postgres:YOUR-PASSWORD@db.xxx.supabase.co:5432/postgres"

# طبّق Schema:
npx prisma db push
```

✅ **جاهز!** قاعدة البيانات جاهزة

---

## 🎉 **انتهينا! موقعك الآن شغال!**

**الرابط:** https://your-app.vercel.app

---

## ⚠️ **مهم جداً:**

### **المعلومات التي يجب تغييرها:**

1. ✅ `DATABASE_URL` - من Supabase
2. ✅ `SESSION_SECRET` - نص عشوائي قوي
3. ✅ `COMPANY_WALLET_ADDRESS` - عنوان محفظتك
4. ✅ `NEXT_PUBLIC_BASE_URL` - رابط موقعك

### **لا تنسى:**
- احفظ جميع كلمات المرور والمفاتيح في مكان آمن
- لا تشارك `SESSION_SECRET` مع أحد
- خذ نسخة احتياطية من قاعدة البيانات

---

## 🆘 **حل المشاكل:**

### **إذا ظهر خطأ في Vercel:**
1. اذهب إلى Vercel → Your Project → "Functions" → "Logs"
2. شوف الخطأ بالتفصيل
3. غالباً المشكلة في المتغيرات البيئية

### **إذا قاعدة البيانات لا تعمل:**
1. تأكد من صحة `DATABASE_URL`
2. جرب الاتصال من جهازك:
```bash
npx prisma studio
```

---

## 📱 **التطبيق المحمول (اختياري):**

سيتم شرحه لاحقاً بعد نجاح الموقع

---

**🔥 مبروك! موقعك الآن في الإنترنت!**

**الوقت المستغرق:** 10 دقائق  
**التكلفة:** مجاني (للبداية)

