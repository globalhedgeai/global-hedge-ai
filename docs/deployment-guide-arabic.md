# 🚀 دليل النشر والتشغيل الكامل - Global Hedge AI

## 📋 **قائمة التحضيرات قبل النشر**

### **1. متطلبات الخادم**
- **RAM**: 4GB على الأقل (8GB مفضل)
- **Storage**: 50GB على الأقل
- **CPU**: 2 cores على الأقل
- **OS**: Ubuntu 20.04+ أو CentOS 8+
- **Network**: عنوان IP ثابت

### **2. متطلبات البرمجيات**
- Docker & Docker Compose
- Git
- SSL Certificate (Let's Encrypt)
- Domain Name

---

## 🔧 **خطوات النشر**

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

# إعادة تسجيل الدخول لتطبيق صلاحيات Docker
exit
# تسجيل الدخول مرة أخرى
```

### **الخطوة 2: إعداد النطاق (Domain)**

#### **أ) شراء نطاق**
- استخدم خدمات مثل Namecheap, GoDaddy, أو Cloudflare
- اختر نطاق مناسب مثل `globalhedgeai.com`

#### **ب) ربط النطاق بالخادم**
```bash
# في لوحة تحكم مزود النطاق، أضف DNS records:
# A Record: @ -> YOUR_SERVER_IP
# A Record: www -> YOUR_SERVER_IP
# CNAME: api -> YOUR_SERVER_IP
```

#### **ج) التحقق من النطاق**
```bash
# تحقق من أن النطاق يشير لخادمك
nslookup yourdomain.com
ping yourdomain.com
```

### **الخطوة 3: إعداد SSL Certificate**

```bash
# تثبيت Certbot
sudo apt install certbot -y

# الحصول على شهادة SSL
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# إنشاء مجلد للشهادات
sudo mkdir -p /etc/nginx/ssl
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem /etc/nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem /etc/nginx/ssl/key.pem
sudo chmod 600 /etc/nginx/ssl/key.pem
```

### **الخطوة 4: تحضير المشروع**

```bash
# استنساخ المشروع
git clone https://github.com/yourusername/global-hedge-ai.git
cd global-hedge-ai

# إنشاء ملف البيئة
cp docs/production-env.example .env.production
```

### **الخطوة 5: إعداد متغيرات البيئة**

```bash
# تحرير ملف البيئة
nano .env.production
```

**املأ هذه القيم:**

```env
# Database
DATABASE_URL="postgresql://postgres:YOUR_SECURE_PASSWORD@postgres:5432/global_hedge_ai?schema=public"

# Next.js
NODE_ENV=production
NEXTAUTH_SECRET="YOUR_SUPER_SECRET_KEY_HERE"
NEXTAUTH_URL="https://yourdomain.com"

# Cloudflare R2 (للصور والملفات)
CLOUDFLARE_R2_ACCESS_KEY_ID="your-access-key"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="your-secret-key"
CLOUDFLARE_R2_ENDPOINT="https://your-account-id.r2.cloudflarestorage.com"
CLOUDFLARE_R2_BUCKET_NAME="global-hedge-ai-storage"

# عناوين العملات المشفرة (استبدل بعناوينك الحقيقية)
NEXT_PUBLIC_USDT_TRC20_ADDRESS="TKaAamEouHjG9nZwoTPhgYUerejbBHGMop"
NEXT_PUBLIC_USDT_ERC20_ADDRESS="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
NEXT_PUBLIC_BTC_ADDRESS="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
NEXT_PUBLIC_ETH_ADDRESS="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"

# كلمة مرور قاعدة البيانات
POSTGRES_PASSWORD="YOUR_SECURE_DB_PASSWORD"
```

### **الخطوة 6: تحديث إعدادات Nginx**

```bash
# تحديث ملف Nginx مع نطاقك
nano nginx.conf
```

**استبدل `yourdomain.com` بنطاقك في جميع الأماكن**

### **الخطوة 7: تشغيل التطبيق**

```bash
# بناء وتشغيل الخدمات
docker-compose -f docker-compose.production.yml up -d

# مراقبة السجلات
docker-compose -f docker-compose.production.yml logs -f
```

### **الخطوة 8: إعداد قاعدة البيانات**

```bash
# تشغيل migrations
docker-compose -f docker-compose.production.yml exec app npx prisma migrate deploy --schema=prisma/postgresql.prisma

# إنشاء المستخدمين الإداريين
docker-compose -f docker-compose.production.yml exec app tsx scripts/setup-admin.ts
```

---

## 👥 **إعداد الأدوار والمستخدمين**

### **الأدوار المتاحة:**

1. **ADMIN** - مدير النظام
   - صلاحيات كاملة
   - إدارة المستخدمين والمعاملات
   - الوصول لجميع الصفحات الإدارية

2. **SUPPORT** - فريق الدعم
   - إدارة الرسائل والدعم
   - مراجعة الإيداعات والسحوبات
   - لا يمكنه تعديل السياسات

3. **ACCOUNTING** - المحاسبة
   - إدارة المعاملات المالية
   - مراجعة التقارير المالية
   - إدارة المكافآت

4. **USER** - المستخدم العادي
   - إيداع وسحب الأموال
   - المطالبة بالمكافآت
   - عرض التقارير الشخصية

### **إنشاء مستخدمين إداريين إضافيين:**

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

## 🔒 **إعدادات الأمان**

### **1. جدار الحماية (Firewall)**

```bash
# إعداد UFW
sudo ufw allow 22/tcp    # SSH
sudo ufw allow 80/tcp    # HTTP
sudo ufw allow 443/tcp   # HTTPS
sudo ufw enable
```

### **2. تحديث SSL تلقائياً**

```bash
# إضافة cron job للتحديث التلقائي
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### **3. نسخ احتياطية تلقائية**

```bash
# إنشاء سكريبت النسخ الاحتياطي
cat > backup.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# نسخ احتياطي لقاعدة البيانات
docker-compose -f /path/to/docker-compose.production.yml exec postgres pg_dump -U postgres global_hedge_ai > $BACKUP_DIR/db_$DATE.sql

# نسخ احتياطي للملفات
docker-compose -f /path/to/docker-compose.production.yml exec app tar -czf $BACKUP_DIR/app_$DATE.tar.gz /app/public

# رفع للخادم السحابي (اختياري)
# aws s3 cp $BACKUP_DIR/ s3://your-backup-bucket/ --recursive
EOF

chmod +x backup.sh

# إضافة للـ cron
echo "0 2 * * * /path/to/backup.sh" | crontab -
```

---

## 📊 **المراقبة والصيانة**

### **1. مراقبة الأداء**

```bash
# مراقبة استخدام الموارد
docker stats

# مراقبة السجلات
docker-compose -f docker-compose.production.yml logs -f app

# فحص صحة التطبيق
curl https://yourdomain.com/api/health
```

### **2. تحديث التطبيق**

```bash
# سحب التحديثات
git pull origin main

# إعادة بناء وتشغيل
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

# تشغيل migrations إذا لزم الأمر
docker-compose -f docker-compose.production.yml exec app npx prisma migrate deploy --schema=prisma/postgresql.prisma
```

### **3. نسخ احتياطية يدوية**

```bash
# نسخ احتياطي فوري
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U postgres global_hedge_ai > backup_$(date +%Y%m%d).sql

# استعادة من نسخة احتياطية
docker-compose -f docker-compose.production.yml exec -T postgres psql -U postgres global_hedge_ai < backup_20240101.sql
```

---

## 🚨 **استكشاف الأخطاء**

### **مشاكل شائعة:**

1. **التطبيق لا يعمل**
   ```bash
   # فحص السجلات
   docker-compose -f docker-compose.production.yml logs app
   
   # فحص حالة الخدمات
   docker-compose -f docker-compose.production.yml ps
   ```

2. **مشاكل قاعدة البيانات**
   ```bash
   # فحص اتصال قاعدة البيانات
   docker-compose -f docker-compose.production.yml exec app npx prisma db pull --schema=prisma/postgresql.prisma
   ```

3. **مشاكل SSL**
   ```bash
   # فحص صحة الشهادة
   openssl x509 -in /etc/nginx/ssl/cert.pem -text -noout
   
   # اختبار الاتصال
   openssl s_client -connect yourdomain.com:443
   ```

---

## 📈 **التحسينات المستقبلية**

### **1. توسيع النطاق**
- إضافة خوادم إضافية
- استخدام Load Balancer
- إعداد Redis للتخزين المؤقت

### **2. المراقبة المتقدمة**
- إعداد Prometheus + Grafana
- مراقبة الأداء في الوقت الفعلي
- تنبيهات تلقائية

### **3. النسخ الاحتياطية المتقدمة**
- نسخ احتياطية متعددة المواقع
- استعادة نقطة زمنية محددة
- تشفير النسخ الاحتياطية

---

## ✅ **قائمة التحقق النهائية**

- [ ] الخادم جاهز ومحدث
- [ ] النطاق مرتبط بالخادم
- [ ] شهادة SSL مثبتة
- [ ] متغيرات البيئة محددة
- [ ] التطبيق يعمل بنجاح
- [ ] قاعدة البيانات مهيأة
- [ ] المستخدمين الإداريين منشأين
- [ ] جدار الحماية مفعل
- [ ] النسخ الاحتياطية مجدولة
- [ ] المراقبة تعمل
- [ ] اختبار جميع الوظائف

**🎉 تهانينا! منصتك جاهزة للإنتاج!**
