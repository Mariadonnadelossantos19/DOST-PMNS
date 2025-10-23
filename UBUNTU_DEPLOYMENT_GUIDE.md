# 🐧 PMNS 2.0 Ubuntu Deployment Guide

## **🚀 Production Deployment Checklist**

### **📋 Pre-Deployment Requirements**

#### **1. System Requirements**
- **Ubuntu 20.04 LTS or higher** (recommended)
- **Node.js 18+** (LTS version)
- **MongoDB Atlas account** (online database)
- **Domain name** (optional but recommended)
- **SSL certificate** (for HTTPS)

#### **2. Server Specifications**
- **RAM:** Minimum 2GB (4GB+ recommended)
- **Storage:** 20GB+ free space
- **CPU:** 2+ cores
- **Network:** Stable internet connection

---

## **🔧 Step-by-Step Deployment**

### **Step 1: Server Setup**

#### **Update Ubuntu System:**
```bash
sudo apt update && sudo apt upgrade -y
```

#### **Install Node.js 18:**
```bash
# Install Node.js 18 LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify installation
node --version
npm --version
```

#### **Install PM2 (Process Manager):**
```bash
sudo npm install -g pm2
```

#### **Install Nginx (Web Server):**
```bash
sudo apt install nginx -y
sudo systemctl enable nginx
sudo systemctl start nginx
```

### **Step 2: Application Deployment**

#### **Clone/Upload Your Application:**
```bash
# Create application directory
sudo mkdir -p /var/www/pmns
sudo chown -R $USER:$USER /var/www/pmns
cd /var/www/pmns

# Upload your application files here
# (Use SCP, Git, or file transfer)
```

#### **Install Dependencies:**
```bash
cd /var/www/pmns/server
npm install --production

cd /var/www/pmns/client
npm install
npm run build
```

### **Step 3: Environment Configuration**

#### **Create Production .env File:**
```bash
sudo nano /var/www/pmns/server/.env
```

#### **Production .env Content:**
```bash
# PMNS 2.0 Production Configuration
MONGODB_URI=mongodb+srv://username:password@pmns.9rxkkng.mongodb.net/pmns?retryWrites=true&w=majority&appName=PMNS

# Server Configuration
PORT=4000
NODE_ENV=production

# JWT Configuration
JWT_SECRET=your_very_secure_jwt_secret_key_for_production_2024
JWT_EXPIRE=7d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_production_email@gmail.com
EMAIL_PASS=your_app_password

# File Upload Configuration
MAX_FILE_SIZE=10485760
UPLOAD_PATH=/var/www/pmns/server/uploads

# CORS Configuration
CORS_ORIGIN=https://yourdomain.com
```

### **Step 4: Process Management with PM2**

#### **Create PM2 Ecosystem File:**
```bash
sudo nano /var/www/pmns/ecosystem.config.js
```

#### **PM2 Configuration:**
```javascript
module.exports = {
  apps: [{
    name: 'pmns-server',
    script: './server/src/server.js',
    cwd: '/var/www/pmns',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 4000
    },
    error_file: '/var/log/pm2/pmns-error.log',
    out_file: '/var/log/pm2/pmns-out.log',
    log_file: '/var/log/pm2/pmns-combined.log',
    time: true
  }]
};
```

#### **Start Application with PM2:**
```bash
cd /var/www/pmns
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### **Step 5: Nginx Configuration**

#### **Create Nginx Configuration:**
```bash
sudo nano /etc/nginx/sites-available/pmns
```

#### **Nginx Configuration:**
```nginx
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;

    # Client (React) - Static files
    location / {
        root /var/www/pmns/client/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # API Server - Proxy to Node.js
    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # File uploads
    location /uploads/ {
        alias /var/www/pmns/server/uploads/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

#### **Enable Site:**
```bash
sudo ln -s /etc/nginx/sites-available/pmns /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### **Step 6: SSL Certificate (Let's Encrypt)**

#### **Install Certbot:**
```bash
sudo apt install certbot python3-certbot-nginx -y
```

#### **Get SSL Certificate:**
```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

---

## **🔒 Security Considerations**

### **1. Firewall Configuration:**
```bash
sudo ufw allow 22    # SSH
sudo ufw allow 80    # HTTP
sudo ufw allow 443   # HTTPS
sudo ufw enable
```

### **2. Database Security:**
- Use strong MongoDB Atlas credentials
- Enable IP whitelisting in MongoDB Atlas
- Use environment variables for sensitive data

### **3. File Permissions:**
```bash
sudo chown -R www-data:www-data /var/www/pmns
sudo chmod -R 755 /var/www/pmns
sudo chmod 600 /var/www/pmns/server/.env
```

### **4. Process Security:**
```bash
# Create non-root user for application
sudo useradd -m -s /bin/bash pmns
sudo usermod -aG www-data pmns
```

---

## **📊 Monitoring & Maintenance**

### **1. Log Management:**
```bash
# View PM2 logs
pm2 logs pmns-server

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **2. System Monitoring:**
```bash
# Install monitoring tools
sudo apt install htop iotop nethogs -y

# Monitor system resources
htop
```

### **3. Backup Strategy:**
```bash
# Backup application
sudo tar -czf /backup/pmns-$(date +%Y%m%d).tar.gz /var/www/pmns

# Backup database (MongoDB Atlas handles this automatically)
```

---

## **🚨 Common Issues & Solutions**

### **1. Port Already in Use:**
```bash
sudo lsof -i :4000
sudo kill -9 <PID>
```

### **2. Permission Denied:**
```bash
sudo chown -R $USER:$USER /var/www/pmns
sudo chmod -R 755 /var/www/pmns
```

### **3. MongoDB Connection Issues:**
- Check MongoDB Atlas IP whitelist
- Verify connection string in .env
- Test connection: `node -e "require('dotenv').config(); console.log(process.env.MONGODB_URI)"`

### **4. Nginx 502 Bad Gateway:**
- Check if Node.js server is running: `pm2 status`
- Check server logs: `pm2 logs pmns-server`
- Verify port 4000 is accessible

---

## **✅ Deployment Checklist**

- [ ] Ubuntu server prepared
- [ ] Node.js 18+ installed
- [ ] Application files uploaded
- [ ] Dependencies installed
- [ ] Production .env file created
- [ ] PM2 process manager configured
- [ ] Nginx web server configured
- [ ] SSL certificate installed
- [ ] Firewall configured
- [ ] Application tested
- [ ] Monitoring setup
- [ ] Backup strategy implemented

---

## **🎯 Production URLs**

After successful deployment:
- **Frontend:** `https://yourdomain.com`
- **API:** `https://yourdomain.com/api/`
- **File Uploads:** `https://yourdomain.com/uploads/`

---

**Your PMNS 2.0 system will be production-ready on Ubuntu with this configuration!**
