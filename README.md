# 🚀 Global Hedge AI - منصة التعدين السحابي

## 📋 **نظرة عامة**

منصة Global Hedge AI هي منصة متقدمة للتعدين السحابي والعملات المشفرة، مصممة لتوفير تجربة مستخدم متميزة مع إدارة شاملة للمعاملات والمكافآت.

## ✨ **المميزات الرئيسية**

### 🎯 **للمستخدمين**
- 💰 **إيداع وسحب آمن** مع دعم عملات متعددة
- 🎁 **مكافآت يومية وعشوائية** مع نظام شرائح متقدم
- 📊 **تقارير مالية مفصلة** مع رسوم بيانية تفاعلية
- 🔍 **بحث متقدم في المعاملات** مع تصدير البيانات
- 🌍 **دعم 5 لغات** (العربية، الإنجليزية، الإسبانية، الفرنسية، التركية)
- 📱 **واجهة مستخدم متقدمة** مع تخصيص كامل للوحة المعلومات
- 🆘 **دليل المستخدم التفاعلي** للمساعدة

### 🛠️ **للإدارة**
- 👥 **إدارة المستخدمين** مع أدوار متعددة (ADMIN, SUPPORT, ACCOUNTING)
- 💬 **نظام الرسائل والدعم** مع تتبع المحادثات
- 📈 **مراقبة الأداء** مع إحصائيات مفصلة واتجاهات
- 💾 **نظام النسخ الاحتياطي** مع استعادة سريعة
- 🔒 **أمان متقدم** مع SSL وتشفير البيانات
- 📋 **إدارة السياسات** مع تحديثات فورية

## 🏗️ **التقنيات المستخدمة**

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: PostgreSQL (Production), SQLite (Development)
- **Storage**: Cloudflare R2 (S3-compatible)
- **Deployment**: Docker, Docker Compose, Nginx
- **Security**: SSL/TLS, CSRF Protection, Rate Limiting
- **Monitoring**: Custom Performance Monitoring, Health Checks

## 🚀 **النشر السريع**

### **الطريقة الأولى: السكريبت التلقائي**

```bash
# تحميل وتشغيل السكريبت
wget https://raw.githubusercontent.com/yourusername/global-hedge-ai/main/setup.sh
chmod +x setup.sh
./setup.sh
```

### **الطريقة الثانية: النشر اليدوي**

```bash
# 1. إعداد الخادم
sudo apt update && sudo apt upgrade -y
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# 2. استنساخ المشروع
git clone https://github.com/yourusername/global-hedge-ai.git
cd global-hedge-ai

# 3. إعداد البيئة
cp docs/production-env.example .env.production
nano .env.production

# 4. تشغيل التطبيق
docker-compose -f docker-compose.production.yml up -d
```

## 📚 **الوثائق**

- 📖 [دليل البدء السريع](docs/quick-start-guide.md)
- 🚀 [دليل النشر الكامل](docs/deployment-guide-arabic.md)
- 🗄️ [دليل هجرة PostgreSQL](docs/postgresql-migration.md)
- 🏭 [دليل النشر للإنتاج](docs/production-deployment.md)

## 🔧 **التطوير المحلي**

### **المتطلبات**
- Node.js 18+
- pnpm
- SQLite

### **التشغيل**

```bash
# تثبيت التبعيات
pnpm install

# إعداد قاعدة البيانات
npx prisma migrate dev

# تشغيل التطبيق
pnpm dev
```

## 👥 **الأدوار والصلاحيات**

| الدور | الصلاحيات | الوصف |
|-------|-----------|-------|
| **ADMIN** | صلاحيات كاملة | مدير النظام الرئيسي |
| **SUPPORT** | إدارة الدعم والرسائل | فريق خدمة العملاء |
| **ACCOUNTING** | إدارة المعاملات المالية | قسم المحاسبة |
| **USER** | المستخدم العادي | العملاء |

## 🔐 **الأمان**

- 🔒 **SSL/TLS** مع تحديث تلقائي
- 🛡️ **CSRF Protection** ضد الهجمات
- ⚡ **Rate Limiting** لمنع الإساءة
- 🔐 **تشفير كلمات المرور** مع bcrypt
- 📝 **Audit Logging** لتتبع جميع العمليات
- 💾 **نسخ احتياطية مشفرة** مع استعادة سريعة

## 📊 **المراقبة**

- 📈 **مراقبة الأداء** في الوقت الفعلي
- 🏥 **فحص الصحة** للنظام وقاعدة البيانات
- 📊 **إحصائيات مفصلة** للمستخدمين والمعاملات
- ⚠️ **تنبيهات النظام** للمشاكل المحتملة
- 📋 **سجلات مفصلة** لجميع العمليات

## 🌍 **الدعم متعدد اللغات**

- 🇸🇦 العربية (RTL)
- 🇺🇸 الإنجليزية
- 🇪🇸 الإسبانية
- 🇫🇷 الفرنسية
- 🇹🇷 التركية

## 📱 **الميزات المتقدمة**

### **للمستخدمين**
- 🎛️ **تخصيص لوحة المعلومات** مع إعادة ترتيب العناصر
- 🔍 **بحث متقدم** في المعاملات مع فلاتر متعددة
- 📊 **تصدير البيانات** بصيغ CSV و PDF
- 🎁 **نظام المكافآت** مع شرائح متدرجة (25%, 30%, 35%)
- 📱 **إشعارات Push** للمنصات الحديثة
- 🆘 **دليل تفاعلي** للمساعدة

### **للإدارة**
- 📈 **مراقبة الأداء** مع رسوم بيانية تفاعلية
- 💾 **إدارة النسخ الاحتياطية** مع جدولة تلقائية
- 👥 **إدارة المستخدمين** مع تحديث الأرصدة
- 💬 **نظام الرسائل** مع تتبع المحادثات
- 📋 **إدارة السياسات** مع تحديثات فورية

## 🚀 **النشر**

### **متطلبات الخادم**
- **RAM**: 4GB+ (8GB مفضل)
- **Storage**: 50GB+
- **CPU**: 2 cores+
- **OS**: Ubuntu 20.04+ أو CentOS 8+

### **الخدمات المطلوبة**
- Docker & Docker Compose
- PostgreSQL 15+
- SSL Certificate (Let's Encrypt)
- Domain Name

## 📞 **الدعم**

- 📧 **البريد الإلكتروني**: support@globalhedgeai.com
- 📚 **الوثائق**: [docs/](docs/)
- 🐛 **الإبلاغ عن الأخطاء**: [Issues](https://github.com/yourusername/global-hedge-ai/issues)
- 💬 **المناقشات**: [Discussions](https://github.com/yourusername/global-hedge-ai/discussions)

## 📄 **الترخيص**

هذا المشروع مرخص تحت رخصة MIT - راجع ملف [LICENSE](LICENSE) للتفاصيل.

## 🤝 **المساهمة**

نرحب بالمساهمات! يرجى قراءة [دليل المساهمة](CONTRIBUTING.md) قبل البدء.

## 🙏 **شكر وتقدير**

شكر خاص لجميع المساهمين والمطورين الذين ساعدوا في تطوير هذه المنصة.

---

## 🎯 **البدء الآن**

```bash
# استنساخ المشروع
git clone https://github.com/yourusername/global-hedge-ai.git
cd global-hedge-ai

# تشغيل السكريبت التلقائي
chmod +x setup.sh
./setup.sh
```

**🚀 استمتع بمنصتك الجديدة!**
