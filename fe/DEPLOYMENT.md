# Deployment Guide - URL Shortener Frontend

This guide covers deploying the URL Shortener frontend using Docker Compose.

## 🐳 Docker Deployment

### Prerequisites
- Docker and Docker Compose installed
- Supabase project set up with API credentials
- Environment variables configured

### Quick Start

1. **Clone and Setup**
   ```bash
   git clone <repository>
   cd fe
   cp .env.example .env.local
   # Edit .env.local with your Supabase credentials
   ```

2. **Development Mode**
   ```bash
   npm install
   npm run dev
   ```

3. **Production with Docker**
   ```bash
   # Build and run
   docker-compose up --build

   # Run in background
   docker-compose up -d

   # View logs
   docker-compose logs -f

   # Stop services
   docker-compose down
   ```

### Production with Nginx

For production deployments with SSL and reverse proxy:

```bash
# Run with nginx reverse proxy
docker-compose --profile production up -d
```

This includes:
- Rate limiting for API endpoints
- Gzip compression
- Static file caching
- Security headers
- SSL termination (configure certificates)

### Environment Variables

Required in `.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key

# App URL
NEXT_PUBLIC_APP_URL=https://your-domain.com

# Docker
NODE_ENV=production
```

### Health Checks

The application includes a health check endpoint:
- **URL**: `/api/health`
- **Method**: GET
- **Response**: `{ "status": "healthy", "timestamp": "...", "service": "url-shortener-frontend" }`

Docker Compose automatically performs health checks every 30 seconds.

### SSL Configuration

For HTTPS in production:

1. **Obtain SSL certificates** (Let's Encrypt recommended)
2. **Place certificates** in `./ssl/` directory:
   - `cert.pem` (certificate)
   - `key.pem` (private key)
3. **Uncomment HTTPS section** in `nginx.conf`
4. **Update domain name** in nginx configuration

### Scaling

To run multiple frontend instances:

```bash
docker-compose up --scale frontend=3 -d
```

Nginx will automatically load balance between instances.

### Monitoring

**View logs:**
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f frontend
docker-compose logs -f nginx
```

**Check container status:**
```bash
docker-compose ps
```

**Resource usage:**
```bash
docker stats
```

### Troubleshooting

**Build Issues:**
```bash
# Clean build
docker-compose down
docker system prune -a
docker-compose up --build --no-cache
```

**Permission Issues:**
```bash
# Fix file permissions
sudo chown -R $USER:$USER .
```

**Network Issues:**
```bash
# Recreate network
docker-compose down
docker network prune
docker-compose up
```

### Security Considerations

1. **Environment Variables**: Never commit `.env.local` to version control
2. **SSL Certificates**: Use strong encryption (TLS 1.2+)
3. **Rate Limiting**: Configured in nginx for API protection
4. **Security Headers**: Automatically added via nginx and Next.js
5. **Container Security**: Runs as non-root user in Docker

### Performance Optimization

- **Static File Caching**: 1 year cache for `_next/static/`
- **Gzip Compression**: Enabled for text resources
- **Image Optimization**: Next.js built-in optimization
- **Bundle Analysis**: Use `npm run analyze` to check bundle size

### Backup and Recovery

**Database**: Handled by Supabase
**Application State**: Stateless - no backup needed
**Configuration**: Back up `.env.local` and custom configs

### Development vs Production

| Feature | Development | Production |
|---------|-------------|------------|
| Hot Reload | ✅ | ❌ |
| Source Maps | ✅ | ❌ |
| Minification | ❌ | ✅ |
| Telemetry | ✅ | ❌ |
| Error Reporting | Console | Logs |
| HTTPS | ❌ | ✅ |
| Rate Limiting | ❌ | ✅ |

### Support

For deployment issues:
1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Ensure Supabase connectivity
4. Check port availability (3000, 80, 443)
5. Validate Docker and Docker Compose versions