'use client';

import React, { useState } from 'react';
import { Upload, X, User, Building2, Mail, Phone, Linkedin, Twitter, Palette, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { IProfile } from '@/types';

interface ProfileFormProps {
  initialData?: Partial<IProfile>;
  onSave: (data: any) => Promise<void>;
  onCancel: () => void;
}

export function ProfileForm({ initialData, onSave, onCancel }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    username: initialData?.username || '',
    displayName: initialData?.displayName || '',
    title: initialData?.title || '',
    company: initialData?.company || '',
    bio: initialData?.bio || '',
    email: initialData?.contactInfo?.email || '',
    phone: initialData?.contactInfo?.phone || '',
    linkedin: initialData?.contactInfo?.linkedin || '',
    twitter: initialData?.contactInfo?.twitter || '',
    primaryColor: initialData?.branding?.primaryColor || '#3b82f6',
    aiGreeting: initialData?.aiConfig?.greeting || "Hi! How can I help you today?",
    qualificationQuestions: initialData?.aiConfig?.qualificationQuestions?.join('\n') || '',
  });

  const [avatarPreview, setAvatarPreview] = useState<string>(initialData?.avatar || '');
  const [logoPreview, setLogoPreview] = useState<string>(initialData?.branding?.logo || '');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'logo') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        if (type === 'avatar') {
          setAvatarPreview(result);
        } else {
          setLogoPreview(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = (type: 'avatar' | 'logo') => {
    if (type === 'avatar') {
      setAvatarPreview('');
    } else {
      setLogoPreview('');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await onSave({
        ...formData,
        avatar: avatarPreview,
        branding: {
          primaryColor: formData.primaryColor,
          logo: logoPreview,
        },
        contactInfo: {
          email: formData.email,
          phone: formData.phone,
          linkedin: formData.linkedin,
          twitter: formData.twitter,
        },
        aiConfig: {
          enabled: true,
          greeting: formData.aiGreeting,
          qualificationQuestions: formData.qualificationQuestions.split('\n').filter(q => q.trim()),
          personality: 'professional and friendly',
          autoBooking: true,
        },
      });
    } catch (error) {
      console.error('Save error:', error);
    } finally {
      setLoading(false);
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
          <CardDescription>Your personal details and professional information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                placeholder="johndoe"
              />
              <p className="text-xs text-muted-foreground">
                Your unique profile URL: lynq.com/{formData.username}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Full Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayName"
                  name="displayName"
                  value={formData.displayName}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Job Title</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Senior Product Manager"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <div className="relative">
                <Building2 className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="Tech Innovations Inc."
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              placeholder="Tell visitors about yourself..."
              rows={4}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Profile Images</CardTitle>
          <CardDescription>Upload your avatar and company logo</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Avatar Upload */}
            <div className="space-y-4">
              <Label>Avatar</Label>
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-32 w-32">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt={formData.displayName} />
                  ) : (
                    <AvatarFallback className="text-2xl">
                      {getInitials(formData.displayName || 'User')}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => document.getElementById('avatar-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload
                  </Button>
                  {avatarPreview && (
                    <Button variant="outline" size="sm" type="button" onClick={() => clearImage('avatar')}>
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'avatar')}
                />
              </div>
            </div>

            {/* Company Logo Upload with Preview */}
            <div className="space-y-4">
              <Label>Company Logo (Badge Preview)</Label>
              <div className="flex flex-col items-center space-y-4">
                {/* Preview of Avatar + Logo Badge */}
                <div className="relative">
                  <Avatar className="h-32 w-32">
                    {avatarPreview ? (
                      <AvatarImage src={avatarPreview} alt={formData.displayName} />
                    ) : (
                      <AvatarFallback className="text-2xl">
                        {getInitials(formData.displayName || 'User')}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  {/* Company Logo Badge */}
                  <div
                    className="absolute -bottom-2 -right-2 h-12 w-12 rounded-full border-4 border-background flex items-center justify-center p-1.5"
                    style={{ backgroundColor: logoPreview ? 'white' : formData.primaryColor }}
                  >
                    {logoPreview ? (
                      <img
                        src={logoPreview}
                        alt="Company logo"
                        className="h-full w-full rounded-full object-contain"
                      />
                    ) : (
                      <Building2 className="h-5 w-5 text-white" />
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => document.getElementById('logo-upload')?.click()}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Logo
                  </Button>
                  {logoPreview && (
                    <Button variant="outline" size="sm" type="button" onClick={() => clearImage('logo')}>
                      <X className="h-4 w-4 mr-2" />
                      Remove
                    </Button>
                  )}
                </div>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, 'logo')}
                />
                <p className="text-xs text-muted-foreground text-center">
                  Preview shows how your logo appears as a badge with your avatar
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
          <CardDescription>How people can reach you</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="your.email@example.com"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedin">LinkedIn</Label>
              <div className="relative">
                <Linkedin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="linkedin"
                  name="linkedin"
                  value={formData.linkedin}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="linkedin.com/in/username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twitter">Twitter</Label>
              <div className="relative">
                <Twitter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="twitter"
                  name="twitter"
                  value={formData.twitter}
                  onChange={handleInputChange}
                  className="pl-10"
                  placeholder="@username"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Branding Settings</CardTitle>
          <CardDescription>Customize your profile appearance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="primaryColor">Primary Color</Label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Palette className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="primaryColor"
                  name="primaryColor"
                  type="text"
                  value={formData.primaryColor}
                  onChange={handleInputChange}
                  className="pl-10 w-40"
                  placeholder="#3b82f6"
                />
              </div>
              <input
                type="color"
                value={formData.primaryColor}
                onChange={(e) => setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))}
                className="h-10 w-20 rounded-md border border-border cursor-pointer"
              />
              <div
                className="h-10 w-32 rounded-md border border-border"
                style={{ backgroundColor: formData.primaryColor }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>AI Configuration</CardTitle>
          <CardDescription>Set up your AI assistant behavior</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="aiGreeting">AI Greeting Message</Label>
            <div className="relative">
              <Bot className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Textarea
                id="aiGreeting"
                name="aiGreeting"
                value={formData.aiGreeting}
                onChange={handleInputChange}
                className="pl-10 resize-none"
                rows={2}
                placeholder="Enter the greeting message for your AI assistant"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="qualificationQuestions">Qualification Questions</Label>
            <Textarea
              id="qualificationQuestions"
              name="qualificationQuestions"
              value={formData.qualificationQuestions}
              onChange={handleInputChange}
              className="resize-none"
              rows={5}
              placeholder="Enter qualification questions (one per line)"
            />
            <p className="text-xs text-muted-foreground">
              Add one question per line. These will be asked by your AI assistant.
            </p>
          </div>
        </CardContent>
      </Card>

      <Separator />

      <div className="flex justify-end gap-4 pb-6">
        <Button variant="outline" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={loading}>
          {loading ? 'Saving...' : 'Save Profile'}
        </Button>
      </div>
    </div>
  );
}
