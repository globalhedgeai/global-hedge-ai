'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from '@/lib/translations';
import { 
  ChartBarIcon, 
  UsersIcon, 
  CurrencyDollarIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

interface PlatformStats {
  id: string;
  totalUsers: number;
  totalVolume: number;
  activeTrades: number;
  totalDeposits: number;
  totalWithdrawals: number;
  createdAt: string;
  updatedAt: string;
}

export default function PlatformStatsAdminPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<PlatformStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [formData, setFormData] = useState({
    totalUsers: 0,
    totalVolume: 0,
    activeTrades: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/platform-stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
        setFormData({
          totalUsers: data.totalUsers,
          totalVolume: data.totalVolume,
          activeTrades: data.activeTrades,
          totalDeposits: data.totalDeposits,
          totalWithdrawals: data.totalWithdrawals,
        });
      } else {
        setMessage({ type: 'error', text: 'فشل في تحميل الإحصائيات' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'خطأ في تحميل الإحصائيات' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const response = await fetch('/api/admin/platform-stats', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedStats = await response.json();
        setStats(updatedStats);
        setMessage({ type: 'success', text: 'تم تحديث الإحصائيات بنجاح' });
      } else {
        const error = await response.json();
        setMessage({ type: 'error', text: error.error || 'فشل في تحديث الإحصائيات' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'خطأ في تحديث الإحصائيات' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof typeof formData, value: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatNumber = (num: number) => {
    if (num >= 1000000) {
      return `${(num / 1000000).toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000).toFixed(1)}K`;
    }
    return num.toString();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">جاري تحميل الإحصائيات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">إدارة إحصائيات المنصة</h1>
          <p className="mt-2 text-gray-600">تحديث الإحصائيات المعروضة في الصفحة الرئيسية</p>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg flex items-center ${
            message.type === 'success' 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircleIcon className="h-5 w-5 mr-2" />
            ) : (
              <XCircleIcon className="h-5 w-5 mr-2" />
            )}
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Current Stats Display */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">الإحصائيات الحالية</h2>
            
            {stats && (
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <UsersIcon className="h-8 w-8 text-blue-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">إجمالي المستخدمين</p>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.totalUsers)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CurrencyDollarIcon className="h-8 w-8 text-green-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">إجمالي الحجم</p>
                      <p className="text-2xl font-bold text-gray-900">${formatNumber(stats.totalVolume)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-purple-50 rounded-lg">
                  <div className="flex items-center">
                    <ChartBarIcon className="h-8 w-8 text-purple-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">الصفقات النشطة</p>
                      <p className="text-2xl font-bold text-gray-900">{formatNumber(stats.activeTrades)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <ArrowTrendingUpIcon className="h-8 w-8 text-orange-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">إجمالي الإيداعات</p>
                      <p className="text-2xl font-bold text-gray-900">${formatNumber(stats.totalDeposits)}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <div className="flex items-center">
                    <ArrowTrendingDownIcon className="h-8 w-8 text-red-600 mr-3" />
                    <div>
                      <p className="text-sm text-gray-600">إجمالي السحوبات</p>
                      <p className="text-2xl font-bold text-gray-900">${formatNumber(stats.totalWithdrawals)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Update Form */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">تحديث الإحصائيات</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  إجمالي المستخدمين
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.totalUsers}
                  onChange={(e) => handleInputChange('totalUsers', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  إجمالي الحجم ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalVolume}
                  onChange={(e) => handleInputChange('totalVolume', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  الصفقات النشطة
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.activeTrades}
                  onChange={(e) => handleInputChange('activeTrades', parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  إجمالي الإيداعات ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalDeposits}
                  onChange={(e) => handleInputChange('totalDeposits', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  إجمالي السحوبات ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.totalWithdrawals}
                  onChange={(e) => handleInputChange('totalWithdrawals', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    جاري الحفظ...
                  </>
                ) : (
                  'حفظ التغييرات'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Last Updated */}
        {stats && (
          <div className="mt-8 bg-gray-100 rounded-lg p-4">
            <p className="text-sm text-gray-600">
              آخر تحديث: {new Date(stats.updatedAt).toLocaleString('ar-SA')}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
