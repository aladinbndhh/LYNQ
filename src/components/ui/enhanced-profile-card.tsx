'use client';

import * as React from 'react';
import Image from 'next/image';
import { Mail, Phone, Linkedin, Twitter, Share2, QrCode, MapPin, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EnhancedProfileCardProps {
  name: string;
  title: string;
  company: string;
  bio?: string;
  avatar?: string;
  companyLogo?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedin?: string;
  twitter?: string;
  qrCode?: string;
  primaryColor?: string;
}

export function EnhancedProfileCard({
  name,
  title,
  company,
  bio,
  avatar,
  companyLogo,
  email,
  phone,
  location,
  linkedin,
  twitter,
  qrCode,
  primaryColor = '#3b82f6',
}: EnhancedProfileCardProps) {
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: name,
        text: `${title} at ${company}`,
        url: window.location.href,
      });
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="relative overflow-hidden rounded-3xl border border-border/20 bg-card/40 backdrop-blur-xl shadow-xl">
        {/* Gradient Background */}
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: `linear-gradient(135deg, ${primaryColor}15 0%, transparent 50%, ${primaryColor}10 100%)`,
          }}
        />

        <div className="relative z-10 p-8 space-y-6">
          {/* Header with Avatar and Company Logo */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Avatar with Company Logo Badge */}
              <div className="relative">
                {avatar ? (
                  <Image
                    src={avatar}
                    alt={name}
                    width={80}
                    height={80}
                    className="rounded-full border-2 shadow-lg object-cover"
                    style={{ borderColor: primaryColor }}
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                    style={{ backgroundColor: primaryColor }}
                  >
                    {getInitials(name)}
                  </div>
                )}

                {/* Company Logo Badge - positioned beside avatar */}
                {companyLogo && (
                  <div className="absolute -right-2 -bottom-2 w-10 h-10 rounded-full bg-white border-2 border-background shadow-md p-1.5 flex items-center justify-center">
                    <Image
                      src={companyLogo}
                      alt={company}
                      width={32}
                      height={32}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}

                {/* Online Status Indicator */}
                <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-500 border-2 border-background" />
              </div>

              {/* Name and Title */}
              <div>
                <h2 className="text-2xl font-bold text-foreground">{name}</h2>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-1">
                  <span>{title}</span>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground mt-0.5">
                  <Building2 className="h-3.5 w-3.5" />
                  <span>{company}</span>
                </div>
              </div>
            </div>

            {/* QR Code */}
            {qrCode && (
              <div className="relative p-2 bg-background/80 rounded-xl border border-border/40 shadow-sm">
                <Image src={qrCode} alt="QR Code" width={80} height={80} className="rounded-lg" />
                <div
                  className="absolute -top-2 -right-2 rounded-full p-1 text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <QrCode className="h-3 w-3" />
                </div>
              </div>
            )}
          </div>

          {/* Location */}
          {location && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{location}</span>
            </div>
          )}

          {/* Bio */}
          {bio && (
            <p className="text-sm text-muted-foreground leading-relaxed">{bio}</p>
          )}

          <div className="h-px bg-border/40 rounded-full" />

          {/* Contact Buttons */}
          <div className="grid grid-cols-2 gap-3">
            {email && (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => window.location.href = `mailto:${email}`}
              >
                <Mail className="h-4 w-4" />
                <span className="truncate">Email</span>
              </Button>
            )}

            {phone && (
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start gap-2"
                onClick={() => window.location.href = `tel:${phone}`}
              >
                <Phone className="h-4 w-4" />
                <span className="truncate">Call</span>
              </Button>
            )}
          </div>

          {/* Social Links and Share */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {linkedin && (
                <a
                  href={linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary/50 hover:bg-secondary text-secondary-foreground border border-border/20 transition-all"
                >
                  <Linkedin className="h-4 w-4" />
                </a>
              )}

              {twitter && (
                <a
                  href={twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-secondary/50 hover:bg-secondary text-secondary-foreground border border-border/20 transition-all"
                >
                  <Twitter className="h-4 w-4" />
                </a>
              )}
            </div>

            <Button
              onClick={handleShare}
              size="sm"
              className="gap-2 text-white"
              style={{ backgroundColor: primaryColor }}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
          </div>
        </div>

        {/* Glassmorphism Border */}
        <div className="absolute inset-0 rounded-3xl border border-white/10 pointer-events-none" />
      </div>
    </div>
  );
}
