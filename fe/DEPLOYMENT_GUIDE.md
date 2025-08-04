# 🚀 URL Shortener Frontend - Deployment Guide

This guide covers production deployment of the URL Shortener frontend application using Docker and Docker Compose.

## 📋 Prerequisites

### System Requirements
- **Docker**: Version 20.10 or higher
- **Docker Compose**: Version 2.0 or higher
- **Node.js**: Version 18 or higher (for local development)
- **Git**: For version control
- **SSL Certificates**: For HTTPS in production (optional)

### Server Requirements (Minimum)
- **CPU**: 1 core
- **RAM**: 512 MB
- **Storage**: 1 GB free space
- **Network**: Internet connection for Docker image downloads

### Server Requirements (Recommended)
- **CPU**: 2 cores
- **RAM**: 2 GB
- **Storage**: 5 GB free space
- **Network**: High-speed internet connection

## 🛠️ Quick Start

### 1. Clone and Setup
```bash
git clone <your-repository>
cd url-shortener-frontend
```

### 2. Environment Configuration
```bash
# Copy environment template
cp .env.example .env.local

# Edit environment variables
nano .env.local
```

### 3. Deploy with Script
```bash
# Make script executable
chmod +x scripts/deploy.sh

# Deploy for production
./scripts/deploy.sh deploy-prod

# Or deploy for development
./scripts/deploy.sh deploy-dev
```

## 🔧 Manual Deployment

### Development Deployment

1. **Build and Start Services**
   ```bash
   docker-compose up --build -d frontend
   ```

2. **Verify Deployment**
   ```bash
   curl http://localhost:3000/api/health
   ```

3. **View Logs**
   ```bash
   docker-compose logs -f frontend
   ```

### Production Deployment

1. **Build Application**
   ```bash
   docker-compose build --no-cache
   ```

2. **Start with Nginx Proxy**
   ```bash
   docker-compose --profile production up -d
   ```

3. **Verify Services**
   ```bash
   docker-compose ps
   curl http://localhost/api/health
   ```

## ⚙️ Environment Variables

### Required Variables
```env
# Backend API Configuration
NEXT_PUBLIC_API_URL=http://your-backend-api:8000

# Frontend Configuration
NEXT_PUBLIC_APP_URL=https://your-domain.com
NEXT_PUBLIC_SHORT_URL_BASE=https://short.your-domain.com

# Authentication
AUTH_SECRET=your-secure-auth-secret-256-bit
JWT_SECRET=your-secure-jwt-secret-256-bit
```

### Optional Variables
```env
# Analytics
ANALYTICS_ENABLED=true
NEXT_PUBLIC_ANALYTICS_ID=your-analytics-id

# Performance
NEXT_TELEMETRY_DISABLED=1
NODE_ENV=production

# Feature Flags
FEATURE_ANALYTICS=true
FEATURE_CUSTOM_DOMAINS=false
```

## 🌐 Domain and SSL Setup

### Domain Configuration

1. **Update nginx.conf**
   ```nginx
   server_name your-domain.com www.your-domain.com;
   ```

2. **SSL Certificate Setup**
   ```bash
   # Using Let's Encrypt
   sudo certbot --nginx -d your-domain.com -d www.your-domain.com
   
   # Or place certificates in ssl/ directory
   mkdir ssl/
   cp your-cert.pem ssl/cert.pem
   cp your-key.pem ssl/key.pem
   ```

3. **Update Docker Compose**
   ```yaml
   volumes:
     - ./ssl:/etc/nginx/ssl:ro
   ```

### DNS Configuration
```
A Record: your-domain.com → your-server-ip
CNAME: www.your-domain.com → your-domain.com
CNAME: short.your-domain.com → your-domain.com
```

## 📊 Monitoring and Health Checks

### Health Check Endpoints
- **Application**: `GET /api/health`
- **Frontend**: `GET /`
- **Nginx**: `GET /nginx-health` (if configured)

### Monitoring Commands
```bash
# Service Status
docker-compose ps

# Resource Usage
docker stats

# Application Logs
docker-compose logs -f

# Nginx Logs
docker-compose logs nginx

# System Resources
htop
df -h
```

### Log Locations
- **Application Logs**: `docker-compose logs frontend`
- **Nginx Logs**: `docker-compose logs nginx`
- **Docker Logs**: `/var/lib/docker/containers/`

## 🔧 Troubleshooting

### Common Issues

#### Port Already in Use
```bash
# Find process using port
sudo lsof -i :3000
sudo lsof -i :80

# Stop services
docker-compose down
sudo systemctl stop nginx  # if running system nginx
```

#### Memory Issues
```bash
# Check memory usage
free -h
docker stats

# Increase Docker memory limit
# Edit /etc/docker/daemon.json
{
  "default-ulimits": {
    "memlock": {"name": "memlock", "soft": -1, "hard": -1}
  }
}
```

#### SSL Certificate Issues
```bash
# Check certificate
openssl x509 -in ssl/cert.pem -text -noout

# Test SSL
curl -I https://your-domain.com
```

#### Build Failures
```bash
# Clear Docker cache
docker system prune -a

# Check disk space
df -h

# Rebuild without cache
docker-compose build --no-cache --pull
```

### Debug Mode
```bash
# Enable debug logging
NEXT_PUBLIC_DEBUG=true docker-compose up

# Access container shell
docker-compose exec frontend sh

# Check container health
docker-compose exec frontend curl localhost:3000/api/health
```

## 🔄 Updates and Maintenance

### Application Updates
```bash
# Backup current deployment
./scripts/deploy.sh backup

# Pull latest changes
git pull origin main

# Rebuild and deploy
./scripts/deploy.sh deploy-prod
```

### Database Backup (if applicable)
```bash
# Create backup directory
mkdir -p backups/$(date +%Y%m%d)

# Backup environment
cp .env.local backups/$(date +%Y%m%d)/

# Backup volumes
docker run --rm -v app_data:/data -v $(pwd)/backups:/backup alpine tar czf /backup/data.tar.gz -C /data .
```

### Security Updates
```bash
# Update base images
docker-compose pull

# Rebuild with latest security patches
docker-compose build --pull --no-cache

# Restart services
docker-compose down && docker-compose up -d
```

## 📈 Performance Optimization

### Production Optimizations

1. **Enable Gzip Compression** (nginx.conf)
2. **Configure Caching Headers**
3. **Use CDN for Static Assets**
4. **Enable HTTP/2**
5. **Optimize Docker Images**

### Monitoring Metrics
- **Response Time**: < 200ms
- **Memory Usage**: < 512MB
- **CPU Usage**: < 50%
- **Disk Usage**: < 80%
- **Uptime**: > 99.9%

## 🔐 Security Checklist

- [ ] Environment variables secured
- [ ] SSL/TLS certificates configured
- [ ] Rate limiting enabled (nginx)
- [ ] Security headers configured
- [ ] Non-root user in containers
- [ ] Firewall configured
- [ ] Regular security updates
- [ ] Log monitoring enabled

## 📞 Support

### Logs for Support
```bash
# Collect deployment info
./scripts/deploy.sh status > deployment-info.txt

# Collect logs
docker-compose logs > application-logs.txt

# System information
uname -a > system-info.txt
docker version >> system-info.txt
docker-compose version >> system-info.txt
```

### Emergency Procedures

#### Complete Service Restart
```bash
docker-compose down
docker system prune -f
./scripts/deploy.sh deploy-prod
```

#### Rollback to Previous Version
```bash
git log --oneline -10  # Find previous commit
git checkout <previous-commit-hash>
./scripts/deploy.sh deploy-prod
```

---

For additional support, please check the project documentation or create an issue in the repository.