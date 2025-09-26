# Asset Tracker Mobile APK Build Instructions

## Overview
This directory contains a Cordova-based mobile app wrapper for the Asset Tracker PWA. Since local Android SDK setup is complex and requires significant configuration, we've prepared the project for cloud-based building.

## Project Structure
- `AssetTrackerApp/` - Main Cordova project directory
- `AssetTrackerMobile.zip` - Ready-to-upload package for cloud build services
- `BUILD_INSTRUCTIONS.md` - This file

## Cloud Build Options

### Option 1: VoltBuilder (Recommended)
VoltBuilder is a cloud service that builds Cordova apps without requiring local SDK setup.

1. Visit: https://volt.build/
2. Create a free account
3. Upload the `AssetTrackerMobile.zip` file
4. Select "Android" as the target platform
5. Click "Build" to generate the APK
6. Download the generated APK file

**Pricing**: Free tier available, paid plans for advanced features

### Option 2: Monaca
Monaca provides cloud-based Cordova app building with a free tier.

1. Visit: https://monaca.io/
2. Sign up for a free account
3. Create a new project and upload the zip file
4. Use their cloud build service to generate the APK
5. Download the APK

**Pricing**: Free tier available with limitations

### Option 3: Bitrise
More advanced CI/CD platform suitable for larger projects.

1. Visit: https://bitrise.io/
2. Connect your Git repository or upload the project
3. Configure Android build workflow
4. Run the build to generate APK

**Pricing**: Free tier available, more suitable for ongoing development

## App Features
The mobile app serves as a launcher that:
- Displays the Asset Tracker branding
- Provides a "Launch App" button
- Opens the Asset Tracker PWA (https://asset-tracker-pro.vercel.app/) in the system browser
- Works offline for the launcher interface

## Technical Details
- **Package ID**: com.assettracker.mobile
- **App Name**: Asset Tracker Mobile
- **Version**: 1.0.0
- **Minimum Android SDK**: 22 (Android 5.1)
- **Target Android SDK**: 34 (Android 14)
- **Plugins**: cordova-plugin-inappbrowser

## Local Development (Alternative)
If you want to set up local Android development:

1. Install Android Studio
2. Set up Android SDK
3. Configure ANDROID_HOME environment variable
4. Run: `cordova build android`

However, cloud building is much simpler and faster for most use cases.

## Next Steps
1. Choose a cloud build service from the options above
2. Upload the `AssetTrackerMobile.zip` file
3. Build the APK
4. Test the APK on an Android device
5. Optionally publish to Google Play Store

## Support
For issues with the mobile app, contact the Asset Tracker development team.