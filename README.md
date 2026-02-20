# AI Face Recognition Attendance System

A production-level, full-stack attendance system using real-time face recognition. Built with FastAPI, React, OpenCV, and MongoDB.

## 🚀 Features

### Core Features
- **Face Registration**: Register faces with single or multiple images for better accuracy
- **Real-Time Attendance**: Mark attendance using webcam or uploaded images
- **Multi-Face Detection**: Detect and mark attendance for multiple people simultaneously
- **Liveness Detection**: Basic anti-spoofing with eye blink detection
- **JWT Authentication**: Secure login system with role-based access control
- **Admin Dashboard**: Comprehensive analytics and reporting
- **Attendance Reports**: Generate daily/monthly reports with CSV export
- **Confidence Scoring**: Each attendance record includes recognition confidence

### Security Features
- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Admin/User)
- Secure face encoding storage
- Token-based API protection

## 📋 Tech Stack

### Backend
- **Python 3.10+**
- **FastAPI**: Modern web framework
- **OpenCV**: Computer vision library
- **face_recognition**: Face detection and recognition
- **dlib**: Machine learning toolkit
- **MongoDB**: NoSQL database
- **PyMongo**: MongoDB driver
- **python-jose**: JWT token handling
- **passlib**: Password hashing

### Frontend
- **React 18**: UI library
- **Material-UI**: Component library
- **Vite**: Build tool
- **Axios**: HTTP client
- **react-webcam**: Webcam integration
- **Recharts**: Data visualization
- **React Router**: Navigation

## 🛠️ Installation Guide (Ubuntu 20.04)

### Prerequisites

```bash
# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Python 3.10 and pip
sudo apt install python3.10 python3.10-venv python3-pip -y

# Install system dependencies for OpenCV and dlib
sudo apt install -y \
    build-essential \
    cmake \
    libopencv-dev \
    libboost-all-dev \
    libgtk-3-dev \
    libavcodec-dev \
    libavformat-dev \
    libswscale-dev \
    libv4l-dev \
    libxvidcore-dev \
    libx264-dev \
    libjpeg-dev \
    libpng-dev \
    libtiff-dev \
    gfortran \
    openexr \
    libatlas-base-dev \
    python3-dev \
    python3-numpy \
    libtbb2 \
    libtbb-dev \
    libdc1394-dev

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installations
python3 --version
node --version
npm --version
```

### MongoDB Installation

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start MongoDB service
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

## 📦 Project Setup

### 1. Clone or Download the Project

```bash
cd ~
# If you have the project, navigate to it
cd attendance-system
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install Python dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env

# Edit .env file with your settings
nano .env
```

**Important**: Update the `.env` file with a strong SECRET_KEY:
```bash
# Generate a secure secret key
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copy the output and paste it as your SECRET_KEY in `.env`.

### 3. Frontend Setup

```bash
# Open new terminal
cd ~/attendance-system/frontend

# Install dependencies
npm install

# Create .env file (optional)
echo "VITE_API_URL=http://localhost:8000" > .env
```

## 🚀 Running the Application

### Start Backend

```bash
cd ~/attendance-system/backend
source venv/bin/activate
python main.py
```

Backend will run on: `http://localhost:8000`

API Documentation: `http://localhost:8000/docs`

### Start Frontend

```bash
# Open new terminal
cd ~/attendance-system/frontend
npm run dev
```

Frontend will run on: `http://localhost:3000`

## 🐳 Docker Deployment (Alternative)

### Using Docker Compose

```bash
cd ~/attendance-system/backend

# Build and start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

This will start:
- MongoDB on port 27017
- Backend API on port 8000

## 📖 Usage Guide

### 1. Register a New User

1. Open `http://localhost:3000`
2. Click "Register here"
3. Fill in:
   - Full Name
   - Email
   - Password
   - Role (User/Admin)
4. Click "Register"

### 2. Login

1. Enter your email and password
2. Click "Login"
3. You'll be redirected to the dashboard

### 3. Register Your Face

**First-time users must register their face:**

1. Click "Register Face" in the navbar
2. Choose method:
   - **Webcam**: Capture 3-5 images from different angles
   - **Upload**: Select 1-5 images from your computer
3. Click "Register Face"
4. Wait for confirmation

**Tips for best results:**
- Ensure good lighting
- Look directly at the camera
- Remove glasses if possible
- Capture from different angles (front, slight left, slight right)
- Keep a neutral expression

### 4. Mark Attendance

1. Click "Mark Attendance" in the navbar
2. Choose method:
   - **Webcam**: Capture live image
   - **Upload**: Upload a photo
3. System will:
   - Detect your face
   - Match with registered encoding
   - Mark attendance if confidence > 50%
   - Show confidence score

**Note**: Attendance can only be marked once per day.

### 5. View Attendance History

1. Click "History" in the navbar
2. View your attendance records
3. Filter by date range
4. See confidence scores for each entry

### 6. Admin Features

**Admin users can:**

1. Click "Admin" in the navbar
2. View dashboard with:
   - Total users
   - Present/Absent counts
   - Attendance percentage
3. Select date to view attendance
4. Download CSV reports
5. View detailed attendance table

## 🧪 Testing the System

### Test Face Registration

```bash
# Using curl
curl -X POST "http://localhost:8000/api/face/register" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/your/photo.jpg"
```

### Test Attendance Marking

```bash
curl -X POST "http://localhost:8000/api/attendance/mark" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/your/photo.jpg"
```

### Test with Webcam

1. Allow browser camera permissions
2. Ensure good lighting
3. Position face in center of frame
4. Click capture button

## 📊 Database Schema

### Users Collection

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  role: String (admin/user),
  hashed_password: String,
  face_encoding: Array[128] (float),
  face_image_path: String,
  created_at: DateTime,
  updated_at: DateTime,
  is_active: Boolean
}
```

### Attendance Collection

```javascript
{
  _id: ObjectId,
  user_id: String,
  confidence: Float (0-1),
  timestamp: DateTime,
  date: Date,
  image_path: String
}
```

## 🔧 Configuration

### Face Recognition Settings

Edit `backend/config.py`:

```python
# Recognition tolerance (lower = stricter)
FACE_RECOGNITION_TOLERANCE = 0.6

# Minimum confidence threshold
MIN_CONFIDENCE_THRESHOLD = 0.5

# Maximum faces to detect per frame
MAX_FACES_PER_FRAME = 10

# Attendance cooldown (hours)
ATTENDANCE_COOLDOWN_HOURS = 8
```

### Performance Tuning

**For faster face detection:**
```python
# In face_recognition_utils.py
face_locations = face_recognition.face_locations(rgb_image, model="hog")
# Change to "cnn" for better accuracy (slower)
```

**For better accuracy:**
- Use multiple images during registration
- Ensure consistent lighting
- Use higher resolution images
- Adjust FACE_RECOGNITION_TOLERANCE

## 📈 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get token
- `GET /api/auth/me` - Get current user

### Face Registration
- `POST /api/face/register` - Register single face image
- `POST /api/face/register-multiple` - Register multiple images

### Attendance
- `POST /api/attendance/mark` - Mark attendance
- `POST /api/attendance/mark-multiple` - Mark multiple faces
- `GET /api/attendance/today` - Get today's attendance (Admin)
- `GET /api/attendance/date/{date}` - Get attendance by date (Admin)
- `GET /api/attendance/my-attendance` - Get user's attendance
- `GET /api/attendance/stats` - Get user statistics
- `GET /api/attendance/report/daily/{date}` - Daily report (Admin)

## 🔒 Security Best Practices

1. **Change default SECRET_KEY** in production
2. **Use HTTPS** in production
3. **Set strong passwords** for users
4. **Limit file upload sizes**
5. **Implement rate limiting**
6. **Regular database backups**
7. **Monitor failed login attempts**
8. **Use environment variables** for sensitive data

## 🚀 Performance Optimization

### Backend Optimization

1. **Use CNN model for better accuracy:**
```python
face_locations = face_recognition.face_locations(rgb_image, model="cnn")
```

2. **Reduce image size before processing:**
```python
small_frame = cv2.resize(frame, (0, 0), fx=0.25, fy=0.25)
```

3. **Cache face encodings in memory:**
```python
# Load all encodings at startup
encodings_cache = load_all_encodings()
```

4. **Use database indexes** (already configured)

### Frontend Optimization

1. **Lazy load components:**
```javascript
const AdminDashboard = lazy(() => import('./pages/AdminDashboard'));
```

2. **Optimize images before upload:**
```javascript
// Compress image before sending
const compressedImage = await compressImage(file);
```

3. **Implement pagination** for large datasets

## 🐛 Troubleshooting

### Common Issues

**1. dlib installation fails:**
```bash
# Install cmake first
sudo apt install cmake
pip install dlib
```

**2. MongoDB connection error:**
```bash
# Check if MongoDB is running
sudo systemctl status mongod

# Restart MongoDB
sudo systemctl restart mongod
```

**3. Webcam not working:**
- Check browser permissions
- Ensure camera is not used by another app
- Try different browser (Chrome recommended)

**4. Face not detected:**
- Improve lighting
- Move closer to camera
- Ensure face is clearly visible
- Check image quality

**5. Low confidence scores:**
- Re-register face with better images
- Use multiple images during registration
- Adjust FACE_RECOGNITION_TOLERANCE

### Logs

**Backend logs:**
```bash
# View application logs
tail -f backend/app.log

# View uvicorn logs
# Logs are printed to console
```

**MongoDB logs:**
```bash
sudo tail -f /var/log/mongodb/mongod.log
```

## 🔮 Future Improvements

1. **Advanced Liveness Detection**
   - 3D depth sensing
   - Challenge-response (smile, blink, turn head)
   - Infrared detection

2. **Enhanced AI Models**
   - Deep learning models (FaceNet, ArcFace)
   - Age and gender detection
   - Emotion recognition

3. **Additional Features**
   - Email notifications
   - SMS alerts
   - Mobile app (React Native)
   - Geolocation verification
   - QR code backup authentication

4. **Performance**
   - Redis caching
   - WebSocket real-time updates
   - GPU acceleration
   - Distributed processing

5. **Analytics**
   - Advanced reporting
   - Predictive analytics
   - Attendance trends
   - Export to Excel/PDF

6. **Integration**
   - LDAP/Active Directory
   - Slack/Teams notifications
   - Calendar integration
   - Payroll system integration

## 📝 License

This project is for educational purposes. Modify and use as needed.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For issues and questions:
- Check the troubleshooting section
- Review API documentation at `/docs`
- Check application logs

## 🎓 Credits

Built with:
- [FastAPI](https://fastapi.tiangolo.com/)
- [face_recognition](https://github.com/ageitgey/face_recognition)
- [OpenCV](https://opencv.org/)
- [React](https://react.dev/)
- [Material-UI](https://mui.com/)

---

**Note**: This system is designed for educational and small-scale production use. For large-scale deployments, consider additional security measures, load balancing, and infrastructure optimization.
# AI_FaceRecog_attSystm
