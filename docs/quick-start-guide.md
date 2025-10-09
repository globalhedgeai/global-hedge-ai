# 🚀 دليل البدء السريع - Global Hedge AI

## ⚡ **النشر السريع (5 دقائق)**

### **الطريقة الأولى: السكريبت التلقائي**

```bash
# 1. تحميل السكريبت
wget https://raw.githubusercontent.com/yourusername/global-hedge-ai/main/setup.sh
chmod +x setup.sh

# 2. تشغيل السكريبت
./setup.sh
```

**السكريبت سيسألك عن:**
- اسم النطاق (مثل: yourdomain.com)
- البريد الإلكتروني لشهادة SSL
- كلمة مرور قاعدة البيانات
- مفاتيح Cloudflare R2
- سر NextAuth

---

## 🔧 **النشر اليدوي (خطوة بخطوة)**

### **الخطوة 1: إعداد الخادم**

```bash
# تحديث النظام
sudo apt update && sudo apt upgrade -y

# تثبيت Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# تثبيت Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# إعادة تسجيل الدخول
exit
# تسجيل الدخول مرة أخرى
```

### **الخطوة 2: تحضير المشروع**

```bash
# استنساخ المشروع
git clone https://github.com/yourusername/global-hedge-ai.git
cd global-hedge-ai

# إنشاء ملف البيئة
cp docs/production-env.example .env.production
nano .env.production
```

### **الخطوة 3: إعداد النطاق و SSL**

```bash
# تثبيت Certbot
sudo apt install certbot -y

# الحصول على شهادة SSL
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# نسخ الشهادات
sudo mkdir -p /etc/nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /etc/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /etc/nginx/ssl/key.pem
sudo chmod 600 /etc/nginx/ssl/key.pem
```

### **الخطوة 4: تشغيل التطبيق**

```bash
# تحديث إعدادات Nginx
sed -i 's/yourdomain.com/yourdomain.com/g' nginx.conf

# تشغيل الخدمات
docker-compose -f docker-compose.production.yml up -d

# إعداد قاعدة البيانات
docker-compose -f docker-compose.production.yml exec app npx prisma migrate deploy --schema=prisma/postgresql.prisma

# إنشاء المستخدمين الإداريين
docker-compose -f docker-compose.production.yml exec app tsx scripts/setup-admin.ts
```

---

## 👥 **إعداد الأدوار والمستخدمين**

### **الأدوار المتاحة:**

| الدور | الصلاحيات | الاستخدام |
|-------|-----------|-----------|
| **ADMIN** | صلاحيات كاملة | مدير النظام الرئيسي |
| **SUPPORT** | إدارة الدعم والرسائل | فريق خدمة العملاء |
| **ACCOUNTING** | إدارة المعاملات المالية | قسم المحاسبة |
| **USER** | المستخدم العادي | العملاء |

### **إنشاء مستخدمين إداريين:**

```bash
# الدخول لقاعدة البيانات
docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -d global_hedge_ai

# إنشاء مستخدم جديد
INSERT INTO "User" (id, email, "passwordHash", role, "createdAt", balance, "referralCode") 
VALUES (
  'cuid_' || extract(epoch from now())::text,
  'newadmin@yourdomain.com',
  '$2a$10$hashedpassword', -- استخدم hashPassword function
  'ADMIN',
  NOW(),
  0,
  'ADMIN_' || extract(epoch from now())::text
);
```

---

## 🔐 **إعدادات الأمان الأساسية**

### **1. جدار الحماية**

```bash
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### **2. تحديث SSL تلقائياً**

```bash
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### **3. نسخ احتياطية يومية**

```bash
# إنشاء سكريبت النسخ الاحتياطي
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U postgres global_hedge_ai > backup_$DATE.sql
find . -name "backup_*.sql" -mtime +7 -delete
EOF

chmod +x backup.sh
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

---

## 📊 **المراقبة والصيانة**

### **فحص حالة التطبيق:**

```bash
# حالة الخدمات
docker-compose -f docker-compose.production.yml ps

# استخدام الموارد
docker stats

# فحص الصحة
curl https://yourdomain.com/api/health

# السجلات
docker-compose -f docker-compose.production.yml logs -f app
```

### **تحديث التطبيق:**

```bash
# سحب التحديثات
git pull origin main

# إعادة بناء وتشغيل
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d
```

---

## 🎯 **قائمة التحقق السريعة**

### **قبل النشر:**
- [ ] خادم مع 4GB RAM على الأقل
- [ ] نطاق مرتبط بالخادم
- [ ] مفاتيح Cloudflare R2
- [ ] عناوين العملات المشفرة الحقيقية

### **بعد النشر:**
- [ ] التطبيق يعمل على https://yourdomain.com
- [ ] تسجيل الدخول كمدير يعمل
- [ ] جميع الصفحات تحمل بشكل صحيح
- [ ] قاعدة البيانات تعمل
- [ ] النسخ الاحتياطية مجدولة

### **الأمان:**
- [ ] جدار الحماية مفعل
- [ ] SSL يعمل
- [ ] كلمات مرور قوية للمديرين
- [ ] النسخ الاحتياطية تعمل

---

## 🚨 **استكشاف الأخطاء السريع**

### **المشاكل الشائعة:**

1. **التطبيق لا يعمل:**
   ```bash
   docker-compose -f docker-compose.production.yml logs app
   ```

2. **مشاكل قاعدة البيانات:**
   ```bash
   docker-compose -f docker-compose.production.yml exec app npx prisma db pull --schema=prisma/postgresql.prisma
   ```

3. **مشاكل SSL:**
   ```bash
   sudo certbot certificates
   ```

4. **مشاكل الذاكرة:**
   ```bash
   free -h
   docker system prune -a
   ```

---

## 📞 **الدعم والمساعدة**

### **الوثائق:**
- `docs/deployment-guide-arabic.md` - دليل النشر الكامل
- `docs/postgresql-migration.md` - دليل الهجرة لقاعدة البيانات
- `docs/production-deployment.md` - دليل النشر للإنتاج

### **الأدوات المفيدة:**
- `scripts/setup-admin.ts` - إعداد المستخدمين الإداريين
- `scripts/migrate-to-postgresql.ts` - هجرة البيانات
- `monitor.sh` - مراقبة النظام
- `backup.sh` - النسخ الاحتياطية

### **الروابط المهمة:**
- لوحة الإدارة: `https://yourdomain.com/admin`
- مراقبة الأداء: `https://yourdomain.com/admin/performance`
- النسخ الاحتياطية: `https://yourdomain.com/admin/backups`
- صحة النظام: `https://yourdomain.com/api/health`

---

## 🎉 **تهانينا!**

منصتك جاهزة الآن! تأكد من:
1. اختبار جميع الوظائف
2. تغيير كلمات مرور المديرين
3. إعداد النسخ الاحتياطية
4. مراقبة الأداء

**🚀 استمتع بمنصتك الجديدة!**
