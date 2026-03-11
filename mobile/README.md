# LynQ Mobile App

Flutter mobile application for LynQ — digital business card & lead management platform.

## Features

- **Digital Business Cards** — Create, customize (themes, colors), and share cards
- **QR Code Sharing** — Display card QR codes; scan others' QR codes
- **NFC** — Tap to share your card via NFC
- **Lead Management** — View, filter, and manage all captured leads
- **AI Secretary** — Chat widget powered by Gemini on your public card
- **Stripe Billing** — Manage subscription from in-app settings
- **Offline-first auth** — JWT stored securely with flutter_secure_storage

## Setup

### 1. Install Flutter

```bash
flutter --version  # Requires Flutter 3.19+ / Dart 3.2+
```

### 2. Install dependencies

```bash
cd mobile
flutter pub get
```

### 3. Configure API URL

Set the API base URL to your deployed Next.js backend:

```bash
# For development (local):
flutter run --dart-define=API_BASE_URL=http://localhost:3000

# For production:
flutter run --dart-define=API_BASE_URL=https://your-app.vercel.app
```

### 4. Android — NFC permissions

Add to `android/app/src/main/AndroidManifest.xml`:
```xml
<uses-permission android:name="android.permission.NFC" />
<uses-feature android:name="android.hardware.nfc" android:required="false" />
```

### 5. iOS — Camera (QR scanner) permission

Add to `ios/Runner/Info.plist`:
```xml
<key>NSCameraUsageDescription</key>
<string>LynQ needs camera access to scan QR codes</string>
<key>NFCReaderUsageDescription</key>
<string>LynQ uses NFC to share your digital business card</string>
```

## Architecture

```
lib/
├── config/           # API base URLs, constants
├── models/           # Dart models (Profile, Lead, User)
├── services/         # API service classes (AuthService, ProfileService, LeadService)
├── screens/
│   ├── auth/         # Login & Signup screens
│   ├── dashboard/    # Stats dashboard
│   ├── card_editor/  # Card list + live editor
│   ├── leads/        # Lead list with filters
│   ├── qr_scanner/   # Camera QR scanner
│   └── settings/     # Account, billing, integrations
└── main.dart         # App entry point + navigation
```

## API

The mobile app connects to the same Next.js backend used by the web app.
All requests use `Authorization: Bearer <jwt>` header obtained from `POST /api/auth/mobile/login`.
