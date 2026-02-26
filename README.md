# 📘 Zemeromo (ዝማሬሞ)

**Zemeromo** is a digital sanctuary designed to preserve, distribute, and manage Ethiopian Gospel songs (Mezmur). Built with an "Offline-First" philosophy, it empowers local choirs to connect with their congregations regardless of internet connectivity.

## 🌟 Core Philosophy
- **Peaceful:** A clean, distraction-free interface tailored for worship.
- **Modern:** Cutting-edge web and mobile technologies.
- **Offline-First:** Seamless lyric reading and audio playback even when the internet cuts out.

---

## 🏗️ Architecture (Monorepo)

Zemeromo is divided into three main components:

### 1. The Backend (`/backend`)
The brain of the operation. Handles authentication, database operations, and Cloudinary media management.
- **Tech Stack:** Node.js, Express, TypeScript, MongoDB (Mongoose).
- **Key Features:** Multi-role RBAC (Super Admin, Church Admin, User), JWT Auth, Multer/Cloudinary integration for Audio & Image processing.

### 2. The Web Dashboard (`/client`)
The control panel for Church Admins to upload MP3s, manage artists, and view analytics.
- **Tech Stack:** Next.js (App Router), React, Tailwind CSS, React Hook Form, Zod.
- **Key Features:** Real-time metrics, dependent dropdowns (Church -> Artist -> Album), protected routes, optimized SEO.

### 3. The Mobile App (`/mobile`) *(In Development)*
The player and reader for the end-user (congregation).
- **Tech Stack:** React Native (Expo), NativeWind, Zustand, MMKV.
- **Key Features:** Stale-while-revalidate caching, background audio playback, offline lyrics.

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- Cloudinary Account (for media storage)
- SMTP credentials (for password resets)

### Environment Variables
Create a `.env` file in the `/backend` and `/client` directories.

**Backend (`/backend/.env`):**
\`\`\`env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
FRONTEND_URL=https://zemeromo.et
\`\`\`

**Client (`/client/.env.local`):**
\`\`\`env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
\`\`\`

### Installation & Execution

**1. Start the Backend**
\`\`\`bash
cd backend
npm install
npm run dev
\`\`\`

**2. Start the Client Dashboard**
\`\`\`bash
cd client
npm install
npm run dev
\`\`\`
Visit `http://localhost:3000` to view the dashboard.

---

## 🔒 Roles & Permissions
1. **Super Admin:** Can manage all churches, approve pending admin applications, and perform hard deletions.
2. **Church Admin (Verified):** Can manage content (Songs, Albums, Artists) strictly for their assigned church.
3. **Church Admin (Pending):** Can log in but cannot upload or modify content until approved by a Super Admin.
4. **User (Mobile):** Can stream, download, and read lyrics.

---

## 👨‍💻 Developer
Built with ❤️ for Ethiopian Churches & Choirs.