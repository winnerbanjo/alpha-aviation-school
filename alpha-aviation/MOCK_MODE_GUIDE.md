# 🚀 Local/Offline Mode Guide

## Connection Strategy

The server now tries connections in this order:
1. **Atlas MongoDB** (from `.env` MONGODB_URI)
2. **Local MongoDB** (`mongodb://localhost:27017/alpha_aviation`)
3. **Mock Data Mode** (if both fail)

## Mock Data Credentials

### Admin Login
- **Email:** `admin@alpha.com`
- **Password:** `password123`

### Student Logins
- **Email:** `student1@alpha.com` / **Password:** `password123`
- **Email:** `student2@alpha.com` / **Password:** `password123`
- **Email:** `student3@alpha.com` / **Password:** `password123`
- **Email:** `student4@alpha.com` / **Password:** `password123`
- **Email:** `student5@alpha.com` / **Password:** `password123`

## Mock Data Includes

- **5 Students** with various courses and payment statuses
- **Financial Stats** calculated from mock data
- **All Features Work** - Admin dashboard, student portal, etc.

## Starting the App

### Backend (Port 5000)
```bash
cd server
npm start
```

### Frontend (Port 5173)
```bash
cd client
npm run dev
```

## Access URLs

- **Frontend:** http://localhost:5173
- **Backend API:** http://localhost:5000/api
- **Health Check:** http://localhost:5000/api/health

## Features Available in Mock Mode

✅ All 10 Batch 4 features work:
- Curriculum Roadmap
- Profile Settings
- Document Vault
- Onboarding Screen
- Resource Library
- Live Revenue Tracker
- Global Search
- Course Track Modifier
- WhatsApp Reminders
- Payment Filters

## Notes

- Changes in mock mode are temporary (reset on server restart)
- To use real data, ensure MongoDB is running locally or fix Atlas connection
- Mock mode is indicated in console logs and API responses
