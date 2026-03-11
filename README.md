# ዘመሮሞ — Zemeromo

> A digital home for Ethiopian Gospel music (ዝማሬ / Mezmur).

---

## Table of Contents

- [About the Project](#about-the-project)
- [The Goal](#the-goal)
- [Vision](#vision)
- [Monorepo Structure](#monorepo-structure)
- [What It Does](#what-it-does)
- [Architecture](#architecture)
  - [Backend](#1-backend---backend)
  - [Web Dashboard](#2-web-dashboard---client)
  - [Mobile App](#3-mobile-app---mobile)
- [Roles & Permissions](#roles--permissions)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Running Locally](#running-locally)
- [Scripts Reference](#scripts-reference)
- [Developer](#developer)

---

## About the Project

Zemeromo is a platform created to help Ethiopian church choirs preserve, organize, and share their Gospel songs (Mezmur — ዝማሬ).

The name **"Zemeromo"** comes from the Hadiyisa language, meaning **"I sing"** or **"I will sing"** — similar to the Amharic phrase **"እዘምራለሁ"**.

Across Ethiopia, thousands of churches have choirs that create powerful spiritual songs carrying messages meant to inspire faith and strengthen communities. However, most of these songs remain unpublished and locally stored, often written in notebooks or printed sheets used only within the church.

Because of this:

- Many choir songs never reach a wider audience
- Lyrics are difficult to distribute during choir rehearsals
- Churches struggle to organize and preserve their compositions
- Over time, many songs risk being lost

Despite the richness of Ethiopian Gospel music, there has been no centralized digital platform that allows churches and choirs to easily manage and share their music.

---

## The Goal

Zemeromo aims to solve this problem by creating a digital ecosystem where:

- Choirs can upload and manage their songs
- Lyrics can be shared easily during rehearsals
- Churches can gain visibility for their choir music
- Songs can be digitally preserved for future generations
- Congregations can listen, read lyrics, and save songs

In the future, Zemeromo also plans to connect composers and creators with choirs. Many people have the resources or ideas to create songs but may lack the platform or network to collaborate with talented choir groups.

By bridging this gap, Zemeromo hopes to support new Gospel music creation while preserving existing works.

---

## Vision

Zemeromo aims to become a central digital hub for Ethiopian Mezmur, connecting:

- Churches
- Choirs
- Composers
- Worship leaders
- Listeners

...so that the spiritual messages carried through these songs can reach more people and continue inspiring future generations.

Whether someone is in Addis Ababa with fast internet or in a remote area with limited connectivity, they should still be able to:

- Listen to worship music
- Read lyrics
- Discover choir songs
- Stay connected to their church community

---

## Monorepo Structure

```
zemeromo/
├── backend/          # REST API — Node.js, Express, MongoDB
├── client/           # Web Admin Dashboard — Next.js (App Router)
└── mobile/           # Mobile App — React Native (Expo)
```

---

## What It Does

| Feature | Description |
|---|---|
| 🎵 Song Management | Upload and manage Ethiopian Gospel MP3s with lyrics |
| 🏛️ Church Directory | Browse and manage registered churches |
| 🎤 Artist Profiles | Dedicated artist pages with discography |
| 💿 Album Support | Organize songs into albums with cover art |
| 🔍 Global Search | Search across songs, artists, albums, and churches |
| 📊 Dashboard Analytics | Real-time metrics and charts for admins |
| 🔐 RBAC Auth | Multi-role access control (Super Admin, Church Admin, User) |
| 📱 Mobile Player | Full-featured audio player with background playback |
| 📥 Offline First | Songs and lyrics cached locally — works without internet |
| ❤️ Favorites & Library | Save songs to a personal library |

---

## Architecture

### 1. Backend — `/backend`

The REST API that powers the platform. It handles authentication, media storage, and all database operations.

#### Tech Stack

- **Runtime:** Node.js + TypeScript
- **Framework:** Express v5
- **Database:** MongoDB (Mongoose v9)
- **Media Storage:** Cloudinary (via Multer + multer-storage-cloudinary)
- **Auth:** JWT (jsonwebtoken) + bcryptjs
- **Email:** Nodemailer (password reset emails)
- **Security:** Helmet, CORS, express-validator

#### Data Models

| Model | Description |
|---|---|
| User | Admins & mobile users; roles: `superadmin`, `churchAdmin`, `user` |
| Church | Registered churches with location, logo, and verification status |
| Artist | Gospel artists linked to a church |
| Album | Album with cover art, linked to an artist and church |
| Song | MP3 + lyrics + metadata linked to artist, album, and church |
| Transaction | Audit log of content changes |

#### API Routes

| Prefix | Description |
|---|---|
| `/api/auth` | Register, login, logout, password reset |
| `/api/songs` | CRUD for songs and MP3 uploads |
| `/api/albums` | CRUD for albums |
| `/api/artists` | CRUD for artists |
| `/api/churches` | CRUD for churches |
| `/api/users` | User management |
| `/api/dashboard` | Aggregated admin statistics |
| `/api/search` | Global search |
| `/api/bulk` | Bulk import operations |

---

### 2. Web Dashboard — `/client`

The admin control panel where churches and administrators manage content.

#### Tech Stack

- **Framework:** Next.js 16 (App Router) + React 19
- **Styling:** Tailwind CSS v4
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Animations:** Framer Motion
- **Icons:** Lucide React + React Icons
- **Maps:** Leaflet + React Leaflet
- **HTTP Client:** Axios
- **Notifications:** Sonner

#### Pages & Features

| Page | Description |
|---|---|
| `/` | Landing page |
| `/auth` | Login and registration |
| `/dashboard` | Analytics overview |
| `/dashboard/songs` | Song management |
| `/dashboard/directory` | Church and artist management |
| `/dashboard/users` | User management |
| `/dashboard/tools` | Bulk import tools |
| `/about` & `/legal` | Informational pages |

---

### 3. Mobile App — `/mobile`

The mobile listening app for congregations and listeners. Built with Expo for both Android and iOS.

#### Tech Stack

- **Framework:** React Native (Expo SDK 54) + TypeScript
- **Navigation:** React Navigation + Expo Router
- **State Management:** Zustand + MMKV
- **Data Fetching:** TanStack Query v5 (offline persistence)
- **Audio:** Expo AV (background playback)
- **Fonts:** Inter (`@expo-google-fonts/inter`)
- **Animations:** Expo Linear Gradient

#### Screens

| Screen | Description |
|---|---|
| `OnboardingScreen` | First launch introduction |
| `HomeScreen` | Featured songs and artists |
| `SearchScreen` | Global search |
| `ArtistDetailScreen` | Artist discography |
| `AlbumDetailScreen` | Album tracks |
| `ChurchDetailScreen` | Church profile |
| `SongDetailScreen` | Song page with lyrics |
| `PlayerScreen` | Full audio player |
| `LibraryScreen` | Favorite songs |
| `ProfileScreen` | User profile |

#### Zustand Stores

- `playerStore` — Audio playback state
- `favoritesStore` — Saved songs
- `settingsStore` — App settings
- `themeStore` — UI theme

---

## Roles & Permissions

| Role | Capabilities |
|---|---|
| Super Admin | Full system control |
| Church Admin (Verified) | Manage songs, albums, artists within their church |
| Church Admin (Pending) | Limited access until verification |
| User | Listen to songs, read lyrics, save favorites |

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB or MongoDB Atlas
- Cloudinary account
- SMTP credentials
- Expo CLI

---

### Environment Variables

#### Backend — `backend/.env`

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_gmail_app_password

FRONTEND_URL=http://localhost:3000
```

#### Client — `client/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

#### Mobile — `mobile/.env`

```env
EXPO_PUBLIC_API_URL=http://localhost:5000/api
```

---

### Running Locally

#### Start Backend

```bash
cd backend
npm install
npm run dev
```

#### Seed Database _(optional)_

```bash
npm run seed:admin
npm run seed:data
```

#### Start Web Dashboard

```bash
cd client
npm install
npm run dev
```

#### Start Mobile App

```bash
cd mobile
npm install
npx expo start
```

---

## Scripts Reference

### Backend

| Command | Description |
|---|---|
| `npm run dev` | Start dev server |
| `npm run build` | Compile TypeScript |
| `npm start` | Run production build |
| `npm run seed:admin` | Create Super Admin |
| `npm run seed:data` | Seed sample data |

### Client

| Command | Description |
|---|---|
| `npm run dev` | Start Next.js |
| `npm run build` | Production build |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |

### Mobile

| Command | Description |
|---|---|
| `npx expo start` | Start Expo dev server |
| `npx expo run:android` | Run on Android |
| `npx expo run:ios` | Run on iOS |

---

## Developer

Built with ❤️ for Ethiopian Churches and Choirs.