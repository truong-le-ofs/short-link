#!/bin/bash

# URL Shortener Frontend Deployment Script
# This script handles production deployment with Docker

set -e

echo "🚀 Starting URL Shortener Frontend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.local"
BACKUP_DIR="backups/$(date +%Y%m%d_%H%M%S)"

# Functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

check_requirements() {
    log_info "Checking deployment requirements..."
    
    # Check Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Check Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi
    
    # Check environment file
    if [ ! -f "$ENV_FILE" ]; then
        log_warn "Environment file $ENV_FILE not found. Creating template..."
        create_env_template
    fi
    
    log_info "✅ All requirements met"
}

create_env_template() {
    cat > "$ENV_FILE" << EOF
# Frontend Environment Variables
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SHORT_URL_BASE=http://localhost:3000

# Authentication (if using JWT)
AUTH_SECRET=your-auth-secret-here
JWT_SECRET=your-jwt-secret-here

# Optional: Analytics
ANALYTICS_ENABLED=true
EOF
    log_info "Created environment template at $ENV_FILE"
    log_warn "Please update the environment variables before deploying!"
}

pre_deployment_checks() {
    log_info "Running pre-deployment checks..."
    
    # Check if ports are available
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warn "Port 3000 is already in use. Stopping existing services..."
        docker-compose down || true
    fi
    
    if lsof -Pi :80 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warn "Port 80 is already in use. Please check nginx configuration."
    fi
    
    # Validate environment variables
    if grep -q "your-.*-here" "$ENV_FILE"; then
        log_error "Please update the placeholder values in $ENV_FILE"
        exit 1
    fi
    
    log_info "✅ Pre-deployment checks passed"
}

build_application() {
    log_info "Building application..."
    
    # Build the Docker image
    docker-compose build --no-cache
    
    log_info "✅ Application built successfully"
}

deploy_production() {
    log_info "Deploying to production..."
    
    # Start services with production profile
    docker-compose --profile production up -d
    
    # Wait for services to be ready
    log_info "Waiting for services to start..."
    sleep 10
    
    # Health check
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        log_info "✅ Application deployed successfully!"
        log_info "Frontend available at: http://localhost:3000"
        log_info "Nginx proxy available at: http://localhost:80"
    else
        log_error "Health check failed. Please check the logs:"
        docker-compose logs
        exit 1
    fi
}

deploy_development() {
    log_info "Deploying for development..."
    
    # Start only frontend service
    docker-compose up -d frontend
    
    # Wait for service to be ready
    log_info "Waiting for service to start..."
    sleep 10
    
    # Health check
    if curl -f http://localhost:3000/api/health >/dev/null 2>&1; then
        log_info "✅ Development environment deployed successfully!"
        log_info "Frontend available at: http://localhost:3000"
    else
        log_error "Health check failed. Please check the logs:"
        docker-compose logs frontend
        exit 1
    fi
}

show_logs() {
    log_info "Showing application logs..."
    docker-compose logs -f
}

stop_services() {
    log_info "Stopping services..."
    docker-compose down
    log_info "✅ Services stopped"
}

backup_data() {
    log_info "Creating backup..."
    mkdir -p "$BACKUP_DIR"
    
    # Backup environment file
    cp "$ENV_FILE" "$BACKUP_DIR/"
    
    # Backup Docker volumes (if any)
    # docker run --rm -v url-shortener_data:/data -v $(pwd)/$BACKUP_DIR:/backup alpine tar czf /backup/data.tar.gz -C /data .
    
    log_info "✅ Backup created at $BACKUP_DIR"
}

show_status() {
    log_info "Service Status:"
    docker-compose ps
    echo ""
    
    log_info "Resource Usage:"
    docker stats --no-stream
}

show_help() {
    echo "URL Shortener Frontend Deployment Script"
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  deploy-prod     Deploy for production with nginx"
    echo "  deploy-dev      Deploy for development"
    echo "  build           Build the application"
    echo "  stop            Stop all services"
    echo "  logs            Show application logs"
    echo "  status          Show service status"
    echo "  backup          Create a backup"
    echo "  help            Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 deploy-prod  # Deploy with nginx proxy"
    echo "  $0 deploy-dev   # Deploy development environment"
    echo "  $0 logs         # Follow application logs"
}

# Main script
case "$1" in
    "deploy-prod")
        check_requirements
        pre_deployment_checks
        build_application
        deploy_production
        ;;
    "deploy-dev")
        check_requirements
        pre_deployment_checks
        build_application
        deploy_development
        ;;
    "build")
        check_requirements
        build_application
        ;;
    "stop")
        stop_services
        ;;
    "logs")
        show_logs
        ;;
    "status")
        show_status
        ;;
    "backup")
        backup_data
        ;;
    "help"|"--help"|"-h")
        show_help
        ;;
    *)
        if [ -z "$1" ]; then
            show_help
        else
            log_error "Unknown command: $1"
            show_help
            exit 1
        fi
        ;;
esac