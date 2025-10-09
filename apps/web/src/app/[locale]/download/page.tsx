'use client';

import { useTranslation } from '@/lib/translations';
import { useState } from 'react';

export default function DownloadAppPage() {
  const { t } = useTranslation();
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    setIsDownloading(true);
    setDownloadProgress(0);

    // محاكاة عملية التحميل
    const interval = setInterval(() => {
      setDownloadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);

    // في الواقع، سيتم تحميل ملف APK الحقيقي
    setTimeout(() => {
      // إنشاء رابط تحميل APK
      const link = document.createElement('a');
      link.href = '/downloads/global-hedge-ai.apk';
      link.download = 'global-hedge-ai.apk';
      link.click();
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
            {t('download.title')}
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            {t('download.subtitle')}
          </p>
          <p className="text-lg text-gray-400 mb-12 max-w-4xl mx-auto">
            {t('download.description')}
          </p>
        </div>

        {/* Download Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Android Download */}
          <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/30 backdrop-blur-sm rounded-2xl p-8 border border-green-500/20">
            <div className="text-center">
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.523 15.3414c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4486.9993.9993s-.4482.9997-.9993.9997m-11.046 0c-.5511 0-.9993-.4486-.9993-.9997s.4482-.9993.9993-.9993c.5511 0 .9993.4486.9993.9993s-.4482.9997-.9993.9997m11.4045-6.02l1.9973-3.4592a.416.416 0 00-.1521-.5676.416.416 0 00-.5676.1521l-2.0223 3.503C15.5902 8.4119 13.8533 7.8508 12 7.8508s-3.5902.5611-5.1367 1.5589L4.841 5.9067a.416.416 0 00-.5676-.1521.416.416 0 00-.1521.5676l1.9973 3.4592C2.6889 11.1867.3432 14.6589 0 18.761h24c-.3432-4.1021-2.6889-7.5743-6.1189-8.4396"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Android</h3>
              <p className="text-gray-300 mb-6">
                تحميل مباشر - لا حاجة لمتجر التطبيقات
              </p>
              
              {isDownloading ? (
                <div className="space-y-4">
                  <div className="bg-gray-700 rounded-full h-4 overflow-hidden">
                    <div 
                      className="bg-green-500 h-full transition-all duration-300 ease-out"
                      style={{ width: `${downloadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-gray-300">{downloadProgress}% - جاري التحميل...</p>
                </div>
              ) : (
                <button
                  onClick={handleDownload}
                  className="bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg w-full"
                >
                  تحميل APK (25 MB)
                </button>
              )}
            </div>
          </div>

          {/* iOS Download */}
          <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/30 backdrop-blur-sm rounded-2xl p-8 border border-blue-500/20">
            <div className="text-center">
              <div className="w-20 h-20 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">iPhone/iPad</h3>
              <p className="text-gray-300 mb-6">
                تطبيق ويب متقدم - يعمل كتطبيق أصلي
              </p>
              <button
                onClick={() => window.open('/', '_blank')}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg w-full"
              >
                فتح التطبيق في المتصفح
              </button>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 border border-white/20 mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">
            {t('download.features.title')}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('download.features.trading')}</h3>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('download.features.notifications')}</h3>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,1L3,5V11C3,16.55 6.84,21.74 12,23C17.16,21.74 21,16.55 21,11V5L12,1M12,7C13.4,7 14.8,8.6 14.8,10V11H16V16H8V11H9.2V10C9.2,8.6 10.6,7 12,7M12,8.2C11.2,8.2 10.4,8.7 10.4,10V11H13.6V10C13.6,8.7 12.8,8.2 12,8.2Z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('download.features.security')}</h3>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4M12,6A6,6 0 0,0 6,12A6,6 0 0,0 12,18A6,6 0 0,0 18,12A6,6 0 0,0 12,6M12,8A4,4 0 0,1 16,12A4,4 0 0,1 12,16A4,4 0 0,1 8,12A4,4 0 0,1 12,8Z"/>
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{t('download.features.offline')}</h3>
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-8">
            تعليمات التثبيت
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="text-left">
              <h3 className="text-xl font-semibold text-white mb-4">Android</h3>
              <ol className="space-y-2 text-blue-100">
                <li>1. اضغط على زر &quot;تحميل APK&quot; أعلاه</li>
                <li>2. انتظر انتهاء التحميل</li>
                <li>3. افتح الإعدادات &gt; الأمان &gt; تفعيل &quot;مصادر غير معروفة&quot;</li>
                <li>4. اضغط على ملف APK المحمل واتبع التعليمات</li>
                <li>5. استمتع بالتطبيق!</li>
              </ol>
            </div>
            <div className="text-left">
              <h3 className="text-xl font-semibold text-white mb-4">iPhone/iPad</h3>
              <ol className="space-y-2 text-blue-100">
                <li>1. اضغط على &quot;فتح التطبيق في المتصفح&quot;</li>
                <li>2. ستظهر رسالة &quot;إضافة إلى الشاشة الرئيسية&quot;</li>
                <li>3. اضغط &quot;إضافة&quot; لتثبيت التطبيق</li>
                <li>4. سيظهر أيقونة التطبيق على الشاشة الرئيسية</li>
                <li>5. اضغط على الأيقونة لفتح التطبيق!</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}