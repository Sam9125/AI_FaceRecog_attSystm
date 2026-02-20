# Quick Reference Guide

## 🚀 Common Commands

### Backend

```bash
# Start backend
cd backend
source venv/bin/activate
python main.py

# Install dependencies
pip install -r requirements.txt

# Create new migration
# (if using Alembic)

# Run tests
pytest

# Check code style
flake8 .
black .
```

### Frontend

```bash
# Start development server
cd frontend
npm run dev

# Build for production
npm run build

# Install dependencies
npm install

# Run tests
npm test

# Lint code
npm run lint
```

### MongoDB

```bash
# Start MongoDB
sudo systemctl start mongod

# Stop MongoDB
sudo systemctl stop mongod

# MongoDB shell
mongosh

# Backup database
mongodump --db attendance_system --out backup/

# Restore database
mongorestore --db attendance_system backup/attendance_system/
```

### Docker

```bash
# Build and start
docker-compose up -d --build

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Restart service
docker-compose restart backend
```

## 📡 API Quick Reference

### Authentication
```bash
# Register
POST /api/auth/register
Body: {"name": "...", "email": "...", "password": "...", "role": "user"}

# Login
POST /api/auth/login
Body: username=email&password=pass

# Get current user
GET /api/auth/me
Header: Authorization: Bearer <token>
```

### Face Registration
```bash
# Register face
POST /api/face/register
Header: Authorization: Bearer <token>
Body: file=<image>

# Register multiple
POST /api/face/register-multiple
Header: Authorization: Bearer <token>
Body: files=<image1>, files=<image2>
```

### Attendance
```bash
# Mark attendance
POST /api/attendance/mark
Header: Authorization: Bearer <token>
Body: file=<image>

# Get my attendance
GET /api/attendance/my-attendance
Header: Authorization: Bearer <token>

# Get statistics
GET /api/attendance/stats?days=30
Header: Authorization: Bearer <token>

# Admin: Get today's attendance
GET /api/attendance/today
Header: Authorization: Bearer <admin_token>

# Admin: Daily report
GET /api/attendance/report/daily/2024-01-15
Header: Authorization: Bearer <admin_token>
```

## 🔧 Configuration

### Environment Variables (.env)
```bash
# Required
SECRET_KEY=your-secret-key-here
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=attendance_system

# Optional
DEBUG=True
HOST=0.0.0.0
PORT=8000
FACE_RECOGNITION_TOLERANCE=0.6
MIN_CONFIDENCE_THRESHOLD=0.5
ATTENDANCE_COOLDOWN_HOURS=8
```

### Face Recognition Settings
```python
# config.py
FACE_RECOGNITION_TOLERANCE = 0.6  # Lower = stricter (0.4-0.7)
MIN_CONFIDENCE_THRESHOLD = 0.5    # Minimum confidence to mark attendance
MAX_FACES_PER_FRAME = 10          # Maximum faces to detect
```

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
# Find process
sudo lsof -i :8000
# Kill process
kill -9 <PID>
```

**MongoDB connection error:**
```bash
# Check status
sudo systemctl status mongod
# Restart
sudo systemctl restart mongod
```

**Face detection not working:**
```python
# Check if dlib is installed
python -c "import dlib; print(dlib.__version__)"
# Reinstall if needed
pip install --force-reinstall dlib
```

### Frontend Issues

**Port 3000 in use:**
```bash
# Kill process on port 3000
npx kill-port 3000
```

**Module not found:**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

**Webcam not working:**
- Check browser permissions
- Use HTTPS in production
- Try different browser (Chrome recommended)

## 📊 Database Queries

### MongoDB Shell Commands

```javascript
// Connect
mongosh

// Use database
use attendance_system

// Count users
db.users.countDocuments()

// Find user by email
db.users.findOne({email: "john@example.com"})

// Count today's attendance
db.attendance.countDocuments({
  date: new Date().toISOString().split('T')[0]
})

// Get user's attendance
db.attendance.find({user_id: "507f1f77bcf86cd799439011"})

// Delete user
db.users.deleteOne({email: "john@example.com"})

// Clear all attendance
db.attendance.deleteMany({})

// Create index
db.users.createIndex({email: 1}, {unique: true})
```

## 🔐 Security

### Generate Secret Key
```bash
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Hash Password Manually
```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
hashed = pwd_context.hash("password123")
print(hashed)
```

### Verify JWT Token
```python
from jose import jwt
from config import settings

token = "your-token-here"
payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
print(payload)
```

## 📈 Performance

### Check System Resources
```bash
# CPU and memory
htop

# Disk usage
df -h

# MongoDB stats
mongosh
db.stats()
db.serverStatus()
```

### Optimize Images
```bash
# Reduce image size before upload
convert input.jpg -resize 800x600 output.jpg

# Compress image
convert input.jpg -quality 85 output.jpg
```

## 🧪 Testing

### Test API with curl
```bash
# Health check
curl http://localhost:8000/health

# Register user
curl -X POST http://localhost:8000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","email":"test@test.com","password":"test123","role":"user"}'

# Login
curl -X POST http://localhost:8000/api/auth/login \
  -d "username=test@test.com&password=test123"

# Upload face
curl -X POST http://localhost:8000/api/face/register \
  -H "Authorization: Bearer <token>" \
  -F "file=@face.jpg"
```

### Test with Python
```python
import requests

# Login
response = requests.post(
    "http://localhost:8000/api/auth/login",
    data={"username": "test@test.com", "password": "test123"}
)
token = response.json()["access_token"]

# Get current user
headers = {"Authorization": f"Bearer {token}"}
response = requests.get(
    "http://localhost:8000/api/auth/me",
    headers=headers
)
print(response.json())
```

## 📝 Logs

### View Logs
```bash
# Backend logs
tail -f backend/app.log

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# MongoDB logs
sudo tail -f /var/log/mongodb/mongod.log

# System logs
sudo journalctl -u attendance-backend -f
```

## 🔄 Updates

### Update Backend
```bash
cd backend
source venv/bin/activate
pip install --upgrade -r requirements.txt
sudo systemctl restart attendance-backend
```

### Update Frontend
```bash
cd frontend
npm update
npm run build
sudo systemctl restart nginx
```

## 📞 Support

- Documentation: README.md
- API Docs: http://localhost:8000/docs
- Issues: GitHub Issues
- Testing: TESTING_GUIDE.md
- Deployment: DEPLOYMENT.md

---

Keep this guide handy for quick reference! 📚
