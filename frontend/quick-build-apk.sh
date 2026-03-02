#!/bin/bash

# Quick APK Build Script
set -e

echo "🚀 Building APK for Attendance System..."
echo ""

# Build web app
echo "📦 Building web app..."
npm run build

# Sync with Android
echo "🔄 Syncing with Android..."
npx cap sync android

# Ensure Java compatibility for environments with JDK 17
echo "🛠️  Applying Java compatibility fix (17)..."
sed -i 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' android/app/capacitor.build.gradle
sed -i 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' node_modules/@capacitor/android/capacitor/build.gradle
sed -i 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' node_modules/@capacitor/camera/android/build.gradle
sed -i 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' node_modules/@capacitor/splash-screen/android/build.gradle
sed -i 's/JavaVersion.VERSION_21/JavaVersion.VERSION_17/g' node_modules/@capacitor/status-bar/android/build.gradle

# Build APK
echo "🔨 Building APK..."
cd android
chmod +x gradlew
./gradlew assembleDebug

echo ""
echo "✅ APK Built Successfully!"
echo ""
echo "📱 APK Location:"
echo "   $(pwd)/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "📲 To install on phone:"
echo "   1. Copy APK to phone and install, OR"
echo "   2. Connect phone via USB and run:"
echo "      adb install app/build/outputs/apk/debug/app-debug.apk"
echo ""
