# 📱 دليل نشر تطبيق Global Hedge AI للمتاجر

## 🎯 **نظرة عامة**

هذا الدليل يوضح كيفية نشر تطبيق Global Hedge AI في متاجر التطبيقات (Google Play Store & Apple App Store).

---

## 📋 **المتطلبات الأساسية**

### **للنشر في Google Play Store:**
- حساب Google Play Console ($25 رسوم تسجيل لمرة واحدة)
- تطبيق Android جاهز للبناء
- أيقونات التطبيق (512x512 PNG)
- لقطات شاشة للتطبيق
- وصف التطبيق بالعربية والإنجليزية

### **للنشر في Apple App Store:**
- حساب Apple Developer ($99/سنة)
- تطبيق iOS جاهز للبناء
- أيقونات التطبيق (1024x1024 PNG)
- لقطات شاشة للتطبيق
- وصف التطبيق بالعربية والإنجليزية

---

## 🚀 **خطوات النشر**

### **المرحلة الأولى: إعداد التطبيق**

#### **1. تحديث معلومات التطبيق:**
```json
// app.json
{
  "expo": {
    "name": "Global Hedge AI",
    "slug": "global-hedge-ai",
    "version": "1.0.0",
    "description": "منصة الاستثمار الذكي والعملات المشفرة",
    "keywords": ["استثمار", "عملات مشفرة", "تداول", "مكافآت"],
    "privacy": "public",
    "orientation": "portrait",
    "icon": "./assets/icon.png",
    "splash": {
      "image": "./assets/splash.png",
      "resizeMode": "contain",
      "backgroundColor": "#0b0e11"
    }
  }
}
```

#### **2. إنشاء الأيقونات:**
```bash
# إنشاء أيقونات متعددة الأحجام
npx expo install expo-image-utils
npx expo prebuild
```

#### **3. إعداد الشهادات:**
```bash
# تسجيل الدخول إلى Expo
npx expo login

# إنشاء حساب EAS
npx eas login

# إعداد EAS Build
npx eas build:configure
```

---

### **المرحلة الثانية: بناء التطبيق**

#### **لـ Android:**
```bash
# بناء APK للتجربة
npx eas build --platform android --profile preview

# بناء AAB للنشر
npx eas build --platform android --profile production
```

#### **لـ iOS:**
```bash
# بناء للتجربة
npx eas build --platform ios --profile preview

# بناء للنشر
npx eas build --platform ios --profile production
```

---

### **المرحلة الثالثة: النشر**

#### **Google Play Store:**

1. **إنشاء حساب Google Play Console:**
   - اذهب إلى [Google Play Console](https://play.google.com/console)
   - ادفع رسوم التسجيل ($25)
   - أكمل معلومات المطور

2. **إنشاء التطبيق:**
   - اضغط "إنشاء تطبيق"
   - أدخل اسم التطبيق: "Global Hedge AI"
   - اختر اللغة الافتراضية: العربية
   - اختر نوع التطبيق: تطبيق أو لعبة

3. **رفع التطبيق:**
   - اذهب إلى "الإنتاج" > "إنشاء إصدار"
   - ارفع ملف AAB من EAS Build
   - أدخل ملاحظات الإصدار

4. **معلومات التطبيق:**
   ```text
   العنوان: Global Hedge AI
   
   الوصف القصير:
   منصة الاستثمار الذكي والعملات المشفرة مع مكافآت يومية
   
   الوصف الكامل:
   مرحباً بك في Global Hedge AI - منصة الاستثمار الذكي الرائدة في عالم العملات المشفرة.
   
   مميزات التطبيق:
   • إيداع وسحب آمن للعملات المشفرة
   • مكافآت يومية وعشوائية
   • نظام دعوات متقدم
   • دعم كامل للعربية
   • واجهة مستخدم حديثة وسهلة
   • أمان متقدم وحماية البيانات
   
   انضم إلى آلاف المستثمرين الذين يثقون في Global Hedge AI لتحقيق أهدافهم المالية.
   ```

5. **الأيقونات والصور:**
   - أيقونة التطبيق: 512x512 PNG
   - لقطات الشاشة: 1080x1920 PNG (5 صور على الأقل)
   - صورة الميزة: 1024x500 PNG

6. **التصنيف والمحتوى:**
   - التصنيف: المال
   - التصنيف الفرعي: الاستثمار
   - التقييم: 3+ (مناسب لجميع الأعمار)
   - المحتوى: لا يحتوي على محتوى غير مناسب

#### **Apple App Store:**

1. **إنشاء حساب Apple Developer:**
   - اذهب إلى [Apple Developer](https://developer.apple.com)
   - ادفع رسوم التسجيل ($99/سنة)
   - أكمل معلومات المطور

2. **إنشاء التطبيق في App Store Connect:**
   - اذهب إلى [App Store Connect](https://appstoreconnect.apple.com)
   - اضغط "My Apps" > "+"
   - اختر "New App"
   - أدخل معلومات التطبيق

3. **رفع التطبيق:**
   - استخدم Xcode أو Application Loader
   - ارفع ملف .ipa من EAS Build
   - انتظر معالجة التطبيق

4. **معلومات التطبيق:**
   ```text
   App Name: Global Hedge AI
   
   Subtitle: Smart Investment Platform
   
   Description:
   Welcome to Global Hedge AI - the leading smart investment platform in the cryptocurrency world.
   
   App Features:
   • Secure cryptocurrency deposits and withdrawals
   • Daily and random rewards
   • Advanced referral system
   • Full Arabic language support
   • Modern and user-friendly interface
   • Advanced security and data protection
   
   Join thousands of investors who trust Global Hedge AI to achieve their financial goals.
   ```

5. **الأيقونات والصور:**
   - أيقونة التطبيق: 1024x1024 PNG
   - لقطات الشاشة: متعددة الأحجام حسب الجهاز
   - صورة الميزة: 1242x2688 PNG

---

## 📊 **معلومات التطبيق المطلوبة**

### **العربية:**
- **الاسم**: Global Hedge AI
- **الوصف**: منصة الاستثمار الذكي والعملات المشفرة
- **الكلمات المفتاحية**: استثمار، عملات مشفرة، تداول، مكافآت، دعوات
- **التصنيف**: المال والاستثمار

### **الإنجليزية:**
- **Name**: Global Hedge AI
- **Description**: Smart Investment & Cryptocurrency Platform
- **Keywords**: investment, cryptocurrency, trading, rewards, referrals
- **Category**: Finance & Investment

---

## 🔒 **متطلبات الأمان والخصوصية**

### **سياسة الخصوصية:**
```text
نحن في Global Hedge AI نحترم خصوصيتك ونلتزم بحماية بياناتك الشخصية.

البيانات التي نجمعها:
• معلومات الحساب (البريد الإلكتروني، كلمة المرور)
• معلومات المعاملات المالية
• بيانات الاستخدام والإحصائيات

كيف نستخدم بياناتك:
• لتوفير خدمات التطبيق
• لتحسين تجربة المستخدم
• للتواصل معك حول المعاملات المهمة

نحن لا نشارك بياناتك مع أطراف ثالثة دون موافقتك.
```

### **شروط الاستخدام:**
```text
باستخدام تطبيق Global Hedge AI، فإنك توافق على:

1. استخدام التطبيق للأغراض القانونية فقط
2. عدم مشاركة حسابك مع الآخرين
3. إبلاغنا فوراً عن أي نشاط مشبوه
4. الالتزام بالقوانين المحلية والدولية

نحتفظ بالحق في تعليق أو إغلاق أي حساب ينتهك هذه الشروط.
```

---

## 📈 **استراتيجية النشر**

### **المرحلة الأولى (الأسبوع 1-2):**
- [ ] إكمال تطوير التطبيق
- [ ] اختبار شامل على أجهزة مختلفة
- [ ] إعداد الأيقونات والصور
- [ ] كتابة الوصف والكلمات المفتاحية

### **المرحلة الثانية (الأسبوع 3-4):**
- [ ] بناء التطبيق للإنتاج
- [ ] رفع للتقييم في المتاجر
- [ ] انتظار الموافقة
- [ ] إعداد الحملات التسويقية

### **المرحلة الثالثة (الأسبوع 5-6):**
- [ ] إطلاق التطبيق
- [ ] مراقبة التقييمات والمراجعات
- [ ] تحديثات دورية
- [ ] تحسين الأداء

---

## 🎯 **نصائح للنجاح**

### **لجذب المستخدمين:**
- **وصف جذاب** يوضح المميزات الرئيسية
- **لقطات شاشة واضحة** تظهر واجهة التطبيق
- **كلمات مفتاحية دقيقة** للبحث
- **تقييمات إيجابية** من المستخدمين الأوائل

### **للموافقة السريعة:**
- **اختبار شامل** قبل الرفع
- **التزام بسياسات المتاجر**
- **معلومات دقيقة** عن التطبيق
- **استجابة سريعة** لطلبات المراجعة

---

## 📞 **الدعم**

إذا واجهت أي مشاكل في النشر:
- **📧 البريد الإلكتروني**: support@globalhedgeai.com
- **📚 الوثائق**: [Expo Documentation](https://docs.expo.dev/)
- **🐛 الإبلاغ عن الأخطاء**: [GitHub Issues](https://github.com/yourusername/global-hedge-ai/issues)

---

## 🎉 **الخلاصة**

بعد اتباع هذا الدليل، ستحصل على:
- ✅ تطبيق منشور في Google Play Store
- ✅ تطبيق منشور في Apple App Store
- ✅ وصول لملايين المستخدمين
- ✅ إمكانية التحديثات المستمرة
- ✅ إحصائيات مفصلة عن الاستخدام

**🚀 استمتع بنجاح تطبيقك!**
