# Stream Time

A cloud-based video streaming platform that allows users to upload, manage, and stream videos securely.

## Tech Stack

**Frontend**
- React 19 with React Router v7
- Tailwind CSS
- Clerk Authentication

**Backend**
- Node.js/Express microservices
- Google Cloud Storage
- Firebase/Firestore
- Google Cloud Functions

## Project Structure

```
cloud/
├── video-stream-app/          # React frontend
│   └── src/components/        # UI components
└── cloud-video-stream/        # Backend microservices
    ├── controller/            # API gateway (Cloud Function)
    ├── storage-backend/       # Video storage service
    ├── logging-service/       # Event logging service
    └── resource-monitor/      # Usage tracking service
```

## Quick Start

### Prerequisites

- Node.js 18+
- Google Cloud account with Storage API enabled
- Firebase project with Firestore
- Clerk account for authentication

### Frontend

```bash
cd video-stream-app
npm install
npm start
```

Runs on `http://localhost:3000`

### Backend Services

```bash
# Storage Backend (port 8080)
cd cloud-video-stream/storage-backend
npm install
npm start

# Resource Monitor (port 8081)
cd cloud-video-stream/resource-monitor
npm install
node index.js
```

### Docker (Storage Backend)

```bash
cd cloud-video-stream/storage-backend
docker build -t storage-backend .
docker run -p 8080:8080 storage-backend
```

## Environment Variables

**storage-backend/.env**
```
GOOGLE_APPLICATION_CREDENTIALS=path/to/service-account.json
```

**resource-monitor/.env**
```
# Firebase configuration
```

**video-stream-app/.env**
```
REACT_APP_CLERK_PUBLISHABLE_KEY=your_clerk_key
```

## Features

- Video upload (max 50MB per file)
- Secure streaming via signed URLs
- Per-user storage (50MB limit)
- Daily bandwidth limits (100MB)
- Usage statistics dashboard
