# LynQ Design Features

## Overview

LynQ features a modern, professional design system built with Next.js, Tailwind CSS, and Framer Motion. The design emphasizes clarity, elegance, and brand identity.

## Key Design Features

### 1. Company Logo Badge

**The Signature Feature**: A circular company logo badge that appears beside profile pictures throughout the platform.

#### Visual Representation

```
Profile Picture (with Company Logo Badge):

    ┌───────────────┐
    │               │
    │               │
    │    Profile    │
    │     Photo     │
    │               │
    │               │   ┌────┐
    │               │   │ 🏢 │ ← Company Logo
    └───────────────┘   └────┘
                          ↑
                    Small circle badge
```

#### Where It Appears

✅ **Public Profile Pages** - Visitors see the company branding
✅ **Email Signatures** - Professional email communications
✅ **Dashboard Cards** - Internal profile management
✅ **Mobile Views** - Responsive across all devices
✅ **QR Code Cards** - Printable business cards

#### Implementation

```tsx
<div className="relative">
  {/* Profile Picture */}
  <img 
    src={avatar} 
    className="w-20 h-20 rounded-full border-2" 
    style={{ borderColor: primaryColor }}
  />
  
  {/* Company Logo Badge */}
  {companyLogo && (
    <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white border-2 border-white shadow-md p-1.5">
      <img 
        src={companyLogo} 
        className="w-full h-full object-contain"
      />
    </div>
  )}
</div>
```

### 2. Hero Section

**Animated Gradient Hero** with floating geometric shapes:

- Dark background (`#030303`) with gradient overlays
- Animated floating shapes with glassmorphism
- Gradient text effects (indigo → white → rose)
- Smooth fade-up animations
- Call-to-action buttons with hover effects

### 3. Color System

**Primary Palette:**
```css
Indigo: #6366f1  /* Technology, trust */
Rose:   #f43f5e  /* Energy, passion */
Violet: #8b5cf6  /* Creativity */
```

**Gradients:**
```css
Hero Text:    from-indigo-300 via-white/90 to-rose-300
CTA Buttons:  from-indigo-500 to-rose-500
Feature Cards: from-indigo-500/20 to-rose-500/20
```

**Neutral Colors:**
```css
Background Dark: #030303
Background Light: #f9fafb
Text Dark:        #111827
Text Light:       #6b7280
Border:           #e5e7eb
```

### 4. Typography

**Font Stack:**
- Primary: Inter (via Google Fonts)
- Fallback: -apple-system, BlinkMacSystemFont, 'Segoe UI'

**Font Sizes:**
- Hero Heading: 5xl - 8xl (responsive)
- Section Heading: 3xl
- Card Title: xl
- Body: sm - base
- Caption: xs

**Font Weights:**
- Bold: 700 (headings)
- Semibold: 600 (subheadings)
- Medium: 500 (buttons)
- Normal: 400 (body)
- Light: 300 (subtitles)

### 5. Glassmorphism Effects

**Profile Cards:**
```css
background: rgba(255, 255, 255, 0.03)
backdrop-filter: blur(12px)
border: 1px solid rgba(255, 255, 255, 0.08)
```

**Benefits:**
- Modern, premium feel
- Depth and layering
- Subtle transparency
- Works on any background

### 6. Animation System

**Powered by Framer Motion:**

- Fade-up entrance animations
- Staggered children animations
- Hover scale effects (1.02x - 1.1x)
- Floating geometric shapes
- Smooth transitions (300ms - 500ms)

**Motion Principles:**
- Reduced motion support for accessibility
- Spring physics for natural feel
- Subtle, not distracting
- Purposeful, enhancing UX

### 7. Responsive Design

**Breakpoints:**
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

**Mobile-First Approach:**
- Stack cards vertically
- Larger touch targets (48px min)
- Simplified navigation
- Optimized images

### 8. Component Library

**Shadcn UI Based:**
- Button variants (default, outline, ghost, link)
- Card components
- Avatar with fallback
- Separator lines
- Tooltip overlays

**Custom Components:**
- EnhancedProfileCard
- ChatWidget
- EmailSignatureTemplate
- HeroSection
- MobileDashboard

### 9. Email Signature Design

**HTML Table-Based Layout:**
- Compatible with all email clients
- Inline styles only
- Absolute image URLs
- Profile picture + company logo badge
- Contact information
- QR code (100×100px)
- Social media icons
- "Powered by LynQ" footer

**Copy-Paste Ready:**
- One-click copy to clipboard
- Works in Gmail, Outlook, Apple Mail
- Preserves formatting
- Mobile-responsive

### 10. Dark Mode Support

**CSS Variables:**
- Theme-aware color tokens
- Automatic dark mode detection
- Smooth transitions between themes
- Optimized contrast ratios

## Design Principles

1. **Brand First**: Company logo visible in all contexts
2. **Clarity**: Information hierarchy is clear
3. **Elegance**: Subtle animations and glassmorphism
4. **Professional**: Business-appropriate aesthetics
5. **Accessible**: WCAG AA compliant
6. **Responsive**: Mobile-to-desktop continuity
7. **Performant**: Optimized images and animations

## Asset Requirements

### Profile Picture
- Format: JPG, PNG
- Size: 400×400px minimum
- Aspect: 1:1 (square)
- File size: < 500KB

### Company Logo
- Format: PNG (transparent), SVG
- Size: 100×100px minimum
- Aspect: Square or circular preferred
- File size: < 200KB
- Background: Transparent

### QR Code
- Generated automatically
- Size: 200×200px (display), 400×400px (download)
- Format: PNG data URL
- Colors: Customizable based on branding

## Figma Design System

For detailed mockups and design specs, see:
- Component Library: [Link to Figma]
- Design Tokens: [Link to Figma]
- Brand Guidelines: [Link to Figma]

## Getting Started

To use these designs in your project:

1. Install dependencies:
```bash
npm install framer-motion lucide-react @radix-ui/react-avatar @radix-ui/react-slot
```

2. Import components:
```tsx
import { EnhancedProfileCard } from '@/components/ui/enhanced-profile-card';
import { EmailSignatureTemplate } from '@/components/email-signature/template';
```

3. Use in your pages:
```tsx
<EnhancedProfileCard
  name="John Doe"
  title="CEO"
  company="Acme Inc"
  avatar="/avatar.jpg"
  companyLogo="/logo.png"
  qrCode="/qr.png"
/>
```

## Support

For design questions or custom requests, contact the design team.
