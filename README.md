# ReWear — Clothing Exchange & Swap Marketplace
### Unified Mentor Full-Stack Internship Capstone Project

[![React](https://img.shields.io/badge/Frontend-React%2018%20%7C%20Vite-blue)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-green)](https://nodejs.org/)
[![Database](https://img.shields.io/badge/Database-MongoDB%20%7C%20Mongoose-brightgreen)](https://www.mongodb.com/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38bdf8)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-orange)](#)

---

## 1. Project Overview

**ReWear** is a complete, production-minded, cashless Clothing Exchange & Swap Marketplace built to champion circular fashion and eliminate textile waste.

Unlike traditional resale marketplaces with monetary fees and high markups, ReWear operates on **100% direct peer-to-peer wardrobe swaps**. Users exchange garments using an algorithmic **Swap Value Calculator** that ensures fair valuation parity based on original retail price, condition, fabric, and brand tier.

### Visual Aesthetic Direction
Designed to recreate the luxury fashion editorial aesthetic of high-end fashion platforms:
- **Palette**: Forest Green (`#263C31`), Warm Ivory (`#F2F0E9`), Sage Green (`#B8C9B4`), Earth Brown (`#B88C70`), Charcoal (`#242824`), and Pure White (`#FFFFFF`).
- **Typography**: Editorial Serif headings (*Playfair Display*) paired with geometric sans-serif (*Plus Jakarta Sans*).
- **Hero & Navigation**: Glassmorphic floating navigation bar, large cinematic photography, translucent product cards, and dual conversion CTAs.

---

## 2. Critical Requirement: Separate Customer & Admin Portals

ReWear implements strictly isolated authentication experiences with server-side role validation:

### A. Customer Experience (`/login`, `/register`)
- Warm Ivory & Forest Green editorial layout.
- Access to public marketplace, creating listings, proposing swaps, negotiation chat, wishlist, and wardrobe dashboard.
- Enforces `role: 'customer'`. Registration requests attempting to set `role: 'admin'` are blocked server-side.
- Attempting to access `/admin/*` returns a `403 Forbidden` response.

### B. Dedicated Administrator Console (`/admin/login`)
- Dedicated high-security Command Center dark aesthetic (`#141714` / `#242824`).
- Strictly accessible to accounts with `role: 'admin'`. Customer credentials are fundamentally rejected with `403 Forbidden`.
- Dedicated layout and navigation:
  - **Dashboard Overview (`/admin/dashboard`)**: Real-time MongoDB counts and environmental savings metrics.
  - **User Management (`/admin/users`)**: Search, investigate, and toggle account suspensions.
  - **Listing Moderation (`/admin/listings`)**: Approve, flag, or remove reported garments.
  - **Swap Transactions (`/admin/swaps`)**: Full audit trail of swap proposals, courier AWBs, and handover statuses.
  - **Reports & Disputes (`/admin/reports`)**: Community complaints resolution with admin notes.
  - **Platform Analytics (`/admin/analytics`)**: MongoDB aggregation pipelines for category distribution, conversion funnel, and member growth.

---

## 3. Demo Credentials (Development Seeding)

Run the included seed script to populate the local database with realistic Indian fashion personas, listings, and active swaps:

| Role | Portal URL | Email | Password |
|---|---|---|---|
| **Platform Administrator** | `http://localhost:5177/admin/login` | `admin@rewear.com` | `Admin@123456` |
| **Customer Persona 1 (Aanya)** | `http://localhost:5177/login` | `aanya@example.com` | `Password@123` |
| **Customer Persona 2 (Rohan)** | `http://localhost:5177/login` | `rohan@example.com` | `Password@123` |
| **Customer Persona 3 (Pooja)** | `http://localhost:5177/login` | `pooja@example.com` | `Password@123` |

---

## 4. Technology Stack

- **Frontend**:
  - React 18 using Vite
  - Tailwind CSS (Custom luxury color tokens & glassmorphic utilities)
  - React Router v7
  - Lucide React icons
  - Canvas Confetti (celebratory exchange animations)
  - Socket.IO Client (real-time chat updates)
  - Axios API client with automatic token attachment

- **Backend**:
  - Node.js & Express.js
  - MongoDB with Mongoose ODM
  - JWT Authentication (Bearer Header & HttpOnly Cookies)
  - Bcrypt.js password hashing
  - Multer multipart/form-data image upload engine
  - Socket.IO real-time WebSocket server
  - CORS with allowed origins

---

## 5. Getting Started & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) v18+ (verified on Node v22.16.0)
- [MongoDB](https://www.mongodb.com/) running locally on port `27017` or a MongoDB Atlas URI

### 1. Clone & Install Dependencies
From the repository root:
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment Variables
- In `server/`, create or review `.env`:
  ```env
  PORT=5000
  NODE_ENV=development
  MONGODB_URI=mongodb://127.0.0.1:27017/rewear_db
  JWT_SECRET=rewear_jwt_secret_production_key_2026
  CLIENT_URL=http://localhost:5177
  ADMIN_DEFAULT_EMAIL=admin@rewear.com
  ADMIN_DEFAULT_PASSWORD=Admin@123456
  ```
- In `client/`, check `.env` (optional, defaults to Vite proxy):
  ```env
  VITE_API_BASE_URL=
  ```

### 3. Seed Realistic Fashion Data
Populates 1 Administrator, 4 Customers, 12 Luxury Clothing Items, active swap requests, and chats:
```bash
npm run seed
```

### 4. Run Both Client & Server Concurrently
From the root directory:
```bash
npm run dev
```
- **Marketplace Web App**: `http://localhost:5177`
- **Admin Command Center**: `http://localhost:5177/admin/login`
- **Backend API Server**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

---

## 6. Automated Testing Suite

ReWear includes an automated integration test harness that tests 12 critical authentication, authorization, and swap flows:
```bash
npm test
```

### Test Suite Validations:
1. `GET /api/health` returns `200 OK`.
2. Customer registration succeeds with bcrypt password hashing.
3. Role escalation prevention: frontend-supplied `role: 'admin'` is strictly ignored and forced to `customer`.
4. Customer login with valid credentials returns JWT token.
5. Customer login rejects incorrect credentials with `401 Unauthorized`.
6. Dedicated Admin login accepts valid administrator credentials.
7. Dedicated Admin login strictly blocks customer credentials with `403 Forbidden`.
8. Protected administrative metrics API `/api/admin/metrics` blocks customer tokens with `403 Forbidden`.
9. Admin token successfully accesses live aggregated dashboard metrics.
10. Public listings query returns paginated data.
11. Swap Value Calculator accurately computes depreciated garment value.
12. Self-swap prevention: engine strictly forbids users from requesting trades on their own items.

---

## 7. REST API Documentation Summary

### Authentication (`/api/auth`)
- `POST /register`: Register new customer account
- `POST /login`: Authenticate customer
- `POST /admin/login`: Dedicated admin login (checks `role === 'admin'`)
- `GET /me`: Get authenticated user profile & wishlist
- `PUT /profile`: Update user bio, city, postal code, phone, avatar
- `POST /logout`: Clear authentication cookie

### Listings (`/api/listings`)
- `GET /`: Search & filter listings (category, size, condition, city, price range, sort)
- `GET /featured`: Curated top available pieces for homepage
- `GET /nearby`: Location-based listings filtered by city
- `POST /calculate-value`: Real-time value calculator calculation
- `GET /:id`: Full garment specs and similar listings
- `POST /`: Create listing with photo uploads (Multer)
- `PUT /:id`: Update own listing
- `DELETE /:id`: Remove own listing (checks active swap lock)
- `POST /:id/wishlist`: Toggle wishlist save

### Swaps (`/api/swaps`)
- `POST /`: Submit swap proposal (validates availability, compares parity)
- `GET /`: View my swaps (incoming, outgoing, accepted, completed)
- `GET /:id`: Get single swap audit details
- `PUT /:id/accept`: Accept incoming swap (locks both items into `in_swap`, rejects conflicting offers)
- `PUT /:id/reject`: Decline incoming swap
- `PUT /:id/cancel`: Cancel pending outgoing proposal
- `PUT /:id/exchange-details`: Set meeting location or courier tracking number
- `PUT /:id/complete`: Confirm swap completion (marks items as `swapped`)

### Messaging (`/api/messages`)
- `GET /conversations`: User's active negotiations
- `GET /conversations/:id`: Message history
- `POST /conversations/:id`: Send message (Socket.IO + MongoDB)

### Administrative Management (`/api/admin`)
- `GET /metrics`: Live dashboard counters & environmental savings
- `GET /analytics`: Aggregation pipelines (categories, funnel, cohorts)
- `GET /users`: User directory with status filter
- `PUT /users/:id/status`: Toggle user account suspension
- `GET /listings`: Moderation table for all garments
- `PUT /listings/:id/moderate`: Approve, flag, or remove listing
- `GET /swaps`: Global swap transaction audit trail

---

## 8. Deployment Guide

### Frontend Deployment (Vercel)
1. Push repository to GitHub.
2. In Vercel, import the repository and set the **Root Directory** to `client`.
3. Set environment variable:
   `VITE_API_BASE_URL=https://your-backend-render-app.onrender.com`
4. Deploy!

### Backend Deployment (Render)
1. In Render, create a new **Web Service** pointing to the repository.
2. Set **Root Directory** to `server`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Configure Environment Variables:
   - `NODE_ENV=production`
   - `MONGODB_URI=<Your MongoDB Atlas connection string>`
   - `JWT_SECRET=<Strong random string>`
   - `CLIENT_URL=https://your-frontend-vercel-app.vercel.app`
6. Deploy!

---

## 9. License & Unified Mentor Capstone Acknowledgement

Developed for the **Unified Mentor Full-Stack Web Development Internship**.  
Promoting sustainable circular lifestyles across India by keeping wearable garments in circulation.

