# LynQ - Smart Digital Card with AI Secretary

LynQ is a SaaS platform that allows professionals and businesses to share their profile, capture leads, and automatically book meetings via natural language conversation.

## Features

- 🎯 **Digital Identity**: Smart business cards with QR codes and custom branding
- 🤖 **AI Secretary**: Conversational AI that greets visitors, qualifies leads, and books meetings
- 📅 **Smart Scheduling**: Integrates with Google Calendar, Outlook, and Odoo
- 📊 **Lead Management**: Built-in CRM or sync with Odoo
- 📈 **Analytics**: Track profile views, conversions, and meeting bookings
- 🔗 **Odoo Integration**: Native support for Odoo CRM and Calendar

## Tech Stack

- **Frontend**: Next.js 15 with App Router & React Server Components
- **Backend**: Next.js API Routes with TypeScript
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **AI**: OpenAI GPT-4 with function calling
- **Auth**: NextAuth.js with JWT
- **Deployment**: Docker Compose

## Getting Started

### Prerequisites

- Node.js 18+
- Docker and Docker Compose
- OpenAI API key

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd lynq
```

2. Install dependencies:
```bash
npm install
```

3. Copy environment variables:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
   - `ODOO_URL`: Odoo instance URL (e.g., `https://your-instance.dev.odoo.com`)
   - `ODOO_DATABASE`: Odoo database name (usually the subdomain)
   - `MONGODB_URI`: MongoDB connection string
   - `REDIS_URL`: Redis connection string
   - `NEXTAUTH_SECRET`: Random secret key
   - `GOOGLE_AI_API_KEY`: Your Google Gemini API key
   - Other integration credentials as needed

5. Start services with Docker Compose:
```bash
docker-compose up -d
```

6. Seed the database (optional):
```bash
npm run seed
```

7. Start the development server:
```bash
npm run dev
```

8. Open [http://localhost:3000](http://localhost:3000)

## Demo Credentials

After running the seed script:
- Email: `demo@lynq.com`
- Password: `demo123`
- Profile: [http://localhost:3000/demo](http://localhost:3000/demo)

## Project Structure

```
lynq/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/          # Auth pages
│   │   ├── (dashboard)/     # Dashboard pages
│   │   ├── api/             # API routes
│   │   └── [username]/      # Public profiles
│   ├── lib/
│   │   ├── db/              # Database models
│   │   ├── services/        # Business logic
│   │   ├── integrations/    # External APIs
│   │   ├── middleware/      # Auth & tenant
│   │   └── utils/           # Utilities
│   ├── components/          # React components
│   └── types/               # TypeScript types
├── odoo-module/             # Odoo integration
└── docker-compose.yml       # Services config
```

## API Documentation

### Authentication
- `POST /api/auth/signup` - Register tenant
- `POST /api/auth/login` - Login (via NextAuth)
- `GET /api/auth/session` - Get session

### Profiles
- `GET /api/profiles` - List profiles
- `POST /api/profiles` - Create profile
- `GET /api/profiles/:id` - Get profile
- `PUT /api/profiles/:id` - Update profile
- `DELETE /api/profiles/:id` - Delete profile

### AI Chat
- `POST /api/ai/chat` - Send message
- `POST /api/ai/chat/stream` - Streaming responses

### Calendar
- `GET /api/calendar/availability/:profileId` - Get slots
- `POST /api/calendar/book` - Book meeting

### Leads
- `GET /api/leads` - List leads
- `POST /api/leads` - Create lead
- `PUT /api/leads/:id` - Update lead

## Odoo Integration

LynQ includes a custom Odoo module (`lynq_connector`) that provides:
- OAuth2 authentication
- Contact sync
- CRM opportunity creation
- Calendar bi-directional sync

See `odoo-module/` directory for installation instructions.

## Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm run lint

# Seed database
npm run seed
```

## Deployment

### Docker

```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Considerations

1. Set strong `NEXTAUTH_SECRET`
2. Use production MongoDB instance
3. Configure Redis with password
4. Setup SSL/TLS certificates
5. Configure CDN for static assets
6. Enable rate limiting
7. Setup monitoring and logging

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
