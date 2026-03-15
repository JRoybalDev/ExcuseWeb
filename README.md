# 🛡️ Ultimate Next.js Starter

A high-performance, aesthetically refined starter kit built with **Next.js 16**, **Better Auth**, and **Prisma**. This template features a custom "Solid Earthy" theme designed for modern, professional web applications.

## 🛠️ Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Runtime:** React 19
- **Auth:** Better Auth v1.4+
- **Database:** Prisma ORM (PostgreSQL)
- **Styling:** Tailwind CSS 4 & Lucide Icons
- **Forms:** React Hook Form & Zod
- **Notifications:** Sonner

## ✨ Key Features

- **Custom UI System:** A warm, parchment-inspired palette using `#fdfaf7`, `#c9ada7`, and `#4a331f`.
- **Pre-built Auth:** Fully styled Sign In and Sign Up modals with client-side validation.
- **Client-Centric:** Optimized for client-side state management and interactive components.
- **Type Safety:** Full TypeScript integration across the database and API layers.

## 🚀 Getting Started

### 1. Installation
```bash
npm install
```

### 2. Environment Setup
Create a `.env` file in the root directory:
```
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/your_db"

# Better Auth
BETTER_AUTH_SECRET="your_secret_key"
BETTER_AUTH_URL="http://localhost:3000"
```

### 3. Database Initialization
```bash
npx prisma generate
npx prisma db push
```

### 4. Run Development Server
```bash
npm run dev
```

## 📁 Project Structure
- `app/` - Next.js App Router and API routes.
- `components/auth/` - Custom-styled Sign In, Sign Up, and User Navigation.
- `components/ui/` - Core UI primitives (Cards, Buttons, Inputs).
- `lib/` - Shared configurations for Better Auth and Prisma.

## 📜 Scripts
- `npm run dev` - Start development server.
- `npm run build` - Build for production.
- `npm run start` - Start production server.
- `npm run lint` - Run ESLint.

Built as a foundation for scalable, high-quality Next.js applications.
# ultimate-starter
# ExcuseWeb
