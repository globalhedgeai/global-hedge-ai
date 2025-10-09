import { NextRequest, NextResponse } from 'next/server';
import { getIronSession } from 'iron-session';
import { sessionOptions, type IronSession } from '@/lib/session';
import { PerformanceMonitoringService } from '@/lib/performanceMonitoring';

export async function GET(req: NextRequest) {
  const session = await getIronSession(req, new NextResponse(), sessionOptions) as IronSession;
  
  // Check if user is admin
  if (!session.user || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPPORT')) {
    return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get('period') as 'today' | 'week' | 'month' | 'all' || 'all';
    const type = searchParams.get('type') || 'metrics';

    switch (type) {
      case 'metrics':
        const metrics = await PerformanceMonitoringService.getMetrics(period);
        return NextResponse.json({ ok: true, metrics });

      case 'trends':
        const days = parseInt(searchParams.get('days') || '30');
        const trends = await PerformanceMonitoringService.getTrends(days);
        return NextResponse.json({ ok: true, trends });

      case 'performers':
        const performers = await PerformanceMonitoringService.getTopPerformers();
        return NextResponse.json({ ok: true, performers });

      case 'alerts':
        const alerts = await PerformanceMonitoringService.getSystemAlerts();
        return NextResponse.json({ ok: true, alerts });

      default:
        return NextResponse.json({ ok: false, error: 'Invalid type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Performance monitoring error:', error);
    return NextResponse.json(
      { ok: false, error: 'Failed to fetch performance data' },
      { status: 500 }
    );
  }
}
