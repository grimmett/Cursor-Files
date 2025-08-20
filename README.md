# Construction Punchlist App

A comprehensive construction punchlist management application built with React Native (iOS/iPad) and React (Web), designed to replace the discontinued Bridgit Field software.

## Features

- **Project Management**: Create, organize, and manage construction projects
- **Punchlist Items**: Add, edit, and track punchlist items with photos, descriptions, and status
- **User Management**: Role-based access control (Admin, Project Manager, Inspector, Contractor)
- **Photo Documentation**: Capture and attach photos to punchlist items
- **Status Tracking**: Track item status (Open, In Progress, Completed, Verified)
- **Reporting**: Generate comprehensive reports and analytics
- **Offline Support**: Work offline and sync when connection is restored
- **Cross-Platform**: Native iOS/iPad app + responsive web application

## Project Structure

```
construction-punchlist/
├── mobile-app/          # React Native iOS/iPad app
├── web-app/            # React web application
├── shared/             # Shared utilities and types
├── backend/            # Node.js/Express API server
└── docs/              # Documentation and API specs
```

## Tech Stack

### Mobile App (iOS/iPad)
- React Native
- Expo
- TypeScript
- React Navigation
- AsyncStorage for offline support
- Camera integration

### Web App
- React 18
- TypeScript
- Tailwind CSS
- React Router
- React Query for data management

### Backend
- Node.js
- Express
- PostgreSQL
- JWT authentication
- File upload handling

## Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- Xcode (for iOS development)
- Expo CLI
- PostgreSQL

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   cd mobile-app && npm install
   cd ../web-app && npm install
   cd ../backend && npm install
   ```

3. Set up the database and environment variables
4. Start the development servers

## Development

- **Mobile App**: `cd mobile-app && npm start`
- **Web App**: `cd web-app && npm start`
- **Backend**: `cd backend && npm run dev`

## License

MIT License




