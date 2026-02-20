# System Architecture

## 🏗️ High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         Client Layer                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Browser    │  │   Webcam     │  │  Mobile App  │      │
│  │  (React UI)  │  │  Integration │  │  (Future)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTPS/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Application Layer                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              FastAPI Backend Server                   │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   Auth     │  │    Face    │  │ Attendance │     │   │
│  │  │  Routes    │  │   Routes   │  │   Routes   │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │   User     │  │ Attendance │  │    Face    │     │   │
│  │  │  Service   │  │  Service   │  │  Recognition│     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ MongoDB Driver
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                       Data Layer                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │                  MongoDB Database                     │   │
│  │  ┌────────────┐              ┌────────────┐          │   │
│  │  │   Users    │              │ Attendance │          │   │
│  │  │ Collection │              │ Collection │          │   │
│  │  └────────────┘              └────────────┘          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ File System
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      Storage Layer                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              File Storage (uploads/)                  │   │
│  │  ┌────────────┐              ┌────────────┐          │   │
│  │  │   Faces    │              │ Attendance │          │   │
│  │  │   Images   │              │   Images   │          │   │
│  │  └────────────┘              └────────────┘          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Request Flow

### 1. User Registration Flow
```
User → Register Form → POST /api/auth/register
  → Validate Input (Pydantic)
  → Hash Password (bcrypt)
  → Save to MongoDB
  → Return User Data
```

### 2. Face Registration Flow
```
User → Upload Image → POST /api/face/register
  → Verify JWT Token
  → Decode Image (OpenCV)
  → Detect Face (face_recognition)
  → Generate Encoding (128-dim vector)
  → Save Image to uploads/faces/
  → Update User in MongoDB
  → Return Success
```

### 3. Attendance Marking Flow
```
User → Capture/Upload Image → POST /api/attendance/mark
  → Verify JWT Token
  → Check if Already Marked Today
  → Decode Image
  → Detect Face
  → Generate Encoding
  → Compare with Stored Encoding
  → Calculate Confidence Score
  → If Match & Confidence > Threshold:
      → Save Annotated Image
      → Create Attendance Record
      → Return Success
  → Else:
      → Return Error
```

### 4. Admin Report Flow
```
Admin → Select Date → GET /api/attendance/report/daily/{date}
  → Verify JWT Token
  → Check Admin Role
  → Query Attendance Collection
  → Query Users Collection
  → Calculate Statistics
  → Return Report Data
```

## 🧩 Component Architecture

### Backend Components

```
main.py (Entry Point)
    │
    ├── config.py (Settings)
    │
    ├── database.py (MongoDB Connection)
    │
    ├── routes/
    │   ├── auth.py (Authentication Endpoints)
    │   ├── face_registration.py (Face Registration)
    │   └── attendance.py (Attendance Management)
    │
    ├── services/
    │   ├── user_service.py (User CRUD)
    │   └── attendance_service.py (Attendance Logic)
    │
    ├── utils/
    │   ├── security.py (JWT, Password Hashing)
    │   └── face_recognition_utils.py (AI/ML)
    │
    └── models/
        ├── user.py (User Schemas)
        └── attendance.py (Attendance Schemas)
```

### Frontend Components

```
App.jsx (Root Component)
    │
    ├── Router (React Router)
    │
    ├── Theme Provider (Material-UI)
    │
    ├── pages/
    │   ├── Login.jsx
    │   ├── Register.jsx
    │   ├── Dashboard.jsx
    │   ├── FaceRegistration.jsx
    │   ├── MarkAttendance.jsx
    │   ├── AttendanceHistory.jsx
    │   └── AdminDashboard.jsx
    │
    ├── components/
    │   └── Navbar.jsx
    │
    └── services/
        └── api.js (Axios Client)
```

## 🔐 Security Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Security Layers                         │
│                                                               │
│  Layer 1: Network Security                                   │
│  ├── HTTPS/TLS Encryption                                    │
│  ├── CORS Protection                                         │
│  └── Firewall Rules                                          │
│                                                               │
│  Layer 2: Authentication                                     │
│  ├── JWT Tokens                                              │
│  ├── Password Hashing (bcrypt)                               │
│  └── Token Expiration                                        │
│                                                               │
│  Layer 3: Authorization                                      │
│  ├── Role-Based Access Control                               │
│  ├── Protected Routes                                        │
│  └── Admin-Only Endpoints                                    │
│                                                               │
│  Layer 4: Input Validation                                   │
│  ├── Pydantic Models                                         │
│  ├── Type Checking                                           │
│  └── Sanitization                                            │
│                                                               │
│  Layer 5: Data Security                                      │
│  ├── Encrypted Face Encodings                                │
│  ├── Secure File Storage                                     │
│  └── Database Access Control                                 │
└─────────────────────────────────────────────────────────────┘
```

## 🤖 AI/ML Pipeline

```
┌─────────────────────────────────────────────────────────────┐
│                    Face Recognition Pipeline                 │
│                                                               │
│  Step 1: Image Acquisition                                   │
│  ├── Webcam Capture / File Upload                            │
│  └── Image Format: JPEG/PNG                                  │
│                                                               │
│  Step 2: Preprocessing                                       │
│  ├── Convert to RGB (OpenCV)                                 │
│  ├── Resize if needed                                        │
│  └── Normalize pixel values                                  │
│                                                               │
│  Step 3: Face Detection                                      │
│  ├── HOG (Histogram of Oriented Gradients)                   │
│  │   └── Fast, 90-95% accuracy                               │
│  └── CNN (Convolutional Neural Network)                      │
│      └── Slower, 95-99% accuracy                             │
│                                                               │
│  Step 4: Face Alignment                                      │
│  ├── Detect facial landmarks                                 │
│  └── Align face to standard position                         │
│                                                               │
│  Step 5: Face Encoding                                       │
│  ├── Deep Learning Model (ResNet)                            │
│  ├── Generate 128-dimensional vector                         │
│  └── Unique representation of face                           │
│                                                               │
│  Step 6: Face Comparison                                     │
│  ├── Calculate Euclidean distance                            │
│  ├── Compare with stored encodings                           │
│  ├── Apply tolerance threshold                               │
│  └── Return match result + confidence                        │
│                                                               │
│  Step 7: Liveness Detection (Optional)                       │
│  ├── Eye blink detection                                     │
│  ├── Head movement detection                                 │
│  └── Anti-spoofing measures                                  │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Data Flow Diagram

```
┌──────────┐
│  User    │
└────┬─────┘
     │
     │ 1. Register Account
     ▼
┌──────────────┐
│   Backend    │──────► MongoDB (Save User)
└──────────────┘
     │
     │ 2. Register Face
     ▼
┌──────────────┐
│ Face Service │──────► Generate Encoding
└──────────────┘
     │
     ├──────► Save Image (File System)
     └──────► Update User (MongoDB)
     │
     │ 3. Mark Attendance
     ▼
┌──────────────┐
│ Face Service │──────► Detect & Encode Face
└──────────────┘
     │
     ├──────► Compare Encodings
     │
     ▼
┌──────────────┐
│  Attendance  │──────► Create Record (MongoDB)
│   Service    │
└──────────────┘
     │
     │ 4. View Reports
     ▼
┌──────────────┐
│   Backend    │──────► Query MongoDB
└──────────────┘
     │
     ▼
┌──────────┐
│  Admin   │
└──────────┘
```

## 🔄 State Management (Frontend)

```
┌─────────────────────────────────────────────────────────────┐
│                    React State Flow                          │
│                                                               │
│  App.jsx (Root State)                                        │
│  ├── user: User object or null                               │
│  ├── token: JWT token                                        │
│  └── loading: Boolean                                        │
│                                                               │
│  Component State (Local)                                     │
│  ├── formData: Form inputs                                   │
│  ├── error: Error messages                                   │
│  ├── loading: Loading states                                 │
│  └── data: Component-specific data                           │
│                                                               │
│  API State (Axios)                                           │
│  ├── Request interceptor: Add token                          │
│  ├── Response interceptor: Handle errors                     │
│  └── Error handling: Show notifications                      │
│                                                               │
│  LocalStorage                                                │
│  └── token: Persisted JWT token                              │
└─────────────────────────────────────────────────────────────┘
```

## 🚀 Deployment Architecture

### Development
```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Frontend   │     │   Backend    │     │   MongoDB    │
│  localhost   │────▶│  localhost   │────▶│  localhost   │
│    :3000     │     │    :8000     │     │    :27017    │
└──────────────┘     └──────────────┘     └──────────────┘
```

### Production (Single Server)
```
┌─────────────────────────────────────────────────────────────┐
│                      Production Server                       │
│                                                               │
│  ┌──────────┐                                                │
│  │  Nginx   │ (Port 80/443)                                  │
│  │  Reverse │                                                │
│  │  Proxy   │                                                │
│  └────┬─────┘                                                │
│       │                                                       │
│       ├──────► Static Files (React Build)                    │
│       │                                                       │
│       └──────► /api/* ──► FastAPI (Port 8000)                │
│                              │                                │
│                              ▼                                │
│                         MongoDB (Port 27017)                  │
└─────────────────────────────────────────────────────────────┘
```

### Production (Scaled)
```
┌──────────────┐
│ Load Balancer│
└──────┬───────┘
       │
       ├──────► Server 1 (Backend + MongoDB Replica)
       │
       ├──────► Server 2 (Backend + MongoDB Replica)
       │
       └──────► Server 3 (Backend + MongoDB Replica)
```

## 📈 Performance Considerations

### Bottlenecks
1. **Face Detection**: 200-500ms per image
2. **Face Encoding**: 500-1000ms per image
3. **Database Queries**: 10-100ms
4. **Image Upload**: Depends on size/network

### Optimization Strategies
1. **Caching**: Store encodings in memory
2. **Indexing**: Database indexes on frequently queried fields
3. **Compression**: Reduce image sizes
4. **Async Processing**: Use background tasks
5. **Load Balancing**: Distribute requests across servers

## 🔧 Technology Stack Details

### Backend Stack
```
FastAPI (Web Framework)
    ├── Uvicorn (ASGI Server)
    ├── Pydantic (Data Validation)
    ├── python-jose (JWT)
    ├── passlib (Password Hashing)
    └── pymongo (MongoDB Driver)

Face Recognition
    ├── face_recognition (High-level API)
    ├── dlib (ML Toolkit)
    ├── OpenCV (Image Processing)
    └── NumPy (Numerical Computing)
```

### Frontend Stack
```
React 18
    ├── React Router (Navigation)
    ├── Material-UI (Components)
    ├── Axios (HTTP Client)
    ├── react-webcam (Camera)
    └── Recharts (Visualization)

Build Tools
    ├── Vite (Build Tool)
    ├── ESLint (Linting)
    └── Babel (Transpilation)
```

---

This architecture is designed for:
- **Scalability**: Easy to add more servers
- **Maintainability**: Clear separation of concerns
- **Security**: Multiple security layers
- **Performance**: Optimized for speed
- **Reliability**: Fault-tolerant design
