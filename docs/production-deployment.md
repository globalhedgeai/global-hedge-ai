# Production Deployment Guide

## Overview

This guide covers deploying the Global Hedge AI platform to production using Docker and PostgreSQL.

## Prerequisites

- Docker and Docker Compose installed
- Domain name configured
- SSL certificates (Let's Encrypt recommended)
- Server with at least 2GB RAM and 20GB storage
- PostgreSQL 15+ (or use Docker)

## Quick Start

### 1. Clone Repository

```bash
git clone <repository-url>
cd global-hedge-ai
```

### 2. Environment Setup

```bash
# Copy environment template
cp docs/production-env.example .env.production

# Edit environment variables
nano .env.production
```

Required environment variables:
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random secret key
- `NEXTAUTH_URL`: Your domain URL
- `CLOUDFLARE_R2_*`: Cloudflare R2 storage credentials
- `POSTGRES_PASSWORD`: Database password

### 3. SSL Certificates

```bash
# Create SSL directory
mkdir ssl

# Generate self-signed certificates (for testing)
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout ssl/key.pem -out ssl/cert.pem

# For production, use Let's Encrypt
certbot certonly --standalone -d yourdomain.com
```

### 4. Deploy with Docker Compose

```bash
# Start services
docker-compose -f docker-compose.production.yml up -d

# Check logs
docker-compose -f docker-compose.production.yml logs -f

# Check status
docker-compose -f docker-compose.production.yml ps
```

### 5. Database Migration

```bash
# Run Prisma migrations
docker-compose -f docker-compose.production.yml exec app npx prisma migrate deploy --schema=prisma/postgresql.prisma

# Generate Prisma client
docker-compose -f docker-compose.production.yml exec app npx prisma generate --schema=prisma/postgresql.prisma
```

### 6. Migrate Data (if migrating from SQLite)

```bash
# Copy SQLite database to container
docker cp dev.db global-hedge-app:/app/dev.db

# Run migration script
docker-compose -f docker-compose.production.yml exec app tsx scripts/migrate-to-postgresql.ts
```

## Manual Deployment

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

### 2. PostgreSQL Setup

```bash
# Install PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Create database and user
sudo -u postgres psql
CREATE DATABASE global_hedge_ai;
CREATE USER app_user WITH PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON DATABASE global_hedge_ai TO app_user;
\q
```

### 3. Application Deployment

```bash
# Clone repository
git clone <repository-url>
cd global-hedge-ai

# Build application
docker build -f apps/web/Dockerfile.production -t global-hedge-ai .

# Run with Docker Compose
docker-compose -f docker-compose.production.yml up -d
```

## Monitoring and Maintenance

### Health Checks

```bash
# Check application health
curl https://yourdomain.com/api/health

# Check database health
curl https://yourdomain.com/api/health/database

# Check Docker containers
docker-compose -f docker-compose.production.yml ps
```

### Logs

```bash
# Application logs
docker-compose -f docker-compose.production.yml logs app

# Database logs
docker-compose -f docker-compose.production.yml logs postgres

# Nginx logs
docker-compose -f docker-compose.production.yml logs nginx
```

### Backups

```bash
# Create database backup
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U postgres global_hedge_ai > backup.sql

# Restore database backup
docker-compose -f docker-compose.production.yml exec -T postgres psql -U postgres global_hedge_ai < backup.sql

# Use built-in backup system
curl -X POST https://yourdomain.com/api/admin/backups \
  -H "Content-Type: application/json" \
  -d '{"action": "create_full"}'
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml build --no-cache
docker-compose -f docker-compose.production.yml up -d

# Run migrations if needed
docker-compose -f docker-compose.production.yml exec app npx prisma migrate deploy --schema=prisma/postgresql.prisma
```

## Security Configuration

### Firewall

```bash
# Configure UFW
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### SSL/TLS

```bash
# Install Certbot
sudo apt install certbot -y

# Get Let's Encrypt certificate
sudo certbot certonly --standalone -d yourdomain.com

# Auto-renewal
echo "0 12 * * * /usr/bin/certbot renew --quiet" | sudo crontab -
```

### Database Security

```bash
# Update PostgreSQL configuration
sudo nano /etc/postgresql/15/main/postgresql.conf

# Enable SSL
ssl = on
ssl_cert_file = '/etc/ssl/certs/ssl-cert-snakeoil.pem'
ssl_key_file = '/etc/ssl/private/ssl-cert-snakeoil.key'

# Restart PostgreSQL
sudo systemctl restart postgresql
```

## Performance Optimization

### Database Tuning

```sql
-- Connect to PostgreSQL
sudo -u postgres psql global_hedge_ai

-- Analyze tables
ANALYZE;

-- Check query performance
EXPLAIN ANALYZE SELECT * FROM "User" WHERE email = 'test@example.com';

-- Create additional indexes if needed
CREATE INDEX CONCURRENTLY idx_user_email ON "User"(email);
CREATE INDEX CONCURRENTLY idx_deposit_status ON "Deposit"(status);
CREATE INDEX CONCURRENTLY idx_withdrawal_status ON "Withdrawal"(status);
```

### Application Optimization

```bash
# Enable gzip compression in Nginx
# Already configured in nginx.conf

# Set up Redis for caching
docker-compose -f docker-compose.production.yml up -d redis

# Monitor resource usage
docker stats
```

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   ```bash
   # Check PostgreSQL status
   sudo systemctl status postgresql
   
   # Check connection
   docker-compose -f docker-compose.production.yml exec app npx prisma db pull --schema=prisma/postgresql.prisma
   ```

2. **SSL Certificate Issues**
   ```bash
   # Check certificate validity
   openssl x509 -in ssl/cert.pem -text -noout
   
   # Test SSL connection
   openssl s_client -connect yourdomain.com:443
   ```

3. **Application Not Starting**
   ```bash
   # Check logs
   docker-compose -f docker-compose.production.yml logs app
   
   # Check environment variables
   docker-compose -f docker-compose.production.yml exec app env | grep DATABASE_URL
   ```

4. **Performance Issues**
   ```bash
   # Check resource usage
   docker stats
   
   # Check database performance
   docker-compose -f docker-compose.production.yml exec postgres psql -U postgres -c "SELECT * FROM pg_stat_activity;"
   ```

### Recovery Procedures

1. **Database Recovery**
   ```bash
   # Stop application
   docker-compose -f docker-compose.production.yml stop app
   
   # Restore from backup
   docker-compose -f docker-compose.production.yml exec -T postgres psql -U postgres global_hedge_ai < backup.sql
   
   # Restart application
   docker-compose -f docker-compose.production.yml start app
   ```

2. **Application Recovery**
   ```bash
   # Rollback to previous version
   git checkout <previous-commit>
   docker-compose -f docker-compose.production.yml build --no-cache
   docker-compose -f docker-compose.production.yml up -d
   ```

## Scaling

### Horizontal Scaling

```yaml
# docker-compose.scale.yml
version: '3.8'
services:
  app:
    deploy:
      replicas: 3
    environment:
      - DATABASE_URL=postgresql://postgres:password@postgres:5432/global_hedge_ai
```

### Load Balancing

```nginx
# nginx.conf with load balancing
upstream app {
    server app1:3000;
    server app2:3000;
    server app3:3000;
}
```

### Database Scaling

- **Read Replicas**: Set up PostgreSQL read replicas
- **Connection Pooling**: Use PgBouncer for connection pooling
- **Partitioning**: Partition large tables by date

## Monitoring Setup

### Prometheus + Grafana

```yaml
# docker-compose.monitoring.yml
version: '3.8'
services:
  prometheus:
    image: prom/prometheus
    ports:
      - "9090:9090"
  
  grafana:
    image: grafana/grafana
    ports:
      - "3001:3000"
```

### Log Aggregation

```yaml
# docker-compose.logging.yml
version: '3.8'
services:
  elasticsearch:
    image: elasticsearch:7.14.0
  
  kibana:
    image: kibana:7.14.0
  
  logstash:
    image: logstash:7.14.0
```

## Backup Strategy

### Automated Backups

```bash
#!/bin/bash
# backup.sh

# Database backup
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U postgres global_hedge_ai > /backups/db_$(date +%Y%m%d_%H%M%S).sql

# Application backup
docker-compose -f docker-compose.production.yml exec app tar -czf /backups/app_$(date +%Y%m%d_%H%M%S).tar.gz /app

# Upload to cloud storage
aws s3 cp /backups/ s3://your-backup-bucket/ --recursive
```

### Cron Job

```bash
# Add to crontab
0 2 * * * /path/to/backup.sh
```

This deployment guide provides a comprehensive approach to deploying and maintaining the Global Hedge AI platform in production.
