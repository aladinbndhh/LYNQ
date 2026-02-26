'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Eye, Users, Calendar, QrCode, Share2, FileText, ChevronRight, Clock } from 'lucide-react';

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  change?: string;
  changeType?: 'positive' | 'negative';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, icon, change, changeType }) => {
  const changeColor =
    changeType === 'positive'
      ? 'text-emerald-600 dark:text-emerald-500'
      : 'text-destructive';

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground">{value}</div>
        {change && <p className={`text-xs text-muted-foreground mt-1 ${changeColor}`}>{change}</p>}
      </CardContent>
    </Card>
  );
};

interface LeadItemProps {
  name: string;
  email: string;
  time: string;
  avatar: string;
}

const LeadItem: React.FC<LeadItemProps> = ({ name, email, time, avatar }) => {
  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
      <div className="size-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
        {avatar}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-foreground truncate">{name}</div>
        <div className="text-xs text-muted-foreground truncate">{email}</div>
      </div>
      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <Clock className="size-3" />
        {time}
      </div>
    </div>
  );
};

interface MeetingItemProps {
  title: string;
  attendee: string;
  time: string;
  date: string;
}

const MeetingItem: React.FC<MeetingItemProps> = ({ title, attendee, time, date }) => {
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card hover:bg-accent/50 transition-colors">
      <div className="size-10 rounded-lg bg-primary/10 flex items-center justify-center">
        <Calendar className="size-5 text-primary" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-sm text-foreground">{title}</div>
        <div className="text-xs text-muted-foreground mt-1">{attendee}</div>
        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
          <span>{date}</span>
          <span>•</span>
          <span>{time}</span>
        </div>
      </div>
      <ChevronRight className="size-4 text-muted-foreground" />
    </div>
  );
};

export function MobileDashboard() {
  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? 'Good Morning' : currentHour < 18 ? 'Good Afternoon' : 'Good Evening';
  const userName = 'Alex';

  const stats = [
    {
      title: 'Profile Views',
      value: '1,234',
      icon: <Eye className="h-4 w-4 text-muted-foreground" />,
      change: '+12.5% from last week',
      changeType: 'positive' as const,
    },
    {
      title: 'Leads Captured',
      value: '89',
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      change: '+8.2% from last week',
      changeType: 'positive' as const,
    },
    {
      title: 'Meetings Booked',
      value: '24',
      icon: <Calendar className="h-4 w-4 text-muted-foreground" />,
      change: '+15.3% from last week',
      changeType: 'positive' as const,
    },
  ];

  const quickActions = [
    { icon: QrCode, label: 'QR Code', variant: 'default' as const },
    { icon: Share2, label: 'Share Profile', variant: 'outline' as const },
    { icon: FileText, label: 'View Leads', variant: 'outline' as const },
  ];

  const recentLeads = [
    { name: 'Sarah Johnson', email: 'sarah.j@example.com', time: '2m ago', avatar: 'SJ' },
    { name: 'Michael Chen', email: 'm.chen@example.com', time: '15m ago', avatar: 'MC' },
    { name: 'Emily Davis', email: 'emily.d@example.com', time: '1h ago', avatar: 'ED' },
    { name: 'James Wilson', email: 'j.wilson@example.com', time: '2h ago', avatar: 'JW' },
  ];

  const upcomingMeetings = [
    { title: 'Product Demo', attendee: 'Sarah Johnson', time: '2:00 PM', date: 'Today' },
    { title: 'Strategy Call', attendee: 'Michael Chen', time: '4:30 PM', date: 'Today' },
    { title: 'Follow-up Meeting', attendee: 'Emily Davis', time: '10:00 AM', date: 'Tomorrow' },
  ];

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-background px-6 lg:px-8 pt-12 pb-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-foreground mb-1">
            {greeting}, {userName}! 👋
          </h1>
          <p className="text-sm text-muted-foreground">
            Here's what's happening with your profile today
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 -mt-2">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatsCard key={index} {...stat} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-3 gap-3 md:gap-4 max-w-md">
            {quickActions.map((action, index) => (
              <Button key={index} variant={action.variant} className="h-auto flex-col gap-2 py-4">
                <action.icon className="h-5 w-5" />
                <span className="text-xs">{action.label}</span>
              </Button>
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Recent Leads */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Recent Leads</h2>
            <Button variant="ghost" size="sm" className="text-xs">
              View All
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recentLeads.map((lead, index) => (
              <LeadItem key={index} {...lead} />
            ))}
          </div>
        </div>

        <Separator className="my-8" />

        {/* Upcoming Meetings */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-foreground">Upcoming Meetings</h2>
            <Button variant="ghost" size="sm" className="text-xs">
              View All
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {upcomingMeetings.map((meeting, index) => (
              <MeetingItem key={index} {...meeting} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
