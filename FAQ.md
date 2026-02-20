# Frequently Asked Questions (FAQ)

## General Questions

### Q: What is this system?
A: This is a production-level AI-powered attendance system that uses facial recognition to automatically mark attendance. It's built with FastAPI (backend), React (frontend), and MongoDB (database).

### Q: Who can use this system?
A: Anyone can use it! It's designed for:
- Schools and universities
- Corporate offices
- Training centers
- Events and conferences
- Any organization needing automated attendance tracking

### Q: Is it free?
A: Yes, the codebase is free to use. You only need to pay for hosting/infrastructure if deploying to cloud services.

### Q: What are the system requirements?
A: 
- **OS**: Ubuntu 20.04+ (or any Linux distribution)
- **RAM**: Minimum 4GB (8GB recommended)
- **CPU**: 2+ cores
- **Storage**: 10GB+ free space
- **Webcam**: For real-time attendance marking
- **Browser**: Chrome, Firefox, or Safari (latest versions)

## Installation & Setup

### Q: How long does installation take?
A: Approximately 15-30 minutes for a fresh Ubuntu installation, depending on your internet speed.

### Q: Do I need programming knowledge?
A: Basic command-line knowledge is helpful, but the setup guide is beginner-friendly with step-by-step instructions.

### Q: Can I run this on Windows?
A: Yes, but it's optimized for Linux. On Windows, you can:
- Use WSL2 (Windows Subsystem for Linux)
- Use Docker Desktop
- Install dependencies manually

### Q: Can I run this on macOS?
A: Yes! The setup is similar to Linux. Install Homebrew first, then follow the Linux instructions.

### Q: Why is dlib installation failing?
A: dlib requires cmake and build tools. Install them first:
```bash
sudo apt install build-essential cmake
pip install dlib
```

## Face Recognition

### Q: How accurate is the face recognition?
A: Accuracy depends on several factors:
- **Good conditions**: 95-99% accuracy
- **Poor lighting**: 70-85% accuracy
- **Multiple angles during registration**: Higher accuracy
- **Single image registration**: Lower accuracy

### Q: How many images should I register?
A: We recommend 3-5 images from different angles for best results.

### Q: Can it recognize faces with masks?
A: Partially. The system can detect faces with masks, but accuracy is reduced. For best results, register both with and without masks.

### Q: Can it recognize faces with glasses?
A: Yes, but for best results:
- Register with glasses if you always wear them
- Register without glasses if you don't wear them regularly
- Register both if you alternate

### Q: What if someone looks different (haircut, beard, etc.)?
A: Minor changes are usually fine. For major changes, re-register your face.

### Q: Can someone use my photo to mark attendance?
A: Basic liveness detection is included, but for high-security needs, consider:
- Implementing advanced liveness detection
- Requiring blink detection
- Using 3D depth sensing
- Adding geolocation verification

### Q: How is face data stored?
A: Face encodings (128-dimensional vectors) are stored in MongoDB. Original images are saved in the uploads folder. Data is not shared with third parties.

## Attendance

### Q: Can I mark attendance multiple times per day?
A: No, by default attendance can only be marked once per day. This is configurable in `config.py`:
```python
ATTENDANCE_COOLDOWN_HOURS = 8  # Change this value
```

### Q: What if I forget to mark attendance?
A: Contact your admin. Admins can manually add attendance records through the database.

### Q: Can I mark attendance for someone else?
A: No, the system matches your face with your registered encoding. Attempting to use someone else's photo will fail.

### Q: What happens if face recognition fails?
A: The system will show an error message. Try:
- Improving lighting
- Moving closer to camera
- Removing obstructions
- Re-capturing the image

### Q: Can multiple people mark attendance at once?
A: Yes! Use the "Mark Multiple Attendance" feature (admin only) to upload a group photo.

## Admin Features

### Q: How do I create an admin account?
A: During registration, select "admin" as the role. The first user should be an admin.

### Q: Can I change a user's role?
A: Yes, update directly in MongoDB:
```javascript
db.users.updateOne(
  {email: "user@example.com"},
  {$set: {role: "admin"}}
)
```

### Q: How do I generate reports?
A: Admins can:
- View daily reports in the admin dashboard
- Download CSV files
- Filter by date range
- View statistics

### Q: Can I delete attendance records?
A: Yes, through MongoDB:
```javascript
db.attendance.deleteOne({_id: ObjectId("...")})
```

### Q: How do I export data?
A: Use the CSV download feature in the admin dashboard, or export from MongoDB:
```bash
mongoexport --db attendance_system --collection attendance --out attendance.json
```

## Performance

### Q: How fast is face recognition?
A: Typical processing times:
- Face detection: 200-500ms
- Face encoding: 500-1000ms
- Face comparison: 10-50ms
- Total: 1-2 seconds per image

### Q: Can it handle many users?
A: Yes! The system is designed to scale:
- 100 users: No issues
- 1000 users: May need optimization
- 10000+ users: Consider caching and load balancing

### Q: How do I improve performance?
A:
1. Use HOG model instead of CNN (faster, less accurate)
2. Reduce image size before processing
3. Cache face encodings in memory
4. Use database indexes (already configured)
5. Deploy with multiple workers

### Q: Why is it slow?
A: Common causes:
- Large images (resize before upload)
- CNN model (switch to HOG)
- Slow database connection
- Limited CPU/RAM
- Many concurrent users

## Security

### Q: Is my data secure?
A: Yes, the system includes:
- Password hashing with bcrypt
- JWT token authentication
- Role-based access control
- CORS protection
- Input validation

### Q: Should I use HTTPS?
A: Absolutely! In production, always use HTTPS to encrypt data in transit.

### Q: How do I change my password?
A: Currently, password reset is not implemented. You can update it in MongoDB:
```python
from passlib.context import CryptContext
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
new_hash = pwd_context.hash("new_password")
# Update in MongoDB
```

### Q: Can I enable two-factor authentication?
A: Not currently implemented, but it's on the roadmap.

### Q: How long do tokens last?
A: Default is 30 minutes. Configure in `.env`:
```
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

## Deployment

### Q: Can I deploy to cloud?
A: Yes! Supported platforms:
- AWS EC2
- Google Cloud Platform
- Microsoft Azure
- DigitalOcean
- Heroku
- Any VPS provider

### Q: Do I need a domain name?
A: Not required for testing, but recommended for production.

### Q: How do I setup SSL?
A: Use Let's Encrypt (free):
```bash
sudo certbot --nginx -d your-domain.com
```

### Q: Can I use Docker?
A: Yes! Docker Compose configuration is included:
```bash
docker-compose up -d
```

### Q: How do I backup data?
A: Backup MongoDB and uploads folder:
```bash
mongodump --db attendance_system --out backup/
tar -czf uploads_backup.tar.gz uploads/
```

## Troubleshooting

### Q: Backend won't start
A: Check:
1. MongoDB is running: `sudo systemctl status mongod`
2. Port 8000 is free: `sudo lsof -i :8000`
3. Virtual environment is activated
4. Dependencies are installed
5. .env file exists

### Q: Frontend won't start
A: Check:
1. Node.js is installed: `node --version`
2. Dependencies are installed: `npm install`
3. Port 3000 is free
4. Backend is running

### Q: Webcam not working
A: Check:
1. Browser permissions granted
2. Camera not used by another app
3. Using HTTPS (required for webcam in production)
4. Try different browser

### Q: Face not detected
A: Try:
1. Better lighting
2. Move closer to camera
3. Remove obstructions
4. Use higher quality image
5. Check if face is clearly visible

### Q: Low confidence scores
A: Solutions:
1. Re-register with better images
2. Use multiple images during registration
3. Adjust tolerance in config.py
4. Improve lighting conditions

### Q: Database connection error
A: Check:
1. MongoDB is running
2. Connection string in .env is correct
3. MongoDB port (27017) is accessible
4. Firewall allows connection

## Customization

### Q: Can I change the UI theme?
A: Yes! Edit `frontend/src/App.jsx`:
```javascript
const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },  // Change colors
    secondary: { main: '#dc004e' },
  },
});
```

### Q: Can I add more fields to user profile?
A: Yes! Update:
1. `backend/models/user.py` - Add fields
2. `backend/routes/auth.py` - Update endpoints
3. Frontend forms - Add input fields

### Q: Can I change attendance rules?
A: Yes! Edit `backend/config.py`:
```python
ATTENDANCE_COOLDOWN_HOURS = 8  # Hours between attendance
MIN_CONFIDENCE_THRESHOLD = 0.5  # Minimum confidence
```

### Q: Can I integrate with other systems?
A: Yes! The REST API can be integrated with:
- HR systems
- Payroll software
- Learning management systems
- Access control systems

## Best Practices

### Q: What are the best practices for face registration?
A:
1. Use good lighting
2. Capture 3-5 images from different angles
3. Look directly at camera
4. Remove glasses if possible
5. Keep neutral expression
6. Use high-quality images

### Q: How often should I backup data?
A: Recommended schedule:
- Daily: Automated backups
- Weekly: Manual verification
- Monthly: Off-site backup

### Q: Should I use CNN or HOG model?
A:
- **HOG**: Faster, good for real-time, 90-95% accuracy
- **CNN**: Slower, better accuracy, 95-99% accuracy
- **Recommendation**: Start with HOG, switch to CNN if needed

### Q: How many workers should I use?
A: Formula: `workers = (CPU cores * 2) + 1`
- 2 cores: 5 workers
- 4 cores: 9 workers
- 8 cores: 17 workers

## Future Features

### Q: What features are planned?
A: Upcoming features:
- Advanced liveness detection
- Email/SMS notifications
- Mobile app
- Geolocation verification
- WebSocket real-time updates
- Advanced analytics
- LDAP integration
- Two-factor authentication

### Q: Can I request a feature?
A: Yes! Create an issue on GitHub with:
- Feature description
- Use case
- Expected behavior

### Q: How can I contribute?
A: See CONTRIBUTING.md for guidelines. Contributions are welcome!

## Support

### Q: Where can I get help?
A:
1. Read documentation (README.md)
2. Check this FAQ
3. Review TESTING_GUIDE.md
4. Check API docs at /docs
5. Create GitHub issue
6. Check application logs

### Q: How do I report a bug?
A: Create a GitHub issue with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- System information
- Screenshots if applicable

### Q: Is there a community?
A: Check GitHub Discussions for:
- Questions
- Ideas
- Showcases
- General discussion

---

**Still have questions?** Check the documentation or create an issue on GitHub!
