import { Types } from 'mongoose';
import { Meeting, Tenant } from '@/lib/db/models';
import { IMeeting } from '@/types';
import { TenantContext } from '@/lib/middleware/tenant';
import {
  listGoogleCalendarEvents,
  createGoogleCalendarEvent,
} from '@/lib/integrations/google-calendar';
import {
  listOutlookCalendarEvents,
  createOutlookCalendarEvent,
} from '@/lib/integrations/outlook';
import { OdooClient } from '@/lib/integrations/odoo-client';
import { addMinutes, startOfDay, endOfDay, parseISO, format } from 'date-fns';
import { toZonedTime, fromZonedTime } from 'date-fns-tz';

export class CalendarService {
  /**
   * Get available time slots
   */
  static async getAvailability(data: {
    profileId: string;
    date: string;
    duration?: number;
    timezone?: string;
    tenantContext: TenantContext;
  }): Promise<Array<{ start: string; end: string }>> {
    const duration = data.duration || 30;
    const timezone = data.timezone || 'UTC';
    const date = parseISO(data.date);

    // Define business hours (9 AM to 5 PM)
    const businessStart = 9;
    const businessEnd = 17;

    // Get tenant calendar integrations
    const tenant = await Tenant.findById(data.tenantContext.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Get busy times from all calendar sources
    const busyTimes: Array<{ start: Date; end: Date }> = [];

    for (const integration of tenant.calendarIntegrations || []) {
      try {
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        if (integration.provider === 'google') {
          const events = await listGoogleCalendarEvents(
            integration.accessToken,
            integration.refreshToken,
            dayStart,
            dayEnd
          );

          events.forEach((event: any) => {
            if (event.start?.dateTime && event.end?.dateTime) {
              busyTimes.push({
                start: new Date(event.start.dateTime),
                end: new Date(event.end.dateTime),
              });
            }
          });
        } else if (integration.provider === 'outlook') {
          const events = await listOutlookCalendarEvents(
            integration.accessToken,
            dayStart.toISOString(),
            dayEnd.toISOString()
          );

          events.forEach((event: any) => {
            if (event.start?.dateTime && event.end?.dateTime) {
              busyTimes.push({
                start: new Date(event.start.dateTime),
                end: new Date(event.end.dateTime),
              });
            }
          });
        } else if (integration.provider === 'odoo') {
          // Odoo calendar integration
          if (tenant.odooConfig) {
            try {
              const { OdooClient } = await import('@/lib/integrations/odoo-client');
              const client = new OdooClient({
                url: tenant.odooConfig.url,
                database: tenant.odooConfig.database,
                username: '', // Would come from OAuth in production
                password: tenant.odooConfig.accessToken || '',
              });

              const events = await client.getCalendarEvents(dayStart, dayEnd);
              events.forEach((event: any) => {
                if (event.start && event.stop) {
                  busyTimes.push({
                    start: new Date(event.start),
                    end: new Date(event.stop),
                  });
                }
              });
            } catch (odooError) {
              console.error('Error fetching Odoo calendar:', odooError);
            }
          }
        }
      } catch (error) {
        console.error(`Error fetching ${integration.provider} calendar:`, error);
      }
    }

    // Generate available slots
    const slots: Array<{ start: string; end: string }> = [];
    let currentHour = businessStart;

    while (currentHour < businessEnd) {
      const slotStart = new Date(date);
      slotStart.setHours(currentHour, 0, 0, 0);
      const slotEnd = addMinutes(slotStart, duration);

      // Check if slot conflicts with any busy time
      const hasConflict = busyTimes.some((busy) => {
        return slotStart < busy.end && slotEnd > busy.start;
      });

      if (!hasConflict) {
        slots.push({
          start: format(slotStart, "yyyy-MM-dd'T'HH:mm:ss"),
          end: format(slotEnd, "yyyy-MM-dd'T'HH:mm:ss"),
        });
      }

      currentHour++;
    }

    return slots;
  }

  /**
   * Book a meeting
   */
  static async bookMeeting(
    data: {
      profileId: string;
      leadId?: string;
      conversationId?: string;
      title: string;
      description?: string;
      startTime: string;
      endTime: string;
      timezone: string;
      attendees: Array<{ name: string; email: string }>;
      location?: string;
    },
    tenantContext: TenantContext
  ): Promise<IMeeting> {
    const tenant = await Tenant.findById(tenantContext.tenantId);
    if (!tenant) {
      throw new Error('Tenant not found');
    }

    // Use the first available calendar integration
    const integration = tenant.calendarIntegrations?.[0];
    if (!integration) {
      throw new Error('No calendar integration found');
    }

    let externalEventId: string | undefined;

    // Create event in external calendar
    try {
      if (integration.provider === 'google') {
        const event = await createGoogleCalendarEvent(
          integration.accessToken,
          integration.refreshToken,
          {
            summary: data.title,
            description: data.description,
            start: {
              dateTime: data.startTime,
              timeZone: data.timezone,
            },
            end: {
              dateTime: data.endTime,
              timeZone: data.timezone,
            },
            attendees: data.attendees.map((a) => ({ email: a.email })),
            location: data.location,
          }
        );
        externalEventId = event.id || undefined;
      } else if (integration.provider === 'outlook') {
        const event = await createOutlookCalendarEvent(integration.accessToken, {
          subject: data.title,
          body: data.description
            ? { contentType: 'text', content: data.description }
            : undefined,
          start: {
            dateTime: data.startTime,
            timeZone: data.timezone,
          },
          end: {
            dateTime: data.endTime,
            timeZone: data.timezone,
          },
          attendees: data.attendees.map((a) => ({
            emailAddress: { address: a.email, name: a.name },
          })),
          location: data.location ? { displayName: data.location } : undefined,
        });
        externalEventId = event.id || undefined;
      } else if (integration.provider === 'odoo') {
        // Odoo calendar integration
        if (tenant.odooConfig) {
          try {
            const { OdooClient } = await import('@/lib/integrations/odoo-client');
            const client = new OdooClient({
              url: tenant.odooConfig.url,
              database: tenant.odooConfig.database,
              username: '', // Would come from OAuth in production
              password: tenant.odooConfig.accessToken || '',
            });

            // Get attendee partner IDs from Odoo (if they exist)
            const partnerIds: number[] = [];
            for (const attendee of data.attendees) {
              if (attendee.email) {
                try {
                  const partners = await client.searchRead(
                    'res.partner',
                    [['email', '=', attendee.email]],
                    ['id'],
                    1
                  );
                  if (partners.length > 0) {
                    partnerIds.push(partners[0].id);
                  }
                } catch (err) {
                  // Partner doesn't exist, skip
                }
              }
            }

            const eventId = await client.createCalendarEvent({
              name: data.title,
              start: data.startTime,
              stop: data.endTime,
              partner_ids: partnerIds,
              location: data.location,
              description: data.description,
            });
            externalEventId = eventId.toString();
          } catch (odooError) {
            console.error('Error creating Odoo calendar event:', odooError);
          }
        }
      }
    } catch (error) {
      console.error('Error creating calendar event:', error);
    }

    // Create meeting record
    const meeting = await Meeting.create({
      tenantId: tenantContext.tenantId,
      profileId: data.profileId,
      leadId: data.leadId,
      conversationId: data.conversationId,
      title: data.title,
      description: data.description,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
      timezone: data.timezone,
      attendees: data.attendees,
      location: data.location,
      calendarProvider: integration.provider,
      externalEventId,
      status: 'scheduled',
    });

    return meeting;
  }

  /**
   * List meetings
   */
  static async listMeetings(
    tenantContext: TenantContext,
    filters?: {
      profileId?: string;
      leadId?: string;
      status?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<IMeeting[]> {
    const query: any = { tenantId: tenantContext.tenantId };

    if (filters?.profileId) query.profileId = filters.profileId;
    if (filters?.leadId) query.leadId = filters.leadId;
    if (filters?.status) query.status = filters.status;

    if (filters?.startDate || filters?.endDate) {
      query.startTime = {};
      if (filters.startDate) query.startTime.$gte = filters.startDate;
      if (filters.endDate) query.startTime.$lte = filters.endDate;
    }

    return Meeting.find(query).sort({ startTime: 1 });
  }

  /**
   * Cancel meeting
   */
  static async cancelMeeting(
    meetingId: string,
    tenantContext: TenantContext
  ): Promise<IMeeting | null> {
    return Meeting.findOneAndUpdate(
      {
        _id: meetingId,
        tenantId: tenantContext.tenantId,
      },
      { $set: { status: 'cancelled' } },
      { new: true }
    );
  }
}
