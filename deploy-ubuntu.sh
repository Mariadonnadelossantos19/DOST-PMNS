#!/bin/bash

# PMNS 2.0 Ubuntu Deployment Script
# This script automates the deployment process

echo "🚀 PMNS 2.0 Ubuntu Deployment Script"
echo "====================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please do not run this script as root"
    exit 1
fi

# Update system
print_status "Updating Ubuntu system..."
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
print_status "Installing Node.js 18..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node_version=$(node --version)
npm_version=$(npm --version)
print_status "Node.js version: $node_version"
print_status "NPM version: $npm_version"

# Install PM2 globally
print_status "Installing PM2 process manager..."
sudo npm install -g pm2

# Install Nginx
print_status "Installing Nginx web server..."
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx

# Create application directory
print_status "Creating application directory..."
sudo mkdir -p /var/www/pmns
sudo chown -R $USER:$USER /var/www/pmns

# Install application dependencies
print_status "Installing server dependencies..."
cd /var/www/pmns/server
npm install --production

print_status "Installing client dependencies..."
cd /var/www/pmns/client
npm install
npm run build

# Create PM2 log directory
print_status "Creating PM2 log directory..."
sudo mkdir -p /var/log/pm2
sudo chown -R $USER:$USER /var/log/pm2

# Create Nginx configuration
print_status "Creating Nginx configuration..."
sudo tee /etc/nginx/sites-available/pmns > /dev/null <<EOF
server {
    listen 80;
    server_name _;

    # Client (React) - Static files
    location / {
        root /var/www/pmns/client/dist;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # API Server - Proxy to Node.js
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }

    # File uploads
    location /uploads/ {
        alias /var/www/pmns/server/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Enable Nginx site
print_status "Enabling Nginx site..."
sudo ln -sf /etc/nginx/sites-available/pmns /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl reload nginx

# Configure firewall
print_status "Configuring firewall..."
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw --force enable

# Set proper permissions
print_status "Setting file permissions..."
sudo chown -R www-data:www-data /var/www/pmns
sudo chmod -R 755 /var/www/pmns

# Create systemd service for PM2
print_status "Creating PM2 startup service..."
sudo env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u $USER --hp $HOME

print_status "Deployment completed successfully!"
print_warning "IMPORTANT: You still need to:"
print_warning "1. Create /var/www/pmns/server/.env file with your MongoDB Atlas connection"
print_warning "2. Upload your application files to /var/www/pmns/"
print_warning "3. Start the application with: pm2 start /var/www/pmns/server/ecosystem.config.js"
print_warning "4. Save PM2 configuration: pm2 save"

echo ""
echo "🎉 Ubuntu server is ready for PMNS 2.0 deployment!"
echo "📋 Next steps:"
echo "   1. Upload your application files"
echo "   2. Configure .env file"
echo "   3. Start the application"
echo "   4. Set up SSL certificate (optional)"
