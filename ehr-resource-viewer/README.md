# EHR Resource Viewer

A modern web application for viewing Electronic Health Record (EHR) resources with real-time processing status tracking.

## Overview

This NextJS application displays EHR resources in a sortable table format with detailed modal views. It integrates with Firebase for authentication and real-time data synchronization, providing a clean interface for monitoring resource processing states.

## Features

- 📊 **Interactive Data Table** - Sortable columns with TanStack Table
- 🔍 **Detailed Resource Views** - Click any row to see complete metadata
- ⚡ **Real-time Updates** - Live sync with Firestore database
- 🎯 **Processing Status Tracking** - Color-coded status indicators
- 📱 **Responsive Design** - Works on desktop and tablet
- 🔐 **Firebase Authentication** - Secure anonymous login
- 🎨 **Modern UI** - Built with shadcn/ui and Tailwind CSS

## Quick Start

### Prerequisites
- Node.js 18+ 
- Firebase project with Firestore and Authentication enabled

### Installation

1. **Clone and install**:
   ```bash
   git clone <repository-url>
   cd ehr-resource-viewer
   npm install
   ```

2. **Configure Firebase**:
   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Firebase config
   ```

3. **Run the application**:
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

## Firebase Setup

1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Firestore Database** (start in test mode)
3. Enable **Authentication** → Anonymous sign-in
4. Get your config from Project Settings → Web app
5. Create a `resourceWrappers` collection in Firestore
6. Set Firestore security rules:
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /resourceWrappers/{document} {
         allow read, write: if request.auth != null;
       }
     }
   }
   ```

## Environment Variables

Copy `.env.local.example` to `.env.local` and add your Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server  
npm run lint         # Run ESLint
npm run populate-firestore  # Add sample data (optional)
```

## Data Structure

Resources follow the `ResourceWrapper` interface with:

- **Metadata**: Processing state, timestamps, identifiers, resource type
- **Content**: Human-readable descriptions and optional AI summaries
- **FHIR Compliance**: Supports FHIR R4 and R4B standards

See `sample-data.json` for example documents.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **UI**: shadcn/ui + Tailwind CSS
- **Table**: TanStack Table
- **Icons**: Lucide React
- **Dates**: date-fns

## Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in dashboard
3. Deploy automatically on push

### Other Platforms
The app works on any platform supporting Node.js:
- Google Cloud Run
- AWS Amplify  
- Netlify
- Railway

## License

MIT License - See LICENSE file for details
