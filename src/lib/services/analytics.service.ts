import { Types } from 'mongoose';
import { Analytics } from '@/lib/db/models';
import { IAnalytics } from '@/types';

export class AnalyticsService {
  /**
   * Track an analytics event
   */
  static async trackEvent(data: {
    tenantId: Types.ObjectId;
    profileId: Types.ObjectId;
    eventType: IAnalytics['eventType'];
    metadata?: object;
    ipAddress?: string;
    userAgent?: string;
    referrer?: string;
  }): Promise<IAnalytics> {
    return Analytics.create({
      ...data,
      timestamp: new Date(),
    });
  }

  /**
   * Get analytics for a profile
   */
  static async getProfileAnalytics(
    profileId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    const filter: any = { profileId: new Types.ObjectId(profileId) };

    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = startDate;
      if (endDate) filter.timestamp.$lte = endDate;
    }

    const [total, byType, timeline] = await Promise.all([
      // Total events
      Analytics.countDocuments(filter),

      // Events by type
      Analytics.aggregate([
        { $match: filter },
        { $group: { _id: '$eventType', count: { $sum: 1 } } },
      ]),

      // Timeline (last 30 days)
      Analytics.aggregate([
        { $match: filter },
        {
          $group: {
            _id: {
              $dateToString: { format: '%Y-%m-%d', date: '$timestamp' },
            },
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
        { $limit: 30 },
      ]),
    ]);

    return {
      total,
      byType: byType.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {} as Record<string, number>),
      timeline: timeline.reverse(),
    };
  }
}
