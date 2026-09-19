# Pocket Chess

A small, offline, two-player chess app built with Expo and React Native. It runs on iOS, Android, and the web from one codebase.

## Run locally

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `i` for iOS Simulator / `a` for Android Emulator.

## Build for the App Store

1. Install EAS CLI: `npm install -g eas-cli`
2. Log in: `eas login`
3. Configure builds: `eas build:configure`
4. Create an iOS production build: `eas build --platform ios --profile production`
5. Submit it: `eas submit --platform ios`

Before submitting, replace the example bundle identifier in `app.json`, add a real app icon at `assets/icon.png`, and complete the App Store listing, privacy details, screenshots, and signing information in App Store Connect.

## Gameplay

Tap one of your pieces and then tap a highlighted destination. The app supports standard piece movement, captures, promotion to a queen, check, checkmate, and draw detection through `chess.js`.
