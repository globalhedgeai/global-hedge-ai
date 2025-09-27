import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Default policies - يمكن تحسينها لاحقاً لتكون قابلة للتكوين من قاعدة البيانات
    const policies = {
      depositFeePct: 0, // رسوم الإيداع (افتراضي 0%)
      withdraw: {
        firstWithdrawMinDays: 45, // الحد الأدنى لأول سحب
        weeklyFeePct: 7, // رسوم أسبوعية
        monthlyFeePct: 3, // رسوم شهرية
        monthlyThresholdDays: 30 // حد الأيام للرسوم الشهرية
      },
      rewards: {
        enabled: false, // المكافآت العشوائية (معطلة افتراضياً)
        chancePct: 5, // نسبة الفرصة
        bonusPct: 2 // نسبة المكافأة
      }
    };

    return NextResponse.json({
      ok: true,
      policies
    });
  } catch (error) {
    console.error('Error fetching policies:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch policies' },
      { status: 500 }
    );
  }
}