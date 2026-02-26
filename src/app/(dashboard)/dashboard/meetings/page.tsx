'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Video, Users, Loader2 } from 'lucide-react';
import { IMeeting } from '@/types';

export default function MeetingsPage() {
  const [meetings, setMeetings] = useState<IMeeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/calendar/meetings');
      const data = await response.json();

      if (data.success) {
        setMeetings(data.data);
      }
    } catch (error) {
      console.error('Failed to fetch meetings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      scheduled: 'bg-blue-100 text-blue-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-gray-100 text-gray-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <nav className="bg-card shadow-sm border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/dashboard" className="text-2xl font-bold bg-gradient-to-r from-indigo-500 to-rose-500 bg-clip-text text-transparent">
                LynQ
              </Link>
              <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                Dashboard
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-foreground">Meetings</h2>
          <p className="text-muted-foreground mt-2">View and manage your scheduled meetings</p>
        </div>

        {meetings.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No meetings yet</h3>
            <p className="text-muted-foreground mb-6">
              Meetings booked through your profile will appear here
            </p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {meetings.map((meeting) => (
              <Card key={meeting._id.toString()}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <h3 className="text-xl font-semibold">{meeting.title}</h3>
                        <Badge className={getStatusColor(meeting.status)}>{meeting.status}</Badge>
                      </div>

                      {meeting.description && (
                        <p className="text-sm text-muted-foreground mb-4">{meeting.description}</p>
                      )}

                      <div className="grid md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span>
                            {new Date(meeting.startTime).toLocaleString()} -{' '}
                            {new Date(meeting.endTime).toLocaleTimeString()}
                          </span>
                        </div>

                        {meeting.location && (
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" />
                            <span>{meeting.location}</span>
                          </div>
                        )}

                        {meeting.videoLink && (
                          <div className="flex items-center gap-2">
                            <Video className="w-4 h-4 text-muted-foreground" />
                            <a
                              href={meeting.videoLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline"
                            >
                              Join Video Call
                            </a>
                          </div>
                        )}

                        {meeting.attendees.length > 0 && (
                          <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-muted-foreground" />
                            <span>{meeting.attendees.length} attendees</span>
                          </div>
                        )}
                      </div>

                      {meeting.attendees.length > 0 && (
                        <div className="mt-4">
                          <p className="text-xs font-medium text-muted-foreground mb-2">Attendees:</p>
                          <div className="flex flex-wrap gap-2">
                            {meeting.attendees.map((attendee, idx) => (
                              <Badge key={idx} variant="outline">
                                {attendee.name}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-2">
                      {meeting.status === 'scheduled' && (
                        <Button variant="outline" size="sm">
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
