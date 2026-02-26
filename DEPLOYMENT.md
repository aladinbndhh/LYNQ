# LynQ Deployment Guide

This guide covers deploying LynQ in production using Docker Compose.

## Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Docker and Docker Compose installed
- Domain name pointed to your server
- SSL certificate (Let's Encrypt recommended)

## Quick Deployment

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd lynq
```

### 2. Configure Environment

```bash
cp .env.example .env
nano .env
```

Update the following critical variables:

```bash
# Generate a strong secret
NEXTAUTH_SECRET=$(openssl rand -base64 32)

# Set your domain
APP_URL=https://your-domain.com

# OpenAI API Key (required for AI features)
OPENAI_API_KEY=sk-your-openai-api-key

# MongoDB (use strong credentials)
MONGODB_URI=mongodb://lynq_admin:STRONG_PASSWORD@mongodb:27017/lynq?authSource=admin

# Redis (use strong password)
REDIS_URL=redis://:STRONG_PASSWORD@redis:6379
```

### 3. Setup Docker Compose for Production

Update `docker-compose.yml` with production settings:

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:8.0
    restart: always
    environment:
      MONGO_INITDB_ROOT_USERNAME: lynq_admin
      MONGO_INITDB_ROOT_PASSWORD: ${MONGO_PASSWORD}
      MONGO_INITDB_DATABASE: lynq
    volumes:
      - mongodb_data:/data/db
    networks:
      - lynq-network

  redis:
    image: redis:7-alpine
    restart: always
    command: redis-server --requirepass ${REDIS_PASSWORD}
    volumes:
      - redis_data:/data
    networks:
      - lynq-network

  app:
    build:
      context: .
      dockerfile: Dockerfile
      target: runner
    restart: always
    ports:
      - "3000:3000"
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://lynq_admin:${MONGO_PASSWORD}@mongodb:27017/lynq?authSource=admin
      REDIS_URL: redis://:${REDIS_PASSWORD}@redis:6379
      NEXTAUTH_URL: ${APP_URL}
      NEXTAUTH_SECRET: ${NEXTAUTH_SECRET}
      OPENAI_API_KEY: ${OPENAI_API_KEY}
    depends_on:
      - mongodb
      - redis
    networks:
      - lynq-network

  nginx:
    image: nginx:alpine
    restart: always
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf:ro
      - /etc/letsencrypt:/etc/letsencrypt:ro
    depends_on:
      - app
    networks:
      - lynq-network

volumes:
  mongodb_data:
  redis_data:

networks:
  lynq-network:
    driver: bridge
```

### 4. Setup Nginx (Reverse Proxy)

Create `nginx.conf`:

```nginx
events {
    worker_connections 1024;
}

http {
    upstream app {
        server app:3000;
    }

    server {
        listen 80;
        server_name your-domain.com;
        
        # Redirect to HTTPS
        return 301 https://$server_name$request_uri;
    }

    server {
        listen 443 ssl http2;
        server_name your-domain.com;

        ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
        ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
        
        ssl_protocols TLSv1.2 TLSv1.3;
        ssl_ciphers HIGH:!aNULL:!MD5;

        client_max_body_size 10M;

        location / {
            proxy_pass http://app;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection 'upgrade';
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header X-Forwarded-Proto $scheme;
            proxy_cache_bypass $http_upgrade;
        }
    }
}
```

### 5. Get SSL Certificate

```bash
sudo apt update
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
```

### 6. Build and Start Services

```bash
docker-compose up -d --build
```

### 7. Seed the Database (Optional)

```bash
docker-compose exec app npm run seed
```

### 8. Check Logs

```bash
docker-compose logs -f app
```

## Post-Deployment

### 1. Create First Admin Account

Visit `https://your-domain.com/signup` and create your account.

### 2. Configure Integrations

- **OpenAI**: Verify API key is set correctly
- **Google Calendar**: Setup OAuth credentials in Google Cloud Console
- **Microsoft Outlook**: Setup OAuth credentials in Azure Portal
- **Odoo**: Install the Odoo module if needed

### 3. Setup Monitoring

Install monitoring tools:

```bash
# Install Prometheus & Grafana
docker-compose -f docker-compose.monitoring.yml up -d
```

### 4. Setup Backups

Create backup script:

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/backups/lynq"
DATE=$(date +%Y%m%d_%H%M%S)

# Backup MongoDB
docker exec lynq-mongodb mongodump \
  --username=lynq_admin \
  --password=$MONGO_PASSWORD \
  --authenticationDatabase=admin \
  --out=/tmp/backup

docker cp lynq-mongodb:/tmp/backup $BACKUP_DIR/mongodb_$DATE

# Backup Redis
docker exec lynq-redis redis-cli --pass $REDIS_PASSWORD SAVE
docker cp lynq-redis:/data/dump.rdb $BACKUP_DIR/redis_$DATE.rdb

# Cleanup old backups (keep last 7 days)
find $BACKUP_DIR -mtime +7 -delete
```

Add to crontab:

```bash
0 2 * * * /path/to/backup.sh
```

## Scaling

### Horizontal Scaling

To scale the application:

```bash
docker-compose up -d --scale app=3
```

### Load Balancer

Update nginx.conf for load balancing:

```nginx
upstream app {
    least_conn;
    server app:3000 max_fails=3 fail_timeout=30s;
    server app:3001 max_fails=3 fail_timeout=30s;
    server app:3002 max_fails=3 fail_timeout=30s;
}
```

## Troubleshooting

### Check Service Status

```bash
docker-compose ps
```

### View Application Logs

```bash
docker-compose logs -f app
```

### Database Connection Issues

```bash
docker-compose exec app node -e "require('./src/lib/db/connection').default()"
```

### Restart Services

```bash
docker-compose restart app
```

## Security Checklist

- [ ] Strong passwords for MongoDB and Redis
- [ ] SSL/TLS enabled
- [ ] NEXTAUTH_SECRET is random and secure
- [ ] Firewall configured (only 80, 443 open)
- [ ] Regular backups scheduled
- [ ] Monitoring and alerts setup
- [ ] API keys stored securely
- [ ] Rate limiting enabled
- [ ] CORS configured correctly

## Performance Optimization

1. **Enable Redis caching** - Already configured
2. **CDN for static assets** - Use Cloudflare or similar
3. **Database indexes** - Already created
4. **Connection pooling** - Configured in MongoDB client
5. **Gzip compression** - Add to nginx config

## Support

For deployment issues, contact: support@lynq.com
