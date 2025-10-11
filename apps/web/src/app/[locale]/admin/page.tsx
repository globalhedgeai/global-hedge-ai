'use client';

import { useTranslation } from '@/lib/translations';
import Link from 'next/link';
import { 
  UsersIcon, 
  WalletIcon, 
  ChartBarIcon,
  CogIcon,
  ShieldCheckIcon,
  CloudArrowUpIcon,
  BellIcon,
  DocumentTextIcon,
  ChartPieIcon
} from '@heroicons/react/24/outline';

export default function AdminDashboardPage() {
  // const { t } = useTranslation();

  const adminSections = [
    {
      title: 'إدارة المستخدمين',
      description: 'عرض وإدارة جميع المستخدمين',
      icon: UsersIcon,
      href: '/admin/users',
      color: 'bg-blue-500'
    },
    {
      title: 'إدارة الأدوار',
      description: 'توزيع وإدارة الأدوار الإدارية',
      icon: UsersIcon,
      href: '/admin/roles',
      color: 'bg-red-500'
    },
    {
      title: 'التقارير المالية',
      description: 'تقارير شاملة عن الأداء المالي',
      icon: ChartPieIcon,
      href: '/admin/reports',
      color: 'bg-purple-500'
    },
    {
      title: 'التحكم الكامل',
      description: 'تحكم إداري كامل في المستخدمين والمعاملات',
      icon: ShieldCheckIcon,
      href: '/admin/full-control',
      color: 'bg-red-500'
    },
    {
      title: 'إدارة المحافظ',
      description: 'إدارة محافظ العملات المشفرة',
      icon: WalletIcon,
      href: '/admin/wallet',
      color: 'bg-green-500'
    },
    {
      title: 'مراقبة الأداء',
      description: 'مراقبة أداء النظام والخدمات',
      icon: ChartBarIcon,
      href: '/admin/performance',
      color: 'bg-purple-500'
    },
    {
      title: 'النسخ الاحتياطية',
      description: 'إدارة النسخ الاحتياطية للبيانات',
      icon: CloudArrowUpIcon,
      href: '/admin/backups',
      color: 'bg-orange-500'
    },
    {
      title: 'الرسائل',
      description: 'إدارة رسائل المستخدمين والدعم',
      icon: BellIcon,
      href: '/admin/messages',
      color: 'bg-red-500'
    },
    {
      title: 'السياسات',
      description: 'إدارة سياسات المنصة',
      icon: DocumentTextIcon,
      href: '/admin/policies',
      color: 'bg-indigo-500'
    },
    {
      title: 'المكافآت',
      description: 'إدارة نظام المكافآت',
      icon: CogIcon,
      href: '/admin/rewards',
      color: 'bg-yellow-500'
    },
    {
      title: 'إحصائيات المنصة',
      description: 'تحديث إحصائيات المنصة المعروضة',
      icon: ChartPieIcon,
      href: '/admin/platform-stats',
      color: 'bg-teal-500'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">لوحة الإدارة</h1>
          <p className="mt-2 text-gray-600">إدارة جميع جوانب المنصة</p>
        </div>

        {/* Admin Sections Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminSections.map((section, index) => (
            <Link
              key={index}
              href={section.href}
              className="group bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 p-6 border border-gray-200 hover:border-gray-300"
            >
              <div className="flex items-center mb-4">
                <div className={`${section.color} rounded-lg p-3 mr-4`}>
                  <section.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {section.title}
                  </h3>
                </div>
              </div>
              <p className="text-gray-600 text-sm">
                {section.description}
              </p>
            </Link>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="mt-12 bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">إحصائيات سريعة</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">1,000+</div>
              <div className="text-gray-600">مستخدم نشط</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">$5M+</div>
              <div className="text-gray-600">حجم التداول</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">150+</div>
              <div className="text-gray-600">صفقة نشطة</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600">99.9%</div>
              <div className="text-gray-600">وقت التشغيل</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
