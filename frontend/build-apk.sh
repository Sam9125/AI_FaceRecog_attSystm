#!/bin/bash

# Attendance System - APK Build Script
# This script automates the APK build process

set -e

echo "🚀 Starting APK Build Process..."
echo ""

# Check if Android Studio is installed
if ! command -v android &> /dev/null; then
    echo "⚠️  Warning: Android Studio may not be installed"
    echo "   Download from: https://developer.android.com/studio"
    echo ""
fi

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install

# Step 2: Build web app
echo "🔨 Step 2: Building web application..."
npm run build

# Step 3: Check if android platform exists
if [ ! -d "android" ]; then
    echo "📱 Step 3: Adding Android platform (first time)..."
    npx cap add android
else
    echo "📱 Step 3: Android platform already exists, syncing..."
    npx cap sync android
fi

# Step 4: Open Android Studio
echo "🎨 Step 4: Opening Android Studio..."
echo ""
echo "✅ Build preparation complete!"
echo ""
echo "Next steps in Android Studio:"
echo "1. Wait for Gradle sync to complete"
echo "2. For testing: Click 'Run' button (Shift+F10)"
echo "3. For APK: Build → Generate Signed Bundle / APK"
echo ""
echo "Debug APK will be at:"
echo "android/app/build/outputs/apk/debug/app-debug.apk"
echo ""

npx cap open android
