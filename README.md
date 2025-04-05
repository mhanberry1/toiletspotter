# 🚽 Toilet Spotter

Toilet Spotter is a cross-platform mobile/web application that helps users find and share access codes to locked public restrooms anonymously.

## 📱 Features

- Anonymously post bathroom door codes pinned to your current location
- View nearby codes on a map or in a list view
- Upvote or downvote codes to help ensure accuracy
- No user accounts or sign-up required
- Complete privacy - no business names or personal data stored
- Works on iOS, Android, and Web browsers

## 🛠️ Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Firebase/Supabase
- **Database**: Firestore/Supabase
- **Maps**: Google Maps/Mapbox
- **Deployment**: Expo EAS

## 🚀 Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (LTS version recommended)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)
- [Expo CLI](https://docs.expo.dev/workflow/expo-cli/)

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/yourusername/toiletspotter.git
   cd toiletspotter
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npx expo start
   ```

4. Run on your preferred platform
   - Press `i` to run on iOS simulator
   - Press `a` to run on Android emulator
   - Press `w` to run on web browser

## 📋 Project Structure

```
toiletspotter/
├── app/                # Main application code (Expo Router)
│   ├── (tabs)/         # Tab-based navigation
│   ├── modals/         # Modal screens
├── assets/             # Static assets (images, fonts)
├── components/         # Reusable UI components
├── hooks/              # Custom React hooks
├── services/           # API and backend services
├── utils/              # Utility functions
├── PRD.md              # Product Requirements Document
├── todo.md             # Development To-Do List
```

## 📝 Documentation

- See [PRD.md](./PRD.md) for detailed product requirements
- See [todo.md](./todo.md) for development phases and tasks

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.
