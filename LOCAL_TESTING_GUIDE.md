# Local Testing Guide for LynQ

## Step-by-Step Testing Instructions

### Step 1: Install Node Dependencies

```bash
npm install
```

This will install all required packages from `package.json`.

### Step 2: Start Database Services

```bash
# Start MongoDB and Redis using Docker
docker-compose up -d mongodb redis
```

**Verify services are running:**

```bash
docker ps
```

You should see `lynq-mongodb` and `lynq-redis` containers running.

### Step 3: Configure Environment

The `.env` file is already created. Update it with your OpenAI API key:

```bash
# Open .env in your editor and add:
OPENAI_API_KEY=sk-your-actual-openai-api-key-here
```

**Important**: Get your OpenAI API key from https://platform.openai.com/api-keys

### Step 4: Seed the Database

```bash
npm run seed
```

This creates:
- Demo tenant: "Demo Company"
- Demo user: demo@lynq.com / demo123
- Demo profile: lynq.com/demo

### Step 5: Start the Development Server

```bash
npm run dev
```

The server will start on http://localhost:3000

### Step 6: Test the Application

#### A. Landing Page
1. Open: http://localhost:3000
2. You should see:
   - Animated hero with floating shapes
   - "LynQ" gradient text
   - "Get Started" and "Sign In" buttons
   - Three feature cards

#### B. Login
1. Click "Sign In" or go to: http://localhost:3000/login
2. Login with:
   - **Email**: demo@lynq.com
   - **Password**: demo123
3. You should be redirected to the dashboard

#### C. Dashboard
1. You'll see:
   - Welcome message with your name
   - Three statistics cards (Profile Views, Leads, Meetings)
   - Six action cards
   - Company Logo Badge feature banner
2. Try clicking:
   - "Edit Profiles" → View profiles list
   - "Email Signature" → Generate signature
   - "Mobile Preview" → See mobile UI

#### D. Public Profile
1. Go to: http://localhost:3000/demo
2. You should see:
   - Profile card with avatar
   - Company information
   - QR code
   - Contact buttons
   - Floating chat button (💬) in bottom-right corner

#### E. AI Chat Widget
1. On the demo profile page, click the chat button (💬)
2. The chat window should open with animation
3. Type a message: "Hi, I'd like to schedule a meeting"
4. Wait for AI response (requires OpenAI API key)
5. The AI should respond and potentially offer to check availability

#### F. Leads Management
1. Dashboard → View Leads
2. You should see:
   - Modern table design
   - Search bar
   - Status and source filters
   - Column toggle
   - Empty state (no leads yet)

#### G. Email Signature Generator
1. Dashboard → Generate Email Signature
2. You'll see:
   - Preview of your signature
   - Avatar with company logo badge
   - QR code
   - "Copy Email Signature" button
3. Click copy and paste into Gmail/Outlook settings

#### H. Profile Creation
1. Dashboard → Profiles → New Profile
2. Fill in the form:
   - Username (required)
   - Display name (required)
   - Upload avatar image
   - Upload company logo image
   - See live preview of logo badge
   - Set primary color
   - Configure AI greeting
3. Click "Save Profile"

---

## Testing Checklist

### Frontend Features
- [ ] Landing page loads with animations
- [ ] Login/signup works
- [ ] Dashboard displays correctly
- [ ] Profile cards show with company logo badge
- [ ] Chat widget opens and closes smoothly
- [ ] Forms submit without errors
- [ ] Responsive on mobile (test with browser DevTools)

### AI Features (Requires OpenAI API Key)
- [ ] Chat widget responds to messages
- [ ] AI greeting appears when chat opens
- [ ] Typing indicator shows while AI thinks
- [ ] AI can discuss scheduling meetings

### Database Operations
- [ ] Create profile saves to MongoDB
- [ ] Update profile modifies existing data
- [ ] Delete profile removes from database
- [ ] Leads are captured and stored

### Visual Design
- [ ] Company logo badge appears beside avatars
- [ ] Gradients render correctly
- [ ] Animations are smooth
- [ ] Colors match theme
- [ ] Dark mode toggles (if implemented)

---

## Common Issues & Solutions

### Issue: "Cannot connect to MongoDB"

**Solution:**
```bash
# Check if MongoDB container is running
docker ps | grep mongodb

# If not running, start it
docker-compose up -d mongodb

# Wait 10 seconds, then retry
```

### Issue: "OpenAI API Error"

**Causes:**
1. API key not set in `.env`
2. Invalid API key
3. Insufficient quota

**Solution:**
1. Check `.env` file has `OPENAI_API_KEY=sk-...`
2. Verify key at https://platform.openai.com
3. Check billing at https://platform.openai.com/settings/organization/billing

### Issue: "NextAuth Error"

**Solution:**
```bash
# Generate a new secret
openssl rand -base64 32

# Add to .env
NEXTAUTH_SECRET=generated-secret-here
```

### Issue: "Port 3000 already in use"

**Solution:**
```bash
# Kill process on port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Or change port:
npm run dev -- -p 3001
```

### Issue: "Images not loading"

**Cause:** Next.js image domains not configured

**Solution:** Already configured in `next.config.js`

---

## Testing Specific Features

### Test AI Secretary

1. Visit demo profile: http://localhost:3000/demo
2. Click chat widget (💬)
3. Send message: "Hello"
4. AI should respond with greeting
5. Try: "I want to book a meeting"
6. AI should ask for details and check availability

### Test Lead Capture

AI chat automatically creates leads when:
1. Visitor provides name and email
2. Conversation reaches "qualified" status
3. Meeting is booked

Check leads at: Dashboard → Leads

### Test Email Signature

1. Go to: http://localhost:3000/dashboard/email-signature
2. See preview with logo badge
3. Click "Copy Email Signature"
4. Open Gmail/Outlook settings
5. Paste signature (Ctrl+V / Cmd+V)
6. Verify logo badge appears correctly

### Test Profile with Company Logo

1. Create new profile or edit existing
2. Upload avatar image
3. Upload company logo
4. See preview showing logo as badge
5. Save profile
6. Visit public profile URL
7. Logo badge should appear beside avatar

---

## Performance Testing

### Test Profile Load Time

```bash
# Use browser DevTools (F12)
# Network tab → Reload profile page
# Check: DOMContentLoaded < 2s
```

### Test AI Response Time

```bash
# Send message in chat
# Measure time to first response
# Target: < 3s
```

---

## Database Inspection

### Check MongoDB Data

```bash
# Connect to MongoDB
docker exec -it lynq-mongodb mongosh -u lynq -p lynq_dev_password

# Use lynq database
use lynq

# Check collections
show collections

# View profiles
db.profiles.find().pretty()

# View users
db.users.find().pretty()

# View conversations
db.conversations.find().pretty()

# Exit
exit
```

### Check Redis Cache

```bash
# Connect to Redis
docker exec -it lynq-redis redis-cli -a lynq_redis_password

# List all keys
KEYS *

# Exit
exit
```

---

## Browser DevTools Testing

### Console Errors
1. Open browser DevTools (F12)
2. Go to Console tab
3. Check for any errors
4. All should be clear (green checkmarks)

### Network Requests
1. Open Network tab
2. Reload page
3. Check all requests are 200 OK
4. API calls should be under 500ms

### Performance
1. Open Lighthouse tab
2. Run audit
3. Target scores:
   - Performance: > 90
   - Accessibility: > 95
   - Best Practices: > 90
   - SEO: > 90

---

## Mobile Testing

### Browser DevTools
1. Press F12
2. Click device toolbar icon (or Ctrl+Shift+M)
3. Select device (iPhone, Android)
4. Test all pages:
   - Landing page
   - Profile page
   - Dashboard
   - Chat widget
   - Forms

### Features to Test
- [ ] Touch-friendly buttons (48px min)
- [ ] Responsive grid layouts
- [ ] Chat widget on mobile
- [ ] Forms are usable
- [ ] Navigation works
- [ ] Images scale properly

---

## API Testing

### Test with Curl

```bash
# Check health (should return 404 but server is up)
curl http://localhost:3000/api/health

# Test signup
curl -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "test123",
    "companyName": "Test Company"
  }'

# Test login (via NextAuth - use browser instead)

# Test profile creation (requires auth token)
```

### Test AI Chat API

```bash
# Test AI chat endpoint
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "profileId": "PROFILE_ID_HERE",
    "message": "Hello",
    "sessionId": "test-session-123"
  }'
```

---

## Visual Testing Checklist

### Company Logo Badge
- [ ] Avatar shows correct image
- [ ] Logo badge appears at bottom-right
- [ ] Badge is circular
- [ ] Badge has white background
- [ ] Badge scales with avatar size
- [ ] Works on email signature
- [ ] Works on profile cards
- [ ] Works on mobile

### Colors & Branding
- [ ] Primary color is blue (#3b82f6)
- [ ] Gradients render smoothly
- [ ] Status badges have correct colors
- [ ] Hover effects work
- [ ] Focus states visible

### Animations
- [ ] Hero shapes float smoothly
- [ ] Chat widget opens with animation
- [ ] Messages fade in
- [ ] Typing indicator bounces
- [ ] Buttons scale on hover
- [ ] No janky animations

### Responsiveness
- [ ] Mobile view (< 768px) works
- [ ] Tablet view (768-1024px) works
- [ ] Desktop view (> 1024px) works
- [ ] No horizontal scroll
- [ ] Text is readable on all sizes

---

## Stop and Clean Up

### Stop Development Server
Press `Ctrl+C` in the terminal running `npm run dev`

### Stop Docker Services
```bash
docker-compose down
```

### Clean Database (Start Fresh)
```bash
docker-compose down -v  # This removes volumes
docker-compose up -d mongodb redis
npm run seed
```

---

## Production Test (Optional)

### Build Production Version

```bash
# Build Next.js
npm run build

# Start production server
npm start
```

Visit: http://localhost:3000

### Test with Docker

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f app

# Stop when done
docker-compose down
```

---

## Success Criteria

You'll know LynQ is working correctly when:

✅ Landing page loads with animations  
✅ You can login with demo credentials  
✅ Dashboard shows with stats cards  
✅ Demo profile displays correctly  
✅ Company logo badge appears beside avatar  
✅ Chat widget opens and responds (with API key)  
✅ Email signature can be generated and copied  
✅ Forms work and save data  
✅ Navigation between pages is smooth  
✅ No console errors in browser DevTools  

---

## Need Help?

- Check `README.md` for general info
- See `DEPLOYMENT.md` for production setup
- Review `DESIGN_GUIDE.md` for design details
- Check `PROJECT_SUMMARY.md` for complete overview

**Happy testing!** 🚀
