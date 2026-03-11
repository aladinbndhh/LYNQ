import { NextRequest } from 'next/server';
import { Types } from 'mongoose';
import connectDB from '@/lib/db/connection';
import { Lead, Profile, Meeting, Analytics } from '@/lib/db/models';
import { requireAuth } from '@/lib/middleware/auth';
import { createTenantContext } from '@/lib/middleware/tenant';
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/utils/api';

// GET /api/dashboard/stats — Aggregated real stats for the dashboard
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    const session = await requireAuth(request);
    const tenantContext = createTenantContext(session);
    const tenantId = tenantContext.tenantId;

    const now = new Date();
    const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);

    const [
      // Profiles
      profileCount,
      profileIds,

      // Leads
      totalLeads,
      leadsThisMonth,
      leadsLastMonth,
      leadsByStatus,

      // Meetings
      totalMeetings,
      upcomingMeetings,
      meetingsThisMonth,
      meetingsLastMonth,
    ] = await Promise.all([
      Profile.countDocuments({ tenantId }),
      Profile.find({ tenantId }).select('_id').lean(),

      Lead.countDocuments({ tenantId }),
      Lead.countDocuments({ tenantId, createdAt: { $gte: startOfThisMonth } }),
      Lead.countDocuments({ tenantId, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
      Lead.aggregate([
        { $match: { tenantId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),

      Meeting.countDocuments({ tenantId }),
      Meeting.countDocuments({ tenantId, startTime: { $gte: now }, status: { $in: ['scheduled', 'confirmed'] } }),
      Meeting.countDocuments({ tenantId, createdAt: { $gte: startOfThisMonth } }),
      Meeting.countDocuments({ tenantId, createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
    ]);

    // Analytics (views + scans across all tenant profiles)
    const pIds = profileIds.map((p: any) => p._id);
    const [totalViews, viewsThisMonth, viewsLastMonth, recentActivity] = pIds.length > 0
      ? await Promise.all([
          Analytics.countDocuments({ profileId: { $in: pIds }, eventType: { $in: ['view', 'qr_scan', 'nfc_scan'] } }),
          Analytics.countDocuments({ profileId: { $in: pIds }, eventType: { $in: ['view', 'qr_scan', 'nfc_scan'] }, timestamp: { $gte: startOfThisMonth } }),
          Analytics.countDocuments({ profileId: { $in: pIds }, eventType: { $in: ['view', 'qr_scan', 'nfc_scan'] }, timestamp: { $gte: startOfLastMonth, $lte: endOfLastMonth } }),
          // Last 7 days activity breakdown
          Analytics.aggregate([
            { $match: { profileId: { $in: pIds }, timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, count: { $sum: 1 } } },
            { $sort: { _id: 1 } },
          ]),
        ])
      : [0, 0, 0, []];

    const pct = (current: number, previous: number) => {
      if (previous === 0) return current > 0 ? 100 : 0;
      return Math.round(((current - previous) / previous) * 100);
    };

    return successResponse({
      profiles: profileCount,
      leads: {
        total: totalLeads,
        thisMonth: leadsThisMonth,
        changePercent: pct(leadsThisMonth, leadsLastMonth),
        byStatus: leadsByStatus.reduce((acc: Record<string, number>, item: any) => { acc[item._id] = item.count; return acc; }, {}),
      },
      meetings: {
        total: totalMeetings,
        upcoming: upcomingMeetings,
        thisMonth: meetingsThisMonth,
        changePercent: pct(meetingsThisMonth, meetingsLastMonth),
      },
      views: {
        total: totalViews,
        thisMonth: viewsThisMonth,
        changePercent: pct(viewsThisMonth, viewsLastMonth),
      },
      recentActivity,
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') return unauthorizedResponse();
    return errorResponse(error.message || 'Failed to fetch dashboard stats', 500);
  }
}
