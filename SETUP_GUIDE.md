# Quick Setup Guide - AI Face Recognition Attendance System

## 🚀 Quick Start (5 Minutes)

### Step 1: Install System Dependencies

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Python and build tools
sudo apt install -y python3.10 python3.10-venv python3-pip \
    build-essential cmake libopencv-dev libboost-all-dev \
    libgtk-3-dev python3-dev

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
```

### Step 2: Install MongoDB

```bash
# Import MongoDB key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Install MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Step 3: Setup Backend

```bash
cd attendance-system/backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Setup environment
cp .env.example .env

# Generate secret key
python3 -c "import secrets; print('SECRET_KEY=' + secrets.token_urlsafe(32))" >> .env
```

### Step 4: Setup Frontend

```bash
cd ../frontend
npm install
```

### Step 5: Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
source venv/bin/activate
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

### Step 6: Access the Application

Open browser: `http://localhost:3000`

## 📝 First Time Usage

1. **Register Account**
   - Click "Register here"
   - Fill in details (use role: "admin" for first user)
   - Click Register

2. **Login**
   - Enter email and password
   - Click Login

3. **Register Face**
   - Click "Register Face"
   - Capture 3-5 images from different angles
   - Click "Register Face"

4. **Mark Attendance**
   - Click "Mark Attendance"
   - Capture your face
   - System will mark attendance

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check Python version
python3 --version  # Should be 3.10+

# Reinstall dependencies
pip install --force-reinstall -r requirements.txt
```

### MongoDB connection error
```bash
# Check MongoDB status
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

### Frontend won't start
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Face detection not working
- Ensure good lighting
- Allow camera permissions in browser
- Use Chrome or Firefox
- Check if camera works in other apps

## 📊 Test the System

### Create Admin User
```bash
# Use the registration page with role: "admin"
```

### Test API
```bash
# Health check
curl http://localhost:8000/health

# View API docs
# Open: http://localhost:8000/docs
```

## 🎯 Next Steps

1. Read the full README.md for detailed documentation
2. Configure face recognition settings in `backend/config.py`
3. Customize frontend theme in `frontend/src/App.jsx`
4. Set up production deployment with Docker

## 📞 Need Help?

- Check logs: `backend/app.log`
- View API docs: `http://localhost:8000/docs`
- Review README.md for detailed troubleshooting

---

**Congratulations!** Your AI Face Recognition Attendance System is ready to use! 🎉
