# Shared Code Layer

This folder contains code shared between the web and mobile applications.

## 📁 Structure

```
shared/
├── services/          # API and storage services
│   ├── api.js        # API calls (works on both platforms)
│   └── storage.js    # Storage abstraction (localStorage/AsyncStorage)
│
├── hooks/            # Custom React hooks
│   ├── useAuth.js    # Authentication logic
│   ├── useFaceDetection.js  # Face detection state management
│   └── useAttendance.js     # Attendance operations
│
└── utils/            # Utility functions
    ├── constants.js  # Shared constants
    ├── validation.js # Form validation
    └── dateUtils.js  # Date formatting
```

## 🎯 Purpose

The shared code layer allows:
- **Code Reuse**: Write once, use in both web and mobile
- **Consistency**: Same business logic across platforms
- **Maintainability**: Fix bugs in one place
- **Efficiency**: Faster development

## 📱 Platform Support

### Web (React)
- Uses `localStorage` for storage
- Uses `react-webcam` for camera
- Uses Material-UI for components

### Mobile (React Native)
- Uses `AsyncStorage` for storage
- Uses `react-native-camera` for camera
- Uses React Native components

## 🔧 Usage

### In Web App (frontend/)

```javascript
// Import from shared folder
import { useAuth } from '../../shared/hooks/useAuth.js';
import { attendanceAPI } from '../../shared/services/api.js';
import { formatDate } from '../../shared/utils/dateUtils.js';

function MyComponent() {
  const { user, login, logout } = useAuth();
  // ... rest of component
}
```

### In Mobile App (mobile/)

```javascript
// Same imports work in mobile!
import { useAuth } from '../../shared/hooks/useAuth.js';
import { attendanceAPI } from '../../shared/services/api.js';
import { formatDate } from '../../shared/utils/dateUtils.js';

function MyScreen() {
  const { user, login, logout } = useAuth();
  // ... rest of screen
}
```

## 🚀 Benefits

1. **75-80% Code Reuse**: Most business logic is shared
2. **Type Safety**: Same types across platforms
3. **Consistent Behavior**: Same logic = same results
4. **Easy Testing**: Test once, works everywhere
5. **Fast Updates**: Update once, deploy to both

## 📝 Guidelines

### What to Put in Shared

✅ API calls
✅ Business logic
✅ Data validation
✅ Utility functions
✅ Custom hooks (state management)
✅ Constants and configurations

### What NOT to Put in Shared

❌ UI components (platform-specific)
❌ Navigation logic (different libraries)
❌ Platform-specific APIs
❌ Styling (different systems)

## 🔄 Migration Status

- ✅ API Service (api.js)
- ✅ Storage Abstraction (storage.js)
- ✅ Authentication Hook (useAuth.js)
- ✅ Face Detection Hook (useFaceDetection.js)
- ✅ Attendance Hook (useAttendance.js)
- ✅ Utilities (constants, validation, dateUtils)
- ⏳ Web app refactoring (in progress)
- ⏳ Mobile app development (pending)

## 📚 Documentation

Each file contains JSDoc comments explaining:
- Function purpose
- Parameters
- Return values
- Usage examples

## 🤝 Contributing

When adding new shared code:
1. Ensure it works on both platforms
2. Add JSDoc comments
3. Test on web and mobile
4. Update this README

## 🐛 Troubleshooting

### Import Errors
- Use relative paths: `../../shared/...`
- Include `.js` extension
- Check file exists

### Storage Issues
- Web: Check browser console
- Mobile: Check AsyncStorage is installed

### API Errors
- Check network connection
- Verify API_BASE_URL is correct
- Check backend is running

## 📞 Support

For issues or questions:
1. Check existing code examples
2. Review JSDoc comments
3. Test in isolation
4. Ask team for help
