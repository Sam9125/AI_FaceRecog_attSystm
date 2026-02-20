# Getting Started - AI Face Recognition Attendance System

Welcome! This guide will help you get the system up and running in minutes.

## 🎯 What You'll Build

A complete attendance system with:
- ✅ Face recognition for automatic attendance
- ✅ User authentication and authorization
- ✅ Admin dashboard with analytics
- ✅ Real-time webcam integration
- ✅ Attendance reports and CSV export
- ✅ Production-ready deployment

## ⚡ Quick Start (5 Minutes)

### Prerequisites Check
```bash
# Check Python version (need 3.10+)
python3 --version

# Check Node.js (need 16+)
node --version

# Check if MongoDB is installed
mongod --version
```

### Step 1: Install Dependencies (2 minutes)
```bash
# System dependencies
sudo apt update
sudo apt install -y python3.10 python3-pip nodejs npm mongodb-org

# Start MongoDB
sudo systemctl start mongod
```

### Step 2: Setup Backend (2 minutes)
```bash
cd attendance-system/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install packages
pip install -r requirements.txt

# Setup environment
cp .env.example .env
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))" >> .env
```

### Step 3: Setup Frontend (1 minute)
```bash
cd ../frontend
npm install
```

### Step 4: Run the System
```bash
# Terminal 1: Backend
cd backend
source venv/bin/activate
python main.py

# Terminal 2: Frontend
cd frontend
npm run dev
```

### Step 5: Access the System
Open browser: `http://localhost:3000`

## 📚 First-Time User Guide

### 1. Create Your Account (30 seconds)
1. Click "Register here"
2. Fill in your details
3. Select role: "admin" (for first user)
4. Click "Register"

### 2. Login (10 seconds)
1. Enter your email and password
2. Click "Login"

### 3. Register Your Face (1 minute)
1. Click "Register Face" in navbar
2. Click "Use Webcam"
3. Allow camera permissions
4. Capture 3-5 images from different angles:
   - Front view
   - Slight left
   - Slight right
   - Looking up slightly
   - Looking down slightly
5. Click "Register Face"
6. Wait for success message

### 4. Mark Attendance (30 seconds)
1. Click "Mark Attendance"
2. Click "Use Webcam"
3. Position your face in the frame
4. Click "Capture & Mark Attendance"
5. See your confidence score!

### 5. View Your Dashboard (10 seconds)
1. Click "Dashboard"
2. See your attendance statistics
3. View attendance percentage
4. Check recent attendance

### 6. Admin Features (If you're admin)
1. Click "Admin" in navbar
2. View all users' attendance
3. Select different dates
4. Download CSV reports

## 🎓 Learning Path

### Beginner (Day 1)
- [ ] Complete Quick Start
- [ ] Register account and face
- [ ] Mark attendance
- [ ] View dashboard
- [ ] Read README.md

### Intermediate (Day 2-3)
- [ ] Understand project structure
- [ ] Explore API documentation
- [ ] Test different features
- [ ] Try admin features
- [ ] Read ARCHITECTURE.md

### Advanced (Week 1)
- [ ] Customize configuration
- [ ] Modify UI theme
- [ ] Add new features
- [ ] Deploy to production
- [ ] Read DEPLOYMENT.md

## 🔍 Understanding the System

### How Face Recognition Works
```
1. You upload/capture an image
2. System detects your face
3. Generates a 128-number "fingerprint" (encoding)
4. Compares with your registered encoding
5. If match > 50% confidence → Attendance marked!
```

### Key Concepts

**Face Encoding**: A unique 128-dimensional vector representing your face
**Confidence Score**: How sure the system is (0-100%)
**Tolerance**: How strict the matching is (default: 0.6)
**Cooldown**: Time between attendance marks (default: 8 hours)

### System Components

```
Frontend (React)
    ↓ HTTP Requests
Backend (FastAPI)
    ↓ Queries
Database (MongoDB)
    ↓ Stores
User Data + Attendance Records
```

## 🛠️ Common Tasks

### Change Your Password
```javascript
// In MongoDB shell
use attendance_system
db.users.updateOne(
  {email: "your@email.com"},
  {$set: {hashed_password: "new_hash"}}
)
```

### View All Users
```javascript
// In MongoDB shell
db.users.find().pretty()
```

### Check Today's Attendance
```javascript
// In MongoDB shell
db.attendance.find({
  date: new Date().toISOString().split('T')[0]
}).pretty()
```

### Export Attendance Data
```bash
# Export to JSON
mongoexport --db attendance_system --collection attendance --out attendance.json

# Export to CSV (from admin dashboard)
# Click "Download CSV" button
```

## 🎨 Customization Guide

### Change UI Colors
Edit `frontend/src/App.jsx`:
```javascript
const theme = createTheme({
  palette: {
    primary: { main: '#your-color' },
    secondary: { main: '#your-color' },
  },
});
```

### Adjust Face Recognition Settings
Edit `backend/config.py`:
```python
FACE_RECOGNITION_TOLERANCE = 0.6  # Lower = stricter
MIN_CONFIDENCE_THRESHOLD = 0.5    # Minimum to mark attendance
```

### Change Attendance Rules
Edit `backend/config.py`:
```python
ATTENDANCE_COOLDOWN_HOURS = 8  # Hours between marks
```

## 🐛 Troubleshooting Quick Fixes

### Backend won't start
```bash
# Check if port is in use
sudo lsof -i :8000
# Kill the process
kill -9 <PID>
```

### MongoDB not running
```bash
sudo systemctl start mongod
sudo systemctl status mongod
```

### Face not detected
- Improve lighting
- Move closer to camera
- Remove obstructions
- Try different angle

### Low confidence score
- Re-register with better images
- Use multiple images
- Ensure good lighting
- Look directly at camera

## 📖 Next Steps

### Explore Documentation
1. **README.md** - Complete overview
2. **API_DOCUMENTATION.md** - API reference
3. **TESTING_GUIDE.md** - How to test
4. **DEPLOYMENT.md** - Production deployment
5. **FAQ.md** - Common questions

### Try Advanced Features
1. Multi-face detection
2. Attendance reports
3. Date filtering
4. CSV export
5. User management

### Customize the System
1. Change UI theme
2. Add new fields
3. Modify attendance rules
4. Add email notifications
5. Integrate with other systems

## 🚀 Production Deployment

### Quick Production Setup
```bash
# 1. Setup domain and SSL
sudo certbot --nginx -d your-domain.com

# 2. Configure environment
nano backend/.env
# Set DEBUG=False
# Set strong SECRET_KEY
# Set production MONGODB_URL

# 3. Build frontend
cd frontend
npm run build

# 4. Setup systemd service
sudo systemctl enable attendance-backend
sudo systemctl start attendance-backend

# 5. Configure Nginx
sudo nano /etc/nginx/sites-available/attendance
sudo systemctl restart nginx
```

See DEPLOYMENT.md for detailed instructions.

## 💡 Tips for Success

### For Best Face Recognition
1. ✅ Use good lighting
2. ✅ Capture multiple angles
3. ✅ Look directly at camera
4. ✅ Remove glasses (or register with them)
5. ✅ Keep neutral expression

### For System Performance
1. ✅ Use HOG model for speed
2. ✅ Resize large images
3. ✅ Enable database indexes
4. ✅ Use caching in production
5. ✅ Monitor system resources

### For Security
1. ✅ Use strong SECRET_KEY
2. ✅ Enable HTTPS in production
3. ✅ Regular backups
4. ✅ Update dependencies
5. ✅ Monitor logs

## 🎯 Success Checklist

- [ ] System is running
- [ ] Account created
- [ ] Face registered
- [ ] Attendance marked
- [ ] Dashboard viewed
- [ ] Admin features tested (if admin)
- [ ] Documentation read
- [ ] System customized
- [ ] Production deployed (optional)

## 🤝 Getting Help

### Resources
- 📖 Documentation in `/docs` folder
- 🌐 API docs at `http://localhost:8000/docs`
- 💬 GitHub Issues for bugs
- 📧 Check FAQ.md for common questions

### Community
- Share your experience
- Report bugs
- Suggest features
- Contribute code

## 🎉 Congratulations!

You now have a fully functional AI-powered attendance system!

### What's Next?
1. Invite team members
2. Start marking attendance
3. Generate reports
4. Customize to your needs
5. Deploy to production

### Keep Learning
- Explore the codebase
- Try adding features
- Optimize performance
- Share your improvements

---

**Welcome to the future of attendance tracking!** 🚀

Need help? Check the documentation or create an issue on GitHub.
