# Project Structure

```
attendance-system/
│
├── backend/                          # Backend API (FastAPI)
│   ├── main.py                       # Application entry point
│   ├── config.py                     # Configuration settings
│   ├── database.py                   # MongoDB connection & setup
│   ├── requirements.txt              # Python dependencies
│   ├── Dockerfile                    # Docker configuration
│   ├── docker-compose.yml            # Docker Compose setup
│   ├── .env.example                  # Environment variables template
│   ├── .env                          # Environment variables (create this)
│   │
│   ├── models/                       # Data models (Pydantic)
│   │   ├── __init__.py
│   │   ├── user.py                   # User model & schemas
│   │   └── attendance.py             # Attendance model & schemas
│   │
│   ├── routes/                       # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py                   # Authentication routes
│   │   ├── face_registration.py     # Face registration routes
│   │   └── attendance.py             # Attendance routes
│   │
│   ├── services/                     # Business logic
│   │   ├── __init__.py
│   │   ├── user_service.py           # User management
│   │   └── attendance_service.py     # Attendance management
│   │
│   ├── utils/                        # Utility functions
│   │   ├── __init__.py
│   │   ├── security.py               # JWT & password hashing
│   │   └── face_recognition_utils.py # Face detection & recognition
│   │
│   └── uploads/                      # Uploaded files (auto-created)
│       ├── faces/                    # Registered face images
│       └── attendance/               # Attendance images
│
├── frontend/                         # Frontend (React + Vite)
│   ├── index.html                    # HTML entry point
│   ├── package.json                  # Node dependencies
│   ├── vite.config.js                # Vite configuration
│   │
│   └── src/
│       ├── main.jsx                  # React entry point
│       ├── App.jsx                   # Main App component
│       ├── index.css                 # Global styles
│       │
│       ├── components/               # Reusable components
│       │   └── Navbar.jsx            # Navigation bar
│       │
│       ├── pages/                    # Page components
│       │   ├── Login.jsx             # Login page
│       │   ├── Register.jsx          # Registration page
│       │   ├── Dashboard.jsx         # User dashboard
│       │   ├── FaceRegistration.jsx  # Face registration page
│       │   ├── MarkAttendance.jsx    # Attendance marking page
│       │   ├── AttendanceHistory.jsx # Attendance history page
│       │   └── AdminDashboard.jsx    # Admin dashboard
│       │
│       └── services/                 # API services
│           └── api.js                # Axios API client
│
├── README.md                         # Main documentation
├── SETUP_GUIDE.md                    # Quick setup instructions
├── TESTING_GUIDE.md                  # Testing procedures
├── API_DOCUMENTATION.md              # API reference
├── DEPLOYMENT.md                     # Production deployment guide
├── PROJECT_STRUCTURE.md              # This file
└── .gitignore                        # Git ignore rules
```

## 📁 Directory Descriptions

### Backend Structure

#### `/backend/models/`
Contains Pydantic models for data validation and serialization:
- `user.py`: User registration, authentication, and profile models
- `attendance.py`: Attendance records, statistics, and reports

#### `/backend/routes/`
API endpoint definitions organized by feature:
- `auth.py`: Login, register, get current user
- `face_registration.py`: Single/multiple face registration
- `attendance.py`: Mark attendance, view records, generate reports

#### `/backend/services/`
Business logic layer separating concerns:
- `user_service.py`: User CRUD operations, authentication
- `attendance_service.py`: Attendance marking, statistics, reports

#### `/backend/utils/`
Helper functions and utilities:
- `security.py`: JWT tokens, password hashing
- `face_recognition_utils.py`: Face detection, encoding, comparison

### Frontend Structure

#### `/frontend/src/pages/`
Full-page components for routing:
- `Login.jsx`: User authentication
- `Register.jsx`: New user registration
- `Dashboard.jsx`: User statistics and overview
- `FaceRegistration.jsx`: Webcam/upload face registration
- `MarkAttendance.jsx`: Webcam/upload attendance marking
- `AttendanceHistory.jsx`: Personal attendance records
- `AdminDashboard.jsx`: Admin panel with reports

#### `/frontend/src/components/`
Reusable UI components:
- `Navbar.jsx`: Navigation with role-based menu items

#### `/frontend/src/services/`
API integration layer:
- `api.js`: Axios client with authentication interceptors

## 🔄 Data Flow

### Face Registration Flow
```
User → FaceRegistration.jsx → api.js → /api/face/register
→ face_registration.py → FaceRecognitionService → user_service.py
→ MongoDB (users collection)
```

### Attendance Marking Flow
```
User → MarkAttendance.jsx → api.js → /api/attendance/mark
→ attendance.py → FaceRecognitionService → attendance_service.py
→ MongoDB (attendance collection)
```

### Authentication Flow
```
User → Login.jsx → api.js → /api/auth/login
→ auth.py → user_service.py → JWT Token
→ Stored in localStorage → Used in all API requests
```

## 🗄️ Database Collections

### users
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (indexed, unique),
  role: String (indexed),
  hashed_password: String,
  face_encoding: Array[128],
  face_image_path: String,
  created_at: DateTime,
  updated_at: DateTime,
  is_active: Boolean
}
```

### attendance
```javascript
{
  _id: ObjectId,
  user_id: String (indexed),
  confidence: Float,
  timestamp: DateTime (indexed),
  date: Date (indexed),
  image_path: String
}
```

## 🔐 Security Layers

1. **JWT Authentication**: All protected routes require valid token
2. **Password Hashing**: bcrypt with salt
3. **Role-Based Access**: Admin vs User permissions
4. **CORS Protection**: Configured allowed origins
5. **Input Validation**: Pydantic models validate all inputs

## 📦 Key Dependencies

### Backend
- `fastapi`: Web framework
- `uvicorn`: ASGI server
- `face_recognition`: Face detection/recognition
- `opencv-python`: Image processing
- `pymongo`: MongoDB driver
- `python-jose`: JWT handling
- `passlib`: Password hashing

### Frontend
- `react`: UI library
- `@mui/material`: Component library
- `axios`: HTTP client
- `react-webcam`: Camera integration
- `recharts`: Data visualization
- `react-router-dom`: Routing

## 🚀 Execution Flow

### Backend Startup
```
main.py
├── Load config.py settings
├── Connect to MongoDB (database.py)
├── Create indexes
├── Include routers (auth, face, attendance)
├── Setup CORS middleware
└── Start uvicorn server on :8000
```

### Frontend Startup
```
main.jsx
├── Load App.jsx
├── Check authentication (localStorage token)
├── Setup React Router
├── Apply MUI theme
└── Render appropriate page based on auth state
```

## 📊 File Sizes (Approximate)

```
Backend:
- main.py: ~100 lines
- config.py: ~50 lines
- database.py: ~80 lines
- models/*.py: ~100 lines each
- routes/*.py: ~150-300 lines each
- services/*.py: ~200 lines each
- utils/*.py: ~150-200 lines each

Frontend:
- App.jsx: ~80 lines
- pages/*.jsx: ~150-250 lines each
- components/*.jsx: ~50-100 lines each
- services/api.js: ~100 lines
```

## 🔧 Configuration Files

- `.env`: Environment variables (SECRET_KEY, MONGODB_URL, etc.)
- `requirements.txt`: Python packages
- `package.json`: Node packages
- `vite.config.js`: Vite build configuration
- `docker-compose.yml`: Docker services
- `Dockerfile`: Backend container image

---

This structure follows best practices for:
- Separation of concerns
- Modularity
- Scalability
- Maintainability
- Security
