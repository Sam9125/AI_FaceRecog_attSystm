# Production Deployment Guide

## 🚀 Production Deployment Options

### Option 1: Docker Deployment (Recommended)

#### Prerequisites
```bash
# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Install Docker Compose
sudo apt install docker-compose -y
```

#### Deploy with Docker Compose
```bash
cd attendance-system/backend

# Update docker-compose.yml for production
# Set strong SECRET_KEY
# Configure MongoDB credentials

# Build and start
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Option 2: Manual Deployment with Nginx

#### 1. Setup Backend with Systemd

Create service file:
```bash
sudo nano /etc/systemd/system/attendance-backend.service
```

Add content:
```ini
[Unit]
Description=Attendance System Backend
After=network.target mongodb.service

[Service]
Type=simple
User=www-data
WorkingDirectory=/var/www/attendance-system/backend
Environment="PATH=/var/www/attendance-system/backend/venv/bin"
ExecStart=/var/www/attendance-system/backend/venv/bin/uvicorn main:app --host 0.0.0.0 --port 8000
Restart=always

[Install]
WantedBy=multi-user.target
```

Enable and start:
```bash
sudo systemctl daemon-reload
sudo systemctl enable attendance-backend
sudo systemctl start attendance-backend
sudo systemctl status attendance-backend
```

#### 2. Setup Nginx Reverse Proxy

Install Nginx:
```bash
sudo apt install nginx -y
```

Create Nginx config:
```bash
sudo nano /etc/nginx/sites-available/attendance
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/attendance-system/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support (if needed)
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/attendance /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 3. Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Option 3: Cloud Deployment (AWS/GCP/Azure)

#### AWS EC2 Deployment

1. **Launch EC2 Instance**
   - Ubuntu 20.04 LTS
   - t2.medium or larger
   - Open ports: 22, 80, 443

2. **Setup Application**
```bash
# SSH into instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Clone repository
git clone your-repo-url
cd attendance-system

# Follow manual deployment steps above
```

3. **Setup MongoDB Atlas** (Managed MongoDB)
   - Create cluster at mongodb.com/cloud/atlas
   - Get connection string
   - Update .env with connection string

## 🔒 Production Security Checklist

### 1. Environment Variables
```bash
# backend/.env
SECRET_KEY=<strong-random-key-64-chars>
MONGODB_URL=mongodb://username:password@host:27017
DEBUG=False
ALLOWED_ORIGINS=https://your-domain.com
```

### 2. MongoDB Security
```bash
# Enable authentication
sudo nano /etc/mongod.conf

# Add:
security:
  authorization: enabled

# Create admin user
mongosh
use admin
db.createUser({
  user: "admin",
  pwd: "strong-password",
  roles: ["userAdminAnyDatabase", "dbAdminAnyDatabase"]
})
```

### 3. Firewall Configuration
```bash
# UFW firewall
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 4. Rate Limiting (Nginx)
```nginx
# Add to nginx config
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;

location /api {
    limit_req zone=api burst=20;
    # ... rest of config
}
```

## 📊 Monitoring & Logging

### 1. Application Logs
```bash
# View backend logs
sudo journalctl -u attendance-backend -f

# View Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### 2. MongoDB Monitoring
```bash
# Monitor MongoDB
mongosh
db.serverStatus()
db.stats()
```

### 3. System Monitoring
```bash
# Install monitoring tools
sudo apt install htop iotop -y

# Check system resources
htop
df -h
free -m
```

## 🔄 Backup Strategy

### 1. MongoDB Backup
```bash
# Create backup script
nano /usr/local/bin/backup-mongodb.sh
```

```bash
#!/bin/bash
BACKUP_DIR="/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR
mongodump --out $BACKUP_DIR/backup_$DATE

# Keep only last 7 days
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} +
```

```bash
# Make executable
chmod +x /usr/local/bin/backup-mongodb.sh

# Add to crontab (daily at 2 AM)
crontab -e
0 2 * * * /usr/local/bin/backup-mongodb.sh
```

### 2. Application Backup
```bash
# Backup uploads directory
tar -czf uploads_backup_$(date +%Y%m%d).tar.gz uploads/
```

## 🚀 Performance Optimization

### 1. Backend Optimization
```python
# config.py - Production settings
DEBUG = False
WORKERS = 4  # CPU cores * 2
```

### 2. Frontend Build Optimization
```bash
cd frontend

# Production build
npm run build

# Serve with Nginx (already configured above)
```

### 3. Database Indexing
```python
# Already configured in database.py
# Verify indexes
mongosh
use attendance_system
db.users.getIndexes()
db.attendance.getIndexes()
```

## 📈 Scaling Strategies

### Horizontal Scaling
```yaml
# docker-compose-scaled.yml
version: '3.8'
services:
  backend:
    build: .
    deploy:
      replicas: 3
    # ... rest of config
  
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    depends_on:
      - backend
```

### Load Balancing with Nginx
```nginx
upstream backend {
    least_conn;
    server backend1:8000;
    server backend2:8000;
    server backend3:8000;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

## 🔧 Maintenance

### Update Application
```bash
# Pull latest code
git pull origin main

# Update backend
cd backend
source venv/bin/activate
pip install -r requirements.txt
sudo systemctl restart attendance-backend

# Update frontend
cd ../frontend
npm install
npm run build
```

### Database Maintenance
```bash
# Compact database
mongosh
use attendance_system
db.runCommand({ compact: 'users' })
db.runCommand({ compact: 'attendance' })
```

## 📞 Troubleshooting Production Issues

### Backend Not Starting
```bash
# Check logs
sudo journalctl -u attendance-backend -n 50

# Check if port is in use
sudo lsof -i :8000

# Restart service
sudo systemctl restart attendance-backend
```

### High Memory Usage
```bash
# Check memory
free -m

# Restart services
sudo systemctl restart attendance-backend
sudo systemctl restart mongod
```

### Slow Performance
```bash
# Check database performance
mongosh
db.currentOp()

# Check system load
uptime
top
```

---

**Production deployment complete!** Monitor logs and performance regularly.
