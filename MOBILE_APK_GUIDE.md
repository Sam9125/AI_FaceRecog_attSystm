# Mobile APK Build Guide

This guide explains how to build and deploy the Attendance System as an Android APK using Capacitor.

## Prerequisites

### Required Software
1. **Node.js** (v16 or higher) - Already installed
2. **Android Studio** - Download from https://developer.android.com/studio
3. **Java JDK** (v11 or higher) - Usually comes with Android Studio

### Android Studio Setup
1. Install Android Studio
2. Open Android Studio → Settings → Appearance & Behavior → System Settings → Android SDK
3. Install:
   - Android SDK Platform 33 (or latest)
   - Android SDK Build-Tools
   - Android SDK Command-line Tools
4. Set environment variables:
   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   ```

## Installation Steps

### 1. Install Capacitor Dependencies
```bash
cd attendance-system/frontend

# Install Capacitor packages (if not already installed)
npm install @capacitor/core @capacitor/cli @capacitor/android
npm install @capacitor/camera @capacitor/network @capacitor/status-bar @capacitor/splash-screen
```

### 2. Initialize Capacitor (First Time Only)
```bash
# Initialize Capacitor
npx cap init

# When prompted:
# App name: Attendance System
# App ID: com.yourcompany.attendance
# Web directory: dist
```

### 3. Add Android Platform (First Time Only)
```bash
npx cap add android
```

### 4. Update Backend URL for Mobile

Edit `frontend/.env` and add your backend server IP:
```env
# For local network testing (replace with your computer's IP)
VITE_API_URL=http://192.168.1.100:8000

# For production (replace with your actual server)
# VITE_API_URL=https://your-server.com
```

**Important:** Use your computer's local IP address (not localhost) so the mobile app can reach the backend.

### 5. Update API Service

Make sure your API calls use the environment variable. Check `frontend/src/services/api.js`:
```javascript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

## Building the APK

### Development Build (for testing)

```bash
cd attendance-system/frontend

# Build the web app and sync with Android
npm run cap:sync

# Open in Android Studio
npm run cap:open

# In Android Studio:
# 1. Wait for Gradle sync to complete
# 2. Click "Run" button or press Shift+F10
# 3. Select your device/emulator
```

### Production APK Build

```bash
# 1. Build optimized web app
npm run build

# 2. Sync with Capacitor
npx cap sync android

# 3. Open Android Studio
npx cap open android

# In Android Studio:
# 1. Build → Generate Signed Bundle / APK
# 2. Choose APK
# 3. Create or select keystore
# 4. Build release APK
```

### Quick APK Build (Debug)

```bash
cd attendance-system/frontend/android

# Build debug APK directly
./gradlew assembleDebug

# APK location:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## Configuration

### Update App Details

Edit `android/app/src/main/res/values/strings.xml`:
```xml
<resources>
    <string name="app_name">Attendance System</string>
    <string name="title_activity_main">Attendance System</string>
    <string name="package_name">com.yourcompany.attendance</string>
</resources>
```

### Camera Permissions

Already configured in `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
```

### App Icon

Replace icons in:
- `android/app/src/main/res/mipmap-*/ic_launcher.png`
- Use Android Studio's Image Asset tool: Right-click `res` → New → Image Asset

## Testing

### Test on Physical Device

1. Enable Developer Options on your Android phone:
   - Settings → About Phone → Tap "Build Number" 7 times
2. Enable USB Debugging:
   - Settings → Developer Options → USB Debugging
3. Connect phone via USB
4. Run: `npm run cap:run`

### Test on Emulator

1. Open Android Studio → Device Manager
2. Create Virtual Device (Pixel 5 recommended)
3. Run: `npm run cap:run`

## Deployment

### Install APK on Device

```bash
# Using ADB
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or copy APK to phone and install manually
```

### Distribute APK

1. **Direct Distribution**: Share the APK file directly
2. **Google Play Store**: 
   - Create developer account ($25 one-time fee)
   - Build signed release APK
   - Upload to Play Console

## Troubleshooting

### Backend Connection Issues

If the app can't connect to backend:
1. Check your computer's IP: `ip addr` or `ifconfig`
2. Update `VITE_API_URL` in `.env`
3. Ensure backend is running: `cd backend && python main.py`
4. Check firewall allows port 8000
5. Both devices must be on same network

### Camera Not Working

1. Check permissions in app settings
2. Verify `AndroidManifest.xml` has camera permission
3. Test on physical device (emulator camera is limited)

### Build Errors

```bash
# Clean and rebuild
cd android
./gradlew clean
./gradlew assembleDebug
```

### Gradle Issues

```bash
# Update Gradle wrapper
cd android
./gradlew wrapper --gradle-version=8.0
```

## Live Reload During Development

```bash
# 1. Start Vite dev server
npm run dev

# 2. Update capacitor.config.json temporarily:
{
  "server": {
    "url": "http://192.168.1.100:3000",
    "cleartext": true
  }
}

# 3. Sync and run
npx cap sync
npx cap run android

# Changes will reload automatically!
```

## Production Checklist

- [ ] Update `VITE_API_URL` to production server
- [ ] Build optimized bundle: `npm run build`
- [ ] Test all features on physical device
- [ ] Generate signed release APK
- [ ] Test APK installation
- [ ] Verify camera permissions work
- [ ] Test face recognition accuracy
- [ ] Check network error handling
- [ ] Verify offline behavior

## Useful Commands

```bash
# Sync web code to native
npm run cap:sync

# Open Android Studio
npm run cap:open

# Run on device
npm run cap:run

# View logs
npx cap run android -l

# Update Capacitor
npm install @capacitor/cli@latest @capacitor/core@latest @capacitor/android@latest
npx cap sync
```

## Next Steps

1. **Add Splash Screen**: Create branded splash screen
2. **App Icon**: Design and add custom app icon
3. **Push Notifications**: Add for attendance reminders
4. **Offline Mode**: Cache data for offline access
5. **Biometric Auth**: Add fingerprint/face unlock
6. **Background Sync**: Sync attendance when online

## Resources

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Studio Guide](https://developer.android.com/studio/intro)
- [Vite Build Guide](https://vitejs.dev/guide/build.html)
