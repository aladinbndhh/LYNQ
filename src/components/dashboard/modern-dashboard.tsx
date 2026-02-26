'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Eye,
  Users,
  Calendar,
  TrendingUp,
  TrendingDown,
  UserCircle,
  FileText,
  CalendarCheck,
  Settings,
  BarChart3,
  Share2,
  ArrowRight,
  Sparkles,
  Mail,
} from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, trend, icon }) => {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-3xl font-bold mt-2">{value}</h3>
            <div className="flex items-center mt-2 gap-1">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={`text-sm font-medium ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}
              >
                {change}
              </span>
              <span className="text-sm text-muted-foreground">vs last month</span>
            </div>
          </div>
          <div className="ml-4 p-3 bg-primary/10 rounded-lg">{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
};

interface ActionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  buttonText: string;
  href: string;
}

const ActionCard: React.FC<ActionCardProps> = ({ title, description, icon, buttonText, href }) => {
  return (
    <Card className="hover:shadow-lg transition-all hover:border-primary/50">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="p-2 bg-primary/10 rounded-lg mb-4">{icon}</div>
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Link href={href}>
          <Button className="w-full" variant="outline">
            {buttonText}
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
};

interface ModernDashboardProps {
  userName: string;
  userAvatar?: string;
}

export function ModernDashboard({ userName, userAvatar }: ModernDashboardProps) {
  const stats = [
    {
      title: 'Profile Views',
      value: '12,543',
      change: '+12.5%',
      trend: 'up' as const,
      icon: <Eye className="w-6 h-6 text-primary" />,
    },
    {
      title: 'Leads Captured',
      value: '1,847',
      change: '+8.2%',
      trend: 'up' as const,
      icon: <Users className="w-6 h-6 text-primary" />,
    },
    {
      title: 'Meetings Booked',
      value: '342',
      change: '+15.3%',
      trend: 'up' as const,
      icon: <Calendar className="w-6 h-6 text-primary" />,
    },
  ];

  const actionCards = [
    {
      title: 'Manage Profiles',
      description: 'Update your professional profiles and customize your digital presence',
      icon: <UserCircle className="w-6 h-6 text-primary" />,
      buttonText: 'Edit Profiles',
      href: '/dashboard/profiles',
    },
    {
      title: 'View Leads',
      description: 'Access and manage all your captured leads in one centralized location',
      icon: <FileText className="w-6 h-6 text-primary" />,
      buttonText: 'View All Leads',
      href: '/dashboard/leads',
    },
    {
      title: 'Schedule Meetings',
      description: 'Book and manage meetings with your prospects and clients',
      icon: <CalendarCheck className="w-6 h-6 text-primary" />,
      buttonText: 'Open Calendar',
      href: '/dashboard/meetings',
    },
    {
      title: 'Analytics',
      description: 'Track performance metrics and gain insights into your engagement',
      icon: <BarChart3 className="w-6 h-6 text-primary" />,
      buttonText: 'View Analytics',
      href: '/dashboard/analytics',
    },
    {
      title: 'Email Signature',
      description: 'Generate professional email signatures with your company logo badge',
      icon: <Mail className="w-6 h-6 text-primary" />,
      buttonText: 'Generate Signature',
      href: '/dashboard/email-signature',
    },
    {
      title: 'Settings',
      description: 'Configure your account preferences and integrations',
      icon: <Settings className="w-6 h-6 text-primary" />,
      buttonText: 'Manage Settings',
      href: '/dashboard/settings',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-lg flex items-center justify-center text-white font-bold text-lg">
                L
              </div>
              <span className="text-xl font-bold">LynQ</span>
            </div>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-primary transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/dashboard/profiles"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Business Cards
              </Link>
              <Link
                href="/dashboard/leads"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
              >
                Leads
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/dashboard/settings">
                <Button variant="ghost" size="sm">
                  <Settings className="w-4 h-4" />
                </Button>
              </Link>
              <Avatar>
                {userAvatar ? (
                  <AvatarImage src={userAvatar} />
                ) : (
                  <AvatarFallback>{userName.charAt(0).toUpperCase()}</AvatarFallback>
                )}
              </Avatar>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Welcome back, {userName}!</h1>
          <p className="text-lg text-muted-foreground">
            Here's what's happening with your account today.
          </p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <StatCard key={index} {...stat} />
          ))}
        </div>

        {/* Action Cards Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {actionCards.map((card, index) => (
              <ActionCard key={index} {...card} />
            ))}
          </div>
        </div>

        {/* Promotional Banner - Company Logo Badge Feature */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-primary/20">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <Badge variant="secondary" className="bg-primary/20 text-primary border-0">
                    Key Feature
                  </Badge>
                </div>
                <h3 className="text-2xl font-bold mb-2">Company Logo Badge</h3>
                <p className="text-muted-foreground mb-4">
                  Showcase your brand identity with our company logo badge feature. Your company logo
                  appears as a small circular badge beside your profile picture in digital cards, email
                  signatures, and mobile apps.
                </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/dashboard/profile-preview">
                  <Button>
                    Try It Now
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
                <Link href="/dashboard/email-signature">
                  <Button variant="outline">Generate Signature</Button>
                </Link>
                <Link href="/dashboard/mobile-preview">
                  <Button variant="outline">Mobile Preview</Button>
                </Link>
                <Link href="/pricing">
                  <Button variant="outline">View Pricing</Button>
                </Link>
              </div>
              </div>
              <div className="flex-shrink-0">
                <div className="relative">
                  <div className="w-48 h-48 bg-card rounded-2xl border-2 border-border shadow-xl flex items-center justify-center">
                    <div className="text-center">
                      <div className="relative inline-block">
                        <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-3">
                          <UserCircle className="w-12 h-12 text-primary" />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-white rounded-full border-2 border-background shadow-lg flex items-center justify-center">
                          <div className="w-6 h-6 bg-primary/20 rounded-full" />
                        </div>
                      </div>
                      <p className="text-sm font-medium">Logo Badge</p>
                    </div>
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-br from-indigo-500 to-rose-500 rounded-full flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
