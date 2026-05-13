# HopeConnect - Product Requirements Document

## Problem Statement
A web app aimed at homeless/low-income individuals to find essential resources, jobs, and community support. Must include maps, SMS notifications, and a pastel brutalism design aesthetic.

## Core Requirements
- 19 resource categories (Shelters, Food, Washrooms, Laundromats, Clothing Banks, WiFi, Legal Aid, ID Services, Harm Reduction, etc.)
- Job listings with location-based radius filtering
- Google Maps integration
- SMS notifications (Twilio) — currently mocked
- Easy to navigate, pastel brutalism design
- Offline mode (PWA Service Worker)

## Tech Stack
- **Frontend**: React, Framer Motion, Tailwind CSS, iconoir-react, qrcode.react
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic
- **Database**: MongoDB
- **Integrations**: Google Maps API (active), Twilio SMS (mocked)

## What's Implemented
- Full-stack app with 55+ seeded resources across 19 categories
- 3 seeded job listings, 3 benefits, 4 emergency contacts
- User auth (register/login with JWT), admin role system
- Location-based radius filtering (Haversine distance)
- Google Maps integration with markers
- Category dropdown filter, search, radius controls
- **"Get Directions"** deep-links to Google Maps on Resource & Job cards
- **"Share"** button on resource cards (Copy Info, SMS share, native share)
- **"QR Code"** button on resource cards (QR for Google Maps directions)
- **"Suggest a Resource"** page — logged-in users can submit resources via interactive map pin drop or form
- **Admin Dashboard** — admins can approve/reject user-submitted resources, view platform stats
- Admin account seeded on startup
- Favorites system, Community posts, Benefits page, Emergency contacts
- Offline PWA mode via Service Worker
- Modular component architecture

## Pending / Backlog
- P1: SMS Notifications via Twilio (currently mocked, needs user's Twilio keys)
- P2: Token storage security (move from localStorage to httpOnly cookies)
- P2: Further component refactoring (Community.js, Profile.js, Benefits.js, Auth.js)

## Key API Endpoints
- GET /api/resources, GET /api/jobs, GET /api/benefits, GET /api/emergency
- POST /api/auth/register, POST /api/auth/login, GET /api/auth/me
- POST /api/resources/suggest (auth required)
- GET /api/resources/pending (admin only)
- POST /api/resources/pending/{id}/approve (admin only)
- POST /api/resources/pending/{id}/reject (admin only)
- GET /api/admin/stats (admin only)
