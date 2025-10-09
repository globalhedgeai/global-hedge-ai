#!/bin/bash

# 🚀 Global Hedge AI - Quick Setup Script
# This script automates the deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN=""
EMAIL=""
DB_PASSWORD=""
NEXTAUTH_SECRET=""
CLOUDFLARE_R2_ACCESS_KEY=""
CLOUDFLARE_R2_SECRET_KEY=""
CLOUDFLARE_R2_ENDPOINT=""
CLOUDFLARE_R2_BUCKET=""

# Functions
print_header() {
    echo -e "${BLUE}"
    echo "=================================="
    echo "🚀 Global Hedge AI Setup"
    echo "=================================="
    echo -e "${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if running as root
check_root() {
    if [[ $EUID -eq 0 ]]; then
        print_error "This script should not be run as root"
        exit 1
    fi
}

# Check system requirements
check_requirements() {
    print_info "Checking system requirements..."
    
    # Check OS
    if [[ ! -f /etc/os-release ]]; then
        print_error "Cannot determine OS version"
        exit 1
    fi
    
    . /etc/os-release
    if [[ "$ID" != "ubuntu" && "$ID" != "debian" ]]; then
        print_warning "This script is optimized for Ubuntu/Debian"
    fi
    
    # Check RAM
    RAM_GB=$(free -g | awk '/^Mem:/{print $2}')
    if [[ $RAM_GB -lt 2 ]]; then
        print_warning "Recommended RAM: 4GB+ (Current: ${RAM_GB}GB)"
    fi
    
    # Check disk space
    DISK_GB=$(df -BG . | awk 'NR==2{print $4}' | sed 's/G//')
    if [[ $DISK_GB -lt 20 ]]; then
        print_warning "Recommended disk space: 50GB+ (Available: ${DISK_GB}GB)"
    fi
    
    print_success "System requirements check completed"
}

# Install Docker
install_docker() {
    print_info "Installing Docker..."
    
    if command -v docker &> /dev/null; then
        print_success "Docker is already installed"
        return
    fi
    
    # Update package index
    sudo apt-get update
    
    # Install prerequisites
    sudo apt-get install -y \
        ca-certificates \
        curl \
        gnupg \
        lsb-release
    
    # Add Docker's official GPG key
    sudo mkdir -p /etc/apt/keyrings
    curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
    
    # Set up repository
    echo \
        "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu \
        $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
    
    # Install Docker
    sudo apt-get update
    sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
    
    # Add user to docker group
    sudo usermod -aG docker $USER
    
    print_success "Docker installed successfully"
    print_warning "Please log out and log back in for Docker permissions to take effect"
}

# Install Docker Compose
install_docker_compose() {
    print_info "Installing Docker Compose..."
    
    if command -v docker-compose &> /dev/null; then
        print_success "Docker Compose is already installed"
        return
    fi
    
    # Install Docker Compose
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    
    print_success "Docker Compose installed successfully"
}

# Install Certbot
install_certbot() {
    print_info "Installing Certbot..."
    
    if command -v certbot &> /dev/null; then
        print_success "Certbot is already installed"
        return
    fi
    
    sudo apt-get install -y certbot
    
    print_success "Certbot installed successfully"
}

# Get user input
get_user_input() {
    print_info "Please provide the following information:"
    
    read -p "Domain name (e.g., yourdomain.com): " DOMAIN
    read -p "Email for SSL certificate: " EMAIL
    read -s -p "Database password: " DB_PASSWORD
    echo
    read -s -p "NextAuth secret (32+ characters): " NEXTAUTH_SECRET
    echo
    read -p "Cloudflare R2 Access Key ID: " CLOUDFLARE_R2_ACCESS_KEY
    read -s -p "Cloudflare R2 Secret Access Key: " CLOUDFLARE_R2_SECRET_KEY
    echo
    read -p "Cloudflare R2 Endpoint: " CLOUDFLARE_R2_ENDPOINT
    read -p "Cloudflare R2 Bucket Name: " CLOUDFLARE_R2_BUCKET
    
    # Validate inputs
    if [[ -z "$DOMAIN" || -z "$EMAIL" || -z "$DB_PASSWORD" || -z "$NEXTAUTH_SECRET" ]]; then
        print_error "All fields are required"
        exit 1
    fi
    
    if [[ ${#NEXTAUTH_SECRET} -lt 32 ]]; then
        print_error "NextAuth secret must be at least 32 characters"
        exit 1
    fi
}

# Clone repository
clone_repository() {
    print_info "Cloning repository..."
    
    if [[ -d "global-hedge-ai" ]]; then
        print_warning "Repository already exists, updating..."
        cd global-hedge-ai
        git pull origin main
    else
        git clone https://github.com/yourusername/global-hedge-ai.git
        cd global-hedge-ai
    fi
    
    print_success "Repository cloned/updated successfully"
}

# Setup environment
setup_environment() {
    print_info "Setting up environment..."
    
    # Create production environment file
    cat > .env.production << EOF
# Database Configuration
DATABASE_URL="postgresql://postgres:${DB_PASSWORD}@postgres:5432/global_hedge_ai?schema=public"

# Next.js Configuration
NODE_ENV=production
NEXTAUTH_SECRET="${NEXTAUTH_SECRET}"
NEXTAUTH_URL="https://${DOMAIN}"

# Cloudflare R2 Storage
CLOUDFLARE_R2_ACCESS_KEY_ID="${CLOUDFLARE_R2_ACCESS_KEY}"
CLOUDFLARE_R2_SECRET_ACCESS_KEY="${CLOUDFLARE_R2_SECRET_KEY}"
CLOUDFLARE_R2_ENDPOINT="${CLOUDFLARE_R2_ENDPOINT}"
CLOUDFLARE_R2_BUCKET_NAME="${CLOUDFLARE_R2_BUCKET}"

# Cryptocurrency Addresses (Update these with your actual addresses)
NEXT_PUBLIC_USDT_TRC20_ADDRESS="TKaAamEouHjG9nZwoTPhgYUerejbBHGMop"
NEXT_PUBLIC_USDT_ERC20_ADDRESS="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"
NEXT_PUBLIC_BTC_ADDRESS="bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"
NEXT_PUBLIC_ETH_ADDRESS="0x742d35Cc6634C0532925a3b8D4C9db96C4b4d8b6"

# Database Password
POSTGRES_PASSWORD="${DB_PASSWORD}"

# Security
CORS_ORIGIN="https://${DOMAIN}"
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# Backup Configuration
BACKUP_ENABLED=true
BACKUP_FREQUENCY=daily
BACKUP_RETENTION_DAYS=30
BACKUP_ENCRYPTION=true
EOF
    
    print_success "Environment file created"
}

# Setup SSL
setup_ssl() {
    print_info "Setting up SSL certificate..."
    
    # Stop any running services on port 80/443
    sudo fuser -k 80/tcp 2>/dev/null || true
    sudo fuser -k 443/tcp 2>/dev/null || true
    
    # Get SSL certificate
    sudo certbot certonly --standalone -d "$DOMAIN" -d "www.$DOMAIN" --email "$EMAIL" --agree-tos --non-interactive
    
    # Create SSL directory
    sudo mkdir -p /etc/nginx/ssl
    
    # Copy certificates
    sudo cp "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" /etc/nginx/ssl/cert.pem
    sudo cp "/etc/letsencrypt/live/$DOMAIN/privkey.pem" /etc/nginx/ssl/key.pem
    sudo chmod 600 /etc/nginx/ssl/key.pem
    
    print_success "SSL certificate installed"
}

# Update Nginx configuration
update_nginx() {
    print_info "Updating Nginx configuration..."
    
    # Replace domain in nginx.conf
    sed -i "s/yourdomain.com/$DOMAIN/g" nginx.conf
    
    print_success "Nginx configuration updated"
}

# Setup firewall
setup_firewall() {
    print_info "Setting up firewall..."
    
    sudo ufw allow 22/tcp
    sudo ufw allow 80/tcp
    sudo ufw allow 443/tcp
    sudo ufw --force enable
    
    print_success "Firewall configured"
}

# Deploy application
deploy_application() {
    print_info "Deploying application..."
    
    # Build and start services
    docker-compose -f docker-compose.production.yml up -d --build
    
    # Wait for services to start
    sleep 30
    
    # Run database migrations
    docker-compose -f docker-compose.production.yml exec app npx prisma migrate deploy --schema=prisma/postgresql.prisma
    
    # Setup admin users
    docker-compose -f docker-compose.production.yml exec app tsx scripts/setup-admin.ts
    
    print_success "Application deployed successfully"
}

# Setup monitoring
setup_monitoring() {
    print_info "Setting up monitoring..."
    
    # Create monitoring script
    cat > monitor.sh << 'EOF'
#!/bin/bash
echo "=== Global Hedge AI Status ==="
echo "Date: $(date)"
echo

echo "Docker Services:"
docker-compose -f docker-compose.production.yml ps
echo

echo "Resource Usage:"
docker stats --no-stream
echo

echo "Application Health:"
curl -s https://yourdomain.com/api/health | jq . || echo "Health check failed"
echo

echo "Database Health:"
curl -s https://yourdomain.com/api/health/database | jq . || echo "Database health check failed"
EOF
    
    chmod +x monitor.sh
    
    # Add to crontab for regular monitoring
    echo "*/5 * * * * /path/to/monitor.sh >> /var/log/global-hedge-monitor.log" | crontab -
    
    print_success "Monitoring setup completed"
}

# Setup backups
setup_backups() {
    print_info "Setting up automated backups..."
    
    # Create backup script
    cat > backup.sh << EOF
#!/bin/bash
DATE=\$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups"

# Create backup directory
mkdir -p \$BACKUP_DIR

# Database backup
docker-compose -f docker-compose.production.yml exec postgres pg_dump -U postgres global_hedge_ai > \$BACKUP_DIR/db_\$DATE.sql

# Application backup
docker-compose -f docker-compose.production.yml exec app tar -czf \$BACKUP_DIR/app_\$DATE.tar.gz /app/public

# Keep only last 7 days of backups
find \$BACKUP_DIR -name "*.sql" -mtime +7 -delete
find \$BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: \$DATE"
EOF
    
    chmod +x backup.sh
    
    # Add to crontab for daily backups
    echo "0 2 * * * /path/to/backup.sh" | crontab -
    
    print_success "Backup system configured"
}

# Main execution
main() {
    print_header
    
    check_root
    check_requirements
    get_user_input
    
    print_info "Starting installation..."
    
    install_docker
    install_docker_compose
    install_certbot
    clone_repository
    setup_environment
    setup_ssl
    update_nginx
    setup_firewall
    deploy_application
    setup_monitoring
    setup_backups
    
    print_success "Installation completed successfully!"
    echo
    echo -e "${GREEN}🎉 Global Hedge AI is now running at: https://$DOMAIN${NC}"
    echo
    echo -e "${YELLOW}📋 Admin Accounts:${NC}"
    echo -e "   👑 ADMIN: admin@globalhedgeai.com"
    echo -e "   🛠️  SUPPORT: support@globalhedgeai.com"
    echo -e "   💰 ACCOUNTING: accounting@globalhedgeai.com"
    echo
    echo -e "${YELLOW}⚠️  IMPORTANT:${NC}"
    echo -e "   1. Change admin passwords after first login"
    echo -e "   2. Update cryptocurrency addresses in .env.production"
    echo -e "   3. Configure your domain DNS settings"
    echo -e "   4. Test all functionality before going live"
    echo
    echo -e "${BLUE}📚 Documentation: docs/deployment-guide-arabic.md${NC}"
}

# Run main function
main "$@"
