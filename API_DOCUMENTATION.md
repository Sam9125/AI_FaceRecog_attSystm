# API Documentation

## Base URL
```
http://localhost:8000
```

## Authentication
All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <your_token>
```

---

## Authentication Endpoints

### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "user"
}
```

**Response (201):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "has_face_registered": false,
  "created_at": "2024-01-15T10:30:00",
  "is_active": true
}
```

### Login
```http
POST /api/auth/login
Content-Type: application/x-www-form-urlencoded

username=john@example.com&password=password123
```

**Response (200):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "id": "507f1f77bcf86cd799439011",
  "name": "John Doe",
  "email": "john@example.com",
  "role": "user",
  "has_face_registered": true,
  "created_at": "2024-01-15T10:30:00",
  "is_active": true
}
```

---

## Face Registration Endpoints

### Register Face (Single Image)
```http
POST /api/face/register
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
```

**Response (200):**
```json
{
  "message": "Face registered successfully",
  "user_id": "507f1f77bcf86cd799439011",
  "face_image_path": "./uploads/faces/507f1f77bcf86cd799439011_20240115_103000.jpg"
}
```

### Register Face (Multiple Images)
```http
POST /api/face/register-multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data

files: <image_file_1>
files: <image_file_2>
files: <image_file_3>
```

**Response (200):**
```json
{
  "message": "Face registered successfully using 3 images",
  "user_id": "507f1f77bcf86cd799439011",
  "images_processed": 3,
  "saved_images": [
    "./uploads/faces/507f1f77bcf86cd799439011_20240115_103000_0.jpg",
    "./uploads/faces/507f1f77bcf86cd799439011_20240115_103000_1.jpg",
    "./uploads/faces/507f1f77bcf86cd799439011_20240115_103000_2.jpg"
  ]
}
```

---

## Attendance Endpoints

### Mark Attendance
```http
POST /api/attendance/mark
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <image_file>
```

**Response (200):**
```json
{
  "message": "Attendance marked successfully",
  "user_name": "John Doe",
  "confidence": 0.8523,
  "timestamp": "2024-01-15T10:30:00",
  "image_path": "./uploads/attendance/507f1f77bcf86cd799439011_20240115_103000.jpg"
}
```

### Mark Multiple Attendance
```http
POST /api/attendance/mark-multiple
Authorization: Bearer <token>
Content-Type: multipart/form-data

file: <group_image_file>
```

**Response (200):**
```json
{
  "message": "Attendance marked for 3 user(s)",
  "total_faces_detected": 5,
  "marked_users": [
    {
      "user_id": "507f1f77bcf86cd799439011",
      "name": "John Doe",
      "email": "john@example.com",
      "confidence": 0.8523
    }
  ],
  "image_path": "./uploads/attendance/group_20240115_103000.jpg"
}
```

### Get Today's Attendance (Admin)
```http
GET /api/attendance/today
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
[
  {
    "id": "507f1f77bcf86cd799439012",
    "user_id": "507f1f77bcf86cd799439011",
    "user_name": "John Doe",
    "user_email": "john@example.com",
    "timestamp": "2024-01-15T10:30:00",
    "date": "2024-01-15",
    "confidence": 0.8523,
    "image_path": "./uploads/attendance/..."
  }
]
```

### Get Attendance by Date (Admin)
```http
GET /api/attendance/date/2024-01-15
Authorization: Bearer <admin_token>
```

### Get My Attendance
```http
GET /api/attendance/my-attendance?start_date=2024-01-01&end_date=2024-01-31
Authorization: Bearer <token>
```

### Get My Statistics
```http
GET /api/attendance/stats?days=30
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "total_days": 30,
  "present_days": 22,
  "absent_days": 8,
  "attendance_percentage": 73.33,
  "recent_attendance": [
    {
      "date": "2024-01-15",
      "timestamp": "2024-01-15T10:30:00",
      "confidence": 0.8523
    }
  ]
}
```

### Get Daily Report (Admin)
```http
GET /api/attendance/report/daily/2024-01-15
Authorization: Bearer <admin_token>
```

**Response (200):**
```json
{
  "date": "2024-01-15",
  "total_users": 50,
  "present_count": 45,
  "absent_count": 5,
  "attendance_percentage": 90.0,
  "present_users": [...],
  "absent_users": [...]
}
```

---

## Error Responses

### 400 Bad Request
```json
{
  "detail": "No face detected in the image"
}
```

### 401 Unauthorized
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
```json
{
  "detail": "Admin access required"
}
```

### 404 Not Found
```json
{
  "detail": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limits
- Authentication: 5 requests per minute
- Face Registration: 10 requests per hour
- Attendance: 20 requests per hour
- Reports: 100 requests per hour

## Interactive Documentation
Visit `http://localhost:8000/docs` for Swagger UI documentation.
