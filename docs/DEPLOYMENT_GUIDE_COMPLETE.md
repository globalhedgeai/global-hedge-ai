# 🚀 دليل النشر الشامل - خطوة بخطوة للمبتدئين

## 📋 **قائمة التحقق قبل النشر**

### ✅ **التحضيرات الأساسية:**
- [ ] حساب VPS/Server
- [ ] اسم نطاق (Domain)
- [ ] شهادة SSL
- [ ] قاعدة بيانات PostgreSQL
- [ ] متغيرات البيئة

---

## 🖥️ **الخطوة 1: إعداد الخادم (VPS)**

### **1.1 اختيار مزود الخدمة:**
```
الخيارات الموصى بها:
- DigitalOcean: $5-10/شهر
- Vultr: $5-10/شهر  
- Linode: $5-10/شهر
- AWS: $10-20/شهر
```

### **1.2 مواصفات الخادم المطلوبة:**
```
الحد الأدنى:
- RAM: 2GB
- CPU: 1 Core
- Storage: 25GB SSD
- Bandwidth: 1TB

الموصى به:
- RAM: 4GB
- CPU: 2 Cores
- Storage: 50GB SSD
- Bandwidth: 2TB
```

### **1.3 نظام التشغيل:**
```
Ubuntu 22.04 LTS (الأكثر استقراراً)
```

---

## 🌐 **الخطوة 2: إعداد اسم النطاق**

### **2.1 شراء النطاق:**
```
الخيارات الموصى بها:
- Namecheap: $10-15/سنة
- GoDaddy: $12-18/سنة
- Cloudflare: $10-12/سنة
```

### **2.2 إعداد DNS:**
```
A Record: yourdomain.com → Server IP
CNAME: www.yourdomain.com → yourdomain.com
```

---

## 🔧 **الخطوة 3: إعداد الخادم**

### **3.1 الاتصال بالخادم:**
```bash
# عبر SSH
ssh root@YOUR_SERVER_IP

# أو استخدام PuTTY على Windows
```

### **3.2 تحديث النظام:**
```bash
sudo apt update && sudo apt upgrade -y
```

### **3.3 تثبيت المتطلبات الأساسية:**
```bash
# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# PM2 (مدير العمليات)
sudo npm install -g pm2

# Nginx (خادم الويب)
sudo apt install nginx -y

# PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Git
sudo apt install git -y

# Certbot (لشهادة SSL)
sudo apt install certbot python3-certbot-nginx -y
```

---

## 🗄️ **الخطوة 4: إعداد قاعدة البيانات**

### **4.1 إنشاء قاعدة البيانات:**
```bash
# الدخول إلى PostgreSQL
sudo -u postgres psql

# إنشاء قاعدة البيانات
CREATE DATABASE global_hedge_ai;

# إنشاء مستخدم
CREATE USER hedge_user WITH PASSWORD 'your_strong_password';

# منح الصلاحيات
GRANT ALL PRIVILEGES ON DATABASE global_hedge_ai TO hedge_user;

# الخروج
\q
```

### **4.2 إعداد PostgreSQL:**
```bash
# تعديل إعدادات PostgreSQL
sudo nano /etc/postgresql/14/main/postgresql.conf

# البحث عن:
# listen_addresses = 'localhost'
# وتغييرها إلى:
listen_addresses = '*'

# تعديل pg_hba.conf
sudo nano /etc/postgresql/14/main/pg_hba.conf

# إضافة:
host    global_hedge_ai    hedge_user    127.0.0.1/32    md5

# إعادة تشغيل PostgreSQL
sudo systemctl restart postgresql
```

---

## 📁 **الخطوة 5: رفع الملفات**

### **5.1 استنساخ المشروع:**
```bash
# إنشاء مجلد للمشروع
mkdir -p /var/www/global-hedge-ai
cd /var/www/global-hedge-ai

# استنساخ المشروع
git clone https://github.com/yourusername/global-hedge-ai.git .

# أو رفع الملفات عبر SCP/SFTP
```

### **5.2 تثبيت التبعيات:**
```bash
# تثبيت تبعيات المشروع الرئيسي
npm install

# تثبيت تبعيات التطبيق المحمول
cd apps/mobile
npm install
cd ../..

# تثبيت تبعيات التطبيق الويب
cd apps/web
npm install
cd ../..
```

---

## ⚙️ **الخطوة 6: إعداد متغيرات البيئة**

### **6.1 إنشاء ملف البيئة للإنتاج:**
```bash
# في مجلد apps/web
nano .env.production
```

### **6.2 محتوى ملف البيئة:**
```env
# إعدادات قاعدة البيانات
DATABASE_URL="postgresql://hedge_user:your_strong_password@localhost:5432/global_hedge_ai"

# إعدادات المصادقة
NEXTAUTH_SECRET="your_super_secret_key_here_minimum_32_characters"
NEXTAUTH_URL="https://yourdomain.com"

# إعدادات البريد الإلكتروني (اختياري)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# إعدادات التشفير
ENCRYPTION_KEY="your_encryption_key_32_characters"

# إعدادات التطبيق
NODE_ENV="production"
PORT="3000"

# إعدادات الملفات
UPLOAD_DIR="/var/www/global-hedge-ai/uploads"
MAX_FILE_SIZE="10485760"

# إعدادات الأمان
CORS_ORIGIN="https://yourdomain.com"
RATE_LIMIT_MAX="100"
RATE_LIMIT_WINDOW="900000"

# إعدادات النسخ الاحتياطية
BACKUP_DIR="/var/www/global-hedge-ai/backups"
BACKUP_SCHEDULE="0 2 * * *"

# إعدادات المراقبة
LOG_LEVEL="info"
LOG_FILE="/var/log/global-hedge-ai.log"

# إعدادات التطبيق المحمول
MOBILE_API_URL="https://yourdomain.com/api"
```

### **6.3 إنشاء ملف البيئة للتطبيق المحمول:**
```bash
# في مجلد apps/mobile/src/constants
nano index.ts
```

```typescript
export const API_BASE_URL = 'https://yourdomain.com/api';
```

---

## 🔐 **الخطوة 7: إعداد شهادة SSL**

### **7.1 الحصول على شهادة SSL مجانية:**
```bash
# إيقاف Nginx مؤقتاً
sudo systemctl stop nginx

# الحصول على الشهادة
sudo certbot certonly --standalone -d yourdomain.com -d www.yourdomain.com

# إعادة تشغيل Nginx
sudo systemctl start nginx
```

### **7.2 إعداد تجديد تلقائي:**
```bash
# إضافة مهمة تجديد تلقائي
sudo crontab -e

# إضافة:
0 12 * * * /usr/bin/certbot renew --quiet
```

---

## 🌐 **الخطوة 8: إعداد Nginx**

### **8.1 إنشاء ملف التكوين:**
```bash
sudo nano /etc/nginx/sites-available/global-hedge-ai
```

### **8.2 محتوى ملف Nginx:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;

    # شهادة SSL
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    
    # إعدادات SSL
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # إعدادات الأمان
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # إعدادات الأداء
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # الملفات الثابتة
    location /_next/static/ {
        alias /var/www/global-hedge-ai/apps/web/.next/static/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    location /uploads/ {
        alias /var/www/global-hedge-ai/apps/web/public/uploads/;
        expires 1y;
        add_header Cache-Control "public";
    }

    # التطبيق الرئيسي
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **8.3 تفعيل الموقع:**
```bash
# إنشاء رابط رمزي
sudo ln -s /etc/nginx/sites-available/global-hedge-ai /etc/nginx/sites-enabled/

# إزالة الموقع الافتراضي
sudo rm /etc/nginx/sites-enabled/default

# اختبار التكوين
sudo nginx -t

# إعادة تحميل Nginx
sudo systemctl reload nginx
```

---

## 🚀 **الخطوة 9: بناء وتشغيل التطبيق**

### **9.1 بناء التطبيق:**
```bash
cd /var/www/global-hedge-ai/apps/web

# بناء التطبيق للإنتاج
npm run build

# تشغيل migrations قاعدة البيانات
npx prisma migrate deploy
```

### **9.2 إعداد PM2:**
```bash
# إنشاء ملف تكوين PM2
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'global-hedge-ai',
    script: 'npm',
    args: 'start',
    cwd: '/var/www/global-hedge-ai/apps/web',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: '/var/log/global-hedge-ai-error.log',
    out_file: '/var/log/global-hedge-ai-out.log',
    log_file: '/var/log/global-hedge-ai.log',
    time: true
  }]
};
```

### **9.3 تشغيل التطبيق:**
```bash
# تشغيل التطبيق
pm2 start ecosystem.config.js

# حفظ إعدادات PM2
pm2 save

# إعداد تشغيل تلقائي عند إعادة تشغيل الخادم
pm2 startup
```

---

## 🔧 **الخطوة 10: إعداد النسخ الاحتياطية**

### **10.1 إنشاء سكريبت النسخ الاحتياطي:**
```bash
nano /var/www/global-hedge-ai/backup.sh
```

```bash
#!/bin/bash

# إعدادات النسخ الاحتياطي
BACKUP_DIR="/var/www/global-hedge-ai/backups"
DATE=$(date +%Y%m%d_%H%M%S)
DB_NAME="global_hedge_ai"
DB_USER="hedge_user"

# إنشاء مجلد النسخ الاحتياطي
mkdir -p $BACKUP_DIR

# نسخ احتياطي لقاعدة البيانات
pg_dump -h localhost -U $DB_USER $DB_NAME > $BACKUP_DIR/db_backup_$DATE.sql

# نسخ احتياطي للملفات
tar -czf $BACKUP_DIR/files_backup_$DATE.tar.gz /var/www/global-hedge-ai/apps/web/public/uploads

# حذف النسخ القديمة (أكثر من 7 أيام)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "تم إنشاء النسخ الاحتياطي بنجاح: $DATE"
```

### **10.2 جعل السكريبت قابلاً للتنفيذ:**
```bash
chmod +x /var/www/global-hedge-ai/backup.sh
```

### **10.3 إعداد النسخ الاحتياطي التلقائي:**
```bash
# إضافة مهمة cron
crontab -e

# إضافة:
0 2 * * * /var/www/global-hedge-ai/backup.sh
```

---

## 📊 **الخطوة 11: المراقبة والصيانة**

### **11.1 مراقبة التطبيق:**
```bash
# عرض حالة التطبيق
pm2 status

# عرض السجلات
pm2 logs global-hedge-ai

# مراقبة الأداء
pm2 monit
```

### **11.2 مراقبة الخادم:**
```bash
# استخدام الذاكرة
free -h

# استخدام القرص
df -h

# العمليات النشطة
top

# حالة الخدمات
systemctl status nginx
systemctl status postgresql
```

---

## 🔍 **الخطوة 12: الاختبار والتحقق**

### **12.1 اختبار الموقع:**
```bash
# اختبار الاتصال
curl -I https://yourdomain.com

# اختبار قاعدة البيانات
psql -h localhost -U hedge_user -d global_hedge_ai -c "SELECT 1;"

# اختبار API
curl https://yourdomain.com/api/health
```

### **12.2 اختبار الأمان:**
```bash
# اختبار SSL
openssl s_client -connect yourdomain.com:443

# اختبار Headers
curl -I https://yourdomain.com
```

---

## 🚨 **الخطوة 13: إعدادات الأمان الإضافية**

### **13.1 جدار الحماية:**
```bash
# تثبيت UFW
sudo apt install ufw -y

# إعداد القواعد
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443

# تفعيل جدار الحماية
sudo ufw enable
```

### **13.2 إعدادات SSH:**
```bash
# تعديل إعدادات SSH
sudo nano /etc/ssh/sshd_config

# تغيير المنفذ الافتراضي
Port 2222

# تعطيل تسجيل الدخول كـ root
PermitRootLogin no

# إعادة تشغيل SSH
sudo systemctl restart ssh
```

---

## 📱 **الخطوة 14: نشر التطبيق المحمول**

### **14.1 بناء APK:**
```bash
cd /var/www/global-hedge-ai/apps/mobile

# بناء APK للإنتاج
npx expo build:android --type apk

# رفع APK إلى مجلد التحميلات
cp build.apk /var/www/global-hedge-ai/apps/web/public/downloads/global-hedge-ai.apk
```

---

## ✅ **الخطوة 15: التحقق النهائي**

### **15.1 قائمة التحقق:**
- [ ] الموقع يعمل على https://yourdomain.com
- [ ] قاعدة البيانات متصلة
- [ ] تسجيل الدخول يعمل
- [ ] الإيداع والسحب يعملان
- [ ] التطبيق المحمول متاح للتحميل
- [ ] النسخ الاحتياطي يعمل
- [ ] SSL صالح
- [ ] الأداء جيد

### **15.2 اختبار شامل:**
```bash
# اختبار جميع الوظائف
curl -X POST https://yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password"}'

# اختبار API
curl https://yourdomain.com/api/me

# اختبار التحميل
curl -I https://yourdomain.com/downloads/global-hedge-ai.apk
```

---

## 🎉 **تهانينا! تم النشر بنجاح**

### **الروابط المهمة:**
- **الموقع**: https://yourdomain.com
- **تسجيل الدخول**: https://yourdomain.com/login
- **تحميل التطبيق**: https://yourdomain.com/download
- **API**: https://yourdomain.com/api

### **معلومات الدخول:**
- **خادم قاعدة البيانات**: localhost:5432
- **اسم قاعدة البيانات**: global_hedge_ai
- **مستخدم قاعدة البيانات**: hedge_user
- **منفذ التطبيق**: 3000

---

## 📞 **الدعم والمساعدة**

### **في حالة المشاكل:**
1. **فحص السجلات**: `pm2 logs global-hedge-ai`
2. **إعادة تشغيل الخدمات**: `pm2 restart global-hedge-ai`
3. **فحص قاعدة البيانات**: `sudo -u postgres psql`
4. **فحص Nginx**: `sudo nginx -t`

### **الأوامر المفيدة:**
```bash
# إعادة تشغيل التطبيق
pm2 restart global-hedge-ai

# إعادة تشغيل Nginx
sudo systemctl restart nginx

# إعادة تشغيل PostgreSQL
sudo systemctl restart postgresql

# عرض حالة الخدمات
systemctl status nginx postgresql

# مراقبة السجلات
tail -f /var/log/global-hedge-ai.log
```

---

**تم النشر بنجاح! 🚀**

**الموقع جاهز للاستخدام على**: https://yourdomain.com
