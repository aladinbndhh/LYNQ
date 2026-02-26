# LynQ - Quick Start Guide

Get LynQ up and running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- OpenAI API key (for AI features)

## Step 1: Install Dependencies

```bash
npm install
```

## Step 2: Start Services

```bash
# Start MongoDB and Redis
docker-compose up -d mongodb redis
```

Wait 10 seconds for services to initialize.

## Step 3: Configure Environment

```bash
# Copy environment file
cp .env.example .env

# Edit .env and add your OpenAI API key
# OPENAI_API_KEY=sk-your-key-here
```

**Minimum required:**
- `OPENAI_API_KEY` - Get from https://platform.openai.com

## Step 4: Seed Demo Data

```bash
npm run seed
```

This creates:
- Demo tenant account
- Demo user (demo@lynq.com / demo123)
- Demo profile (lynq.com/demo)

## Step 5: Start Development Server

```bash
npm run dev
```

## Step 6: Open Your Browser

Visit: **http://localhost:3000**

## Demo Credentials

- **Email**: demo@lynq.com
- **Password**: demo123
- **Profile URL**: http://localhost:3000/demo

## What to Try

### 1. View the Landing Page
- Animated hero section
- Floating geometric shapes
- Gradient effects

### 2. Login to Dashboard
- Modern stats cards
- Quick action grid
- Company logo badge feature banner

### 3. Visit Demo Profile
- Public profile page
- Company logo badge on avatar
- Click the chat widget (💬)
- Test AI conversation

### 4. Explore Leads
- Go to Dashboard → Leads
- See modern table with filters
- Try sorting and searching

### 5. Generate Email Signature
- Dashboard → Email Signature
- See company logo badge preview
- Click "Copy Email Signature"
- Paste into your email client

### 6. Create Your Own Profile
- Dashboard → Profiles → New Profile
- Upload avatar and company logo
- See live preview of logo badge
- Customize colors and AI settings

## Troubleshooting

### MongoDB Connection Error

```bash
# Check if MongoDB is running
docker ps

# Restart MongoDB
docker-compose restart mongodb
```

### OpenAI API Error

- Verify your API key in `.env`
- Check quota at https://platform.openai.com
- AI features will show error without valid key

### Port Already in Use

```bash
# Change port in package.json
"dev": "next dev -p 3001"
```

## Next Steps

1. **Create your profile** - Add your real information
2. **Upload company logo** - See the badge feature
3. **Test AI chat** - Talk to your AI secretary
4. **Generate signature** - Use in your emails
5. **Share your profile** - Send the link or QR code

## Support

- **Documentation**: See README.md
- **Design Guide**: See DESIGN_GUIDE.md
- **Full Summary**: See PROJECT_SUMMARY.md

## Production Deployment

See `DEPLOYMENT.md` for production setup with:
- SSL certificates
- Production database
- Environment security
- Nginx configuration
- Monitoring setup

---

**You're ready to go!** 🚀

Visit http://localhost:3000 and start exploring LynQ.
