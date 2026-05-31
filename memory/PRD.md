# HopeConnect - Product Requirements Document

## Problem Statement
A web app aimed at homeless/low-income individuals to find essential resources, jobs, and community support. Must include maps, SMS notifications, and a pastel brutalism design aesthetic.

## Tech Stack
- **Frontend**: React, Framer Motion, Tailwind CSS, iconoir-react, qrcode.react
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic
- **Database**: MongoDB
- **Integrations**: Google Maps API (active), Twilio SMS (mocked)

## What's Implemented

### Core Features
- 19 resource categories with 55+ seeded resources
- 3 job listings, 3 benefits, 4 emergency contacts
- Location-based radius filtering (Haversine distance, graceful fallback if no nearby results)
- Google Maps integration with markers
- Category dropdown, search, radius controls
- Offline PWA mode via Service Worker
- User auth (register/login with JWT), admin role system

### Multi-City Support
- City field on all resources, city selector dropdown in filters
- GET /api/resources?city=X filters by city
- GET /api/resources/cities returns available cities
- Auto-detect user city from geolocation (planned)
- City dropdown only shows when 2+ cities exist

### Resource Cards
- "Get Directions" — deep-links to Google Maps
- "Share" — copy info, SMS share, native share
- "QR Code" — scannable QR for Google Maps directions
- "Claim & Verify" — business owners submit verification claims (free during beta)
- "Helpful?" thumbs up/down — anonymous rating, no login needed

### Verified Badge System
- Business owners claim resources via "Claim & Verify" button
- Claims go to admin for review (approve/reject)
- Verified resources: green badge, highlighted card, rank higher
- "Verified Only" filter toggle
- Admin can manually toggle verification on any resource
- Monetization: verification paid after beta period

### Admin Dashboard
- Stats: resources, verified, jobs, users, pending submissions, pending claims
- 3 tabs: Submissions, Verification Claims, All Resources
- Approve/reject user-submitted resources and claims
- Toggle verified status on any resource

### User-Submitted Resources
- "Suggest a Resource" page with interactive Google Maps pin drop
- Form with name, category, address, description, services
- Requires authentication, goes to admin for approval

## Key API Endpoints
- GET /api/resources (?category, ?verified_only, ?city)
- GET /api/resources/cities
- POST /api/resources/{id}/rate?vote=helpful|not_helpful
- GET /api/jobs, /api/benefits, /api/emergency
- POST /api/auth/register, /api/auth/login, GET /api/auth/me
- POST /api/resources/suggest, GET /api/resources/pending
- POST /api/resources/{id}/claim, GET /api/resources/claims
- POST /api/resources/{id}/toggle-verified
- GET /api/admin/stats

## Pending / Backlog
- P1: SMS Notifications via Twilio (mocked, needs Twilio keys)
- P2: Token storage security (localStorage -> httpOnly cookies)
- P2: Component refactoring (Community.js, Profile.js, Benefits.js, Auth.js)
