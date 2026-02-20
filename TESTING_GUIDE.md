# Testing Guide - AI Face Recognition Attendance System

## 🧪 Complete Testing Workflow

### Prerequisites
- System is running (backend on :8000, frontend on :3000)
- MongoDB is active
- Webcam is available (or test images ready)

## 1️⃣ User Registration Testing

### Test Case 1.1: Register New User
```bash
# Using curl
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "user"
  }'

# Expected Response:
# {
#   "id": "...",
#   "name": "John Doe",
#   "email": "john@example.com",
#   "role": "user",
#   "has_face_registered": false,
#   "created_at": "...",
#   "is_active": true
# }
```

### Test Case 1.2: Register Admin User
```bash
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Admin User",
    "email": "admin@example.com",
    "password": "admin123",
    "role": "admin"
  }'
```

### Test Case 1.3: Duplicate Email (Should Fail)
```bash
# Try registering with same email
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "john@example.com",
    "password": "password456",
    "role": "user"
  }'

# Expected: 400 Bad Request
# "User with this email already exists"
```

## 2️⃣ Authentication Testing

### Test Case 2.1: Login
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=john@example.com&password=password123"

# Expected Response:
# {
#   "access_token": "eyJ...",
#   "token_type": "bearer"
# }

# Save the token for next tests
export TOKEN="your_access_token_here"
```

### Test Case 2.2: Get Current User
```bash
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer $TOKEN"

# Expected: User details
```

### Test Case 2.3: Invalid Credentials (Should Fail)
```bash
curl -X POST "http://localhost:8000/api/auth/login" \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=john@example.com&password=wrongpassword"

# Expected: 401 Unauthorized
```

## 3️⃣ Face Registration Testing

### Test Case 3.1: Register Face with Single Image
```bash
# Prepare a test image (photo of a person)
curl -X POST "http://localhost:8000/api/face/register" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/test_face.jpg"

# Expected Response:
# {
#   "message": "Face registered successfully",
#   "user_id": "...",
#   "face_image_path": "..."
# }
```

### Test Case 3.2: Register Face with Multiple Images
```bash
curl -X POST "http://localhost:8000/api/face/register-multiple" \
  -H "Authorization: Bearer $TOKEN" \
  -F "files=@/path/to/face1.jpg" \
  -F "files=@/path/to/face2.jpg" \
  -F "files=@/path/to/face3.jpg"

# Expected Response:
# {
#   "message": "Face registered successfully using 3 images",
#   "user_id": "...",
#   "images_processed": 3,
#   "saved_images": [...]
# }
```

### Test Case 3.3: No Face in Image (Should Fail)
```bash
# Upload image without a face (e.g., landscape photo)
curl -X POST "http://localhost:8000/api/face/register" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/no_face.jpg"

# Expected: 400 Bad Request
# "No face detected in the image"
```

### Test Case 3.4: Multiple Faces in Image (Should Fail)
```bash
# Upload image with multiple people
curl -X POST "http://localhost:8000/api/face/register" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/group_photo.jpg"

# Expected: 400 Bad Request
# "Multiple faces detected"
```

## 4️⃣ Attendance Marking Testing

### Test Case 4.1: Mark Attendance Successfully
```bash
# Use same person's photo as registered
curl -X POST "http://localhost:8000/api/attendance/mark" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/same_person.jpg"

# Expected Response:
# {
#   "message": "Attendance marked successfully",
#   "user_name": "John Doe",
#   "confidence": 0.85,
#   "timestamp": "...",
#   "image_path": "..."
# }
```

### Test Case 4.2: Duplicate Attendance (Should Fail)
```bash
# Try marking attendance again on same day
curl -X POST "http://localhost:8000/api/attendance/mark" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/same_person.jpg"

# Expected: 400 Bad Request
# "Attendance already marked for today"
```

### Test Case 4.3: Wrong Person (Should Fail)
```bash
# Upload different person's photo
curl -X POST "http://localhost:8000/api/attendance/mark" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/different_person.jpg"

# Expected: 401 Unauthorized
# "Face does not match"
```

### Test Case 4.4: Mark Multiple Attendance (Admin)
```bash
# Upload group photo with multiple registered faces
curl -X POST "http://localhost:8000/api/attendance/mark-multiple" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/group_photo.jpg"

# Expected Response:
# {
#   "message": "Attendance marked for 3 user(s)",
#   "total_faces_detected": 5,
#   "marked_users": [...],
#   "image_path": "..."
# }
```

## 5️⃣ Attendance Retrieval Testing

### Test Case 5.1: Get My Attendance
```bash
curl -X GET "http://localhost:8000/api/attendance/my-attendance" \
  -H "Authorization: Bearer $TOKEN"

# Expected: Array of attendance records
```

### Test Case 5.2: Get Attendance with Date Filter
```bash
curl -X GET "http://localhost:8000/api/attendance/my-attendance?start_date=2024-01-01&end_date=2024-12-31" \
  -H "Authorization: Bearer $TOKEN"
```

### Test Case 5.3: Get My Statistics
```bash
curl -X GET "http://localhost:8000/api/attendance/stats?days=30" \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# {
#   "total_days": 30,
#   "present_days": 15,
#   "absent_days": 15,
#   "attendance_percentage": 50.0,
#   "recent_attendance": [...]
# }
```

### Test Case 5.4: Get Today's Attendance (Admin Only)
```bash
# Login as admin first
export ADMIN_TOKEN="admin_access_token"

curl -X GET "http://localhost:8000/api/attendance/today" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected: Array of all attendance records for today
```

### Test Case 5.5: Get Attendance by Date (Admin Only)
```bash
curl -X GET "http://localhost:8000/api/attendance/date/2024-01-15" \
  -H "Authorization: Bearer $ADMIN_TOKEN"
```

### Test Case 5.6: Get Daily Report (Admin Only)
```bash
curl -X GET "http://localhost:8000/api/attendance/report/daily/2024-01-15" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Expected Response:
# {
#   "date": "2024-01-15",
#   "total_users": 50,
#   "present_count": 45,
#   "absent_count": 5,
#   "attendance_percentage": 90.0,
#   "present_users": [...],
#   "absent_users": [...]
# }
```

## 6️⃣ Frontend Testing (Manual)

### Test Case 6.1: User Registration Flow
1. Open `http://localhost:3000`
2. Click "Register here"
3. Fill form with valid data
4. Click "Register"
5. Verify redirect to login page
6. Verify success message

### Test Case 6.2: Login Flow
1. Enter registered email and password
2. Click "Login"
3. Verify redirect to dashboard
4. Verify user name displayed in navbar

### Test Case 6.3: Face Registration with Webcam
1. Click "Register Face" in navbar
2. Click "Use Webcam"
3. Allow camera permissions
4. Click "Capture Image" 3 times
5. Verify 3 images captured
6. Click "Register Face"
7. Verify success message
8. Verify page reload

### Test Case 6.4: Face Registration with Upload
1. Click "Register Face"
2. Click "Upload Images"
3. Select 3-5 images
4. Verify success message

### Test Case 6.5: Mark Attendance with Webcam
1. Click "Mark Attendance"
2. Click "Use Webcam"
3. Position face in frame
4. Click "Capture & Mark Attendance"
5. Verify success message with confidence score
6. Verify attendance marked

### Test Case 6.6: View Dashboard
1. Navigate to Dashboard
2. Verify statistics cards display:
   - Days Present
   - Days Absent
   - Attendance Rate
3. Verify pie chart displays
4. Verify recent attendance list

### Test Case 6.7: View Attendance History
1. Click "History" in navbar
2. Verify attendance table displays
3. Select date range
4. Verify filtered results
5. Verify all columns display correctly

### Test Case 6.8: Admin Dashboard
1. Login as admin
2. Click "Admin" in navbar
3. Verify statistics cards
4. Select different dates
5. Verify attendance table updates
6. Click "Download CSV"
7. Verify CSV file downloads

## 7️⃣ Performance Testing

### Test Case 7.1: Face Detection Speed
```python
# Create test script: test_performance.py
import time
import cv2
from utils.face_recognition_utils import FaceRecognitionService

face_service = FaceRecognitionService()
image = cv2.imread('test_image.jpg')

start = time.time()
faces = face_service.detect_faces(image)
end = time.time()

print(f"Detection time: {end - start:.3f} seconds")
print(f"Faces detected: {len(faces)}")
```

### Test Case 7.2: Face Encoding Speed
```python
start = time.time()
encoding = face_service.encode_face(image)
end = time.time()

print(f"Encoding time: {end - start:.3f} seconds")
```

### Test Case 7.3: Face Comparison Speed
```python
# Compare 100 faces
import numpy as np

known_encoding = np.random.rand(128).tolist()
test_encoding = np.random.rand(128).tolist()

start = time.time()
for _ in range(100):
    is_match, confidence = face_service.compare_faces(known_encoding, test_encoding)
end = time.time()

print(f"100 comparisons: {end - start:.3f} seconds")
print(f"Average: {(end - start) / 100 * 1000:.2f} ms per comparison")
```

## 8️⃣ Security Testing

### Test Case 8.1: Access Without Token (Should Fail)
```bash
curl -X GET "http://localhost:8000/api/attendance/my-attendance"

# Expected: 401 Unauthorized
```

### Test Case 8.2: Access Admin Endpoint as User (Should Fail)
```bash
# Login as regular user
curl -X GET "http://localhost:8000/api/attendance/today" \
  -H "Authorization: Bearer $USER_TOKEN"

# Expected: 403 Forbidden
```

### Test Case 8.3: Invalid Token (Should Fail)
```bash
curl -X GET "http://localhost:8000/api/auth/me" \
  -H "Authorization: Bearer invalid_token"

# Expected: 401 Unauthorized
```

## 9️⃣ Edge Cases Testing

### Test Case 9.1: Very Large Image
```bash
# Upload 10MB+ image
curl -X POST "http://localhost:8000/api/face/register" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/large_image.jpg"

# Should process or return appropriate error
```

### Test Case 9.2: Corrupted Image
```bash
# Upload corrupted file
curl -X POST "http://localhost:8000/api/face/register" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/corrupted.jpg"

# Expected: 400 Bad Request
# "Invalid image file"
```

### Test Case 9.3: Non-Image File
```bash
# Upload PDF or text file
curl -X POST "http://localhost:8000/api/face/register" \
  -H "Authorization: Bearer $TOKEN" \
  -F "file=@/path/to/document.pdf"

# Expected: 400 Bad Request
```

## 🔟 Load Testing (Optional)

### Using Apache Bench
```bash
# Install Apache Bench
sudo apt install apache2-utils

# Test login endpoint
ab -n 100 -c 10 -p login_data.txt -T application/x-www-form-urlencoded \
  http://localhost:8000/api/auth/login

# Test health endpoint
ab -n 1000 -c 50 http://localhost:8000/health
```

### Using Python Script
```python
# load_test.py
import concurrent.futures
import requests
import time

def test_endpoint():
    response = requests.get('http://localhost:8000/health')
    return response.status_code == 200

start = time.time()
with concurrent.futures.ThreadPoolExecutor(max_workers=50) as executor:
    futures = [executor.submit(test_endpoint) for _ in range(1000)]
    results = [f.result() for f in concurrent.futures.as_completed(futures)]
end = time.time()

print(f"Total time: {end - start:.2f} seconds")
print(f"Requests per second: {1000 / (end - start):.2f}")
print(f"Success rate: {sum(results) / len(results) * 100:.1f}%")
```

## ✅ Test Checklist

- [ ] User registration works
- [ ] Login authentication works
- [ ] Face registration with single image works
- [ ] Face registration with multiple images works
- [ ] Attendance marking works
- [ ] Duplicate attendance prevention works
- [ ] Face mismatch detection works
- [ ] Admin dashboard accessible
- [ ] CSV export works
- [ ] Date filtering works
- [ ] Statistics calculation correct
- [ ] Webcam integration works
- [ ] Image upload works
- [ ] Security tokens work
- [ ] Role-based access works
- [ ] Error messages are clear
- [ ] Performance is acceptable

## 📊 Expected Performance Benchmarks

- Face detection: < 500ms
- Face encoding: < 1000ms
- Face comparison: < 50ms
- API response time: < 200ms
- Database query: < 100ms
- Frontend load time: < 2s

## 🐛 Common Test Failures

1. **Face not detected**: Improve image quality, lighting
2. **Low confidence**: Re-register with better images
3. **Slow performance**: Reduce image size, use HOG model
4. **Database errors**: Check MongoDB connection
5. **Token expired**: Re-login to get new token

---

**Testing Complete!** If all tests pass, your system is production-ready! 🎉
