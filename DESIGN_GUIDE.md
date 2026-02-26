# LynQ Design Guide

## Company Logo Badge Feature

A key visual feature of LynQ is the **company logo badge** that appears beside profile pictures throughout the platform.

### Visual Design

The company logo appears as a small circular badge positioned at the bottom-right of the profile picture:

```
┌─────────────┐
│             │
│   Profile   │
│   Picture   │
│             │ ┌──┐
│             │ │🏢│  ← Company Logo Badge
└─────────────┘ └──┘
```

### Implementation Details

**Size & Position:**
- Profile picture: 70px × 70px (email) or 80px × 80px (card)
- Company logo badge: 28px × 28px (email) or 40px × 40px (card)
- Position: Absolute positioning, bottom-right corner
- Offset: -2px to -5px from profile edges

**Styling:**
- Shape: Perfect circle (border-radius: 50%)
- Background: White
- Border: 2px white border for separation
- Padding: Small padding for the logo inside (2-4px)
- Shadow: Subtle shadow for depth

**Logo Requirements:**
- Format: PNG, SVG, or JPG
- Recommended size: 100px × 100px minimum
- Background: Transparent preferred
- Shape: Square or circular original works best

### Where It Appears

1. **Public Profile Page** (`/[username]`)
   - Main profile card
   - When visitors view the profile

2. **Email Signature**
   - Generated HTML signature
   - Copy-paste ready for Gmail, Outlook, etc.

3. **Dashboard Profile Cards**
   - Profile list view
   - Profile preview

4. **Mobile App**
   - Profile screen
   - Contact cards

### Usage Examples

#### React Component (Profile Card)

```tsx
<div className="relative">
  <img src={avatar} className="w-20 h-20 rounded-full" />
  {companyLogo && (
    <img 
      src={companyLogo} 
      className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white border-2 border-white p-1.5"
    />
  )}
</div>
```

#### HTML Email (Signature)

```html
<div style="position:relative;display:inline-block;">
  <img src="avatar.jpg" style="width:70px;height:70px;border-radius:50%;" />
  <img src="logo.png" style="position:absolute;bottom:-5px;right:-5px;width:28px;height:28px;border-radius:50%;background:white;border:2px solid white;padding:2px;" />
</div>
```

### Color Scheme

LynQ uses a modern gradient color palette:

**Primary Colors:**
- Indigo: `#6366f1` - Technology, trust
- Rose: `#f43f5e` - Energy, warmth
- Violet: `#8b5cf6` - Creativity

**Neutral Colors:**
- Dark: `#030303` - Backgrounds
- White: `#ffffff` - Text, cards
- Gray: `#6b7280` - Secondary text

**Accent Gradients:**
- Hero: `from-indigo-500 via-white/90 to-rose-500`
- Buttons: `from-indigo-500 to-rose-500`
- Cards: `from-indigo-500/20 to-rose-500/20`

### Accessibility

- Company logo has `alt` text describing the company
- Color contrast meets WCAG AA standards
- Profile pictures have descriptive alt text
- Fallback initials if no avatar image

### Best Practices

1. **Logo Quality**
   - Use high-resolution logos (2x for retina displays)
   - Ensure logo is recognizable at small sizes
   - Test on light and dark backgrounds

2. **Responsive Behavior**
   - Scale logo proportionally with profile picture
   - Maintain aspect ratio
   - Consider different screen sizes

3. **Branding Consistency**
   - Use official company logo
   - Match company brand colors
   - Consistent across all touchpoints

4. **Email Compatibility**
   - Use absolute URLs for images in email
   - Inline styles for email clients
   - Table-based layout for maximum compatibility
   - Test in Gmail, Outlook, Apple Mail

### Component Files

- **Enhanced Profile Card**: `src/components/ui/enhanced-profile-card.tsx`
- **Email Signature**: `src/components/email-signature/template.tsx`
- **Public Profile**: `src/app/[username]/page.tsx`
- **Dashboard Preview**: `src/app/(dashboard)/dashboard/profile-preview/page.tsx`

### API Endpoints

- `GET /api/profiles/:id/signature` - Generate email signature HTML

### User Flow

1. User uploads company logo in profile settings
2. Logo is stored in database (branding.logo field)
3. Logo automatically appears in all profile displays
4. User can generate email signature with logo badge
5. User copies signature and pastes into email client

### Future Enhancements

- Logo upload validation (size, format)
- Automatic logo background removal
- Logo color adjustment for dark/light themes
- Multiple logo variants (color, monochrome, white)
- Logo positioning options (corner, side, etc.)
