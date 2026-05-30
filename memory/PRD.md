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
- Location-based radius filtering (Haversine distance)
- Google Maps integration with markers
- Category dropdown filter, search, radius controls
- Offline PWA mode via Service Worker
- User auth (register/login with JWT), admin role system

### Resource Cards
- **"Get Directions"** — deep-links to Google Maps
- **"Share"** — copy info, SMS share, native share
- **"QR Code"** — scannable QR for Google Maps directions
- **"Claim & Verify"** — business owners submit verification claims (free during beta)

### Verified Badge System
- Business owners can claim resources via "Claim & Verify" button
- Claims go to admin for review (approve/reject)
- Approved resources get green verified badge + highlighted card styling
- Verified resources rank higher in search results (sorted first)
- "Verified Only" filter toggle on resources page
- Admin can manually toggle verification on any resource
- Monetization hook: verification will be paid after beta period

### Admin Dashboard
- Stats overview (resources, verified, jobs, users, pending, claims)
- 3 tabs: Submissions, Verification Claims, All Resources
- Approve/reject user-submitted resources
- Approve/reject verification claims
- Toggle verified status on any resource

### User-Submitted Resources
- "Suggest a Resource" page with interactive Google Maps pin drop
- Form with name, category, address, description, services
- Requires authentication
- Goes to admin for approval before going live

## Key API Endpoints
- GET /api/resources (?category, ?verified_only)
- GET /api/jobs, /api/benefits, /api/emergency
- POST /api/auth/register, /api/auth/login, GET /api/auth/me
- POST /api/resources/suggest (auth)
- GET /api/resources/pending (admin)
- POST /api/resources/pending/{id}/approve|reject (admin)
- POST /api/resources/{id}/claim (auth)
- GET /api/resources/claims (admin)
- POST /api/resources/claims/{id}/approve|reject (admin)
- POST /api/resources/{id}/toggle-verified (admin)
- GET /api/admin/stats (admin)

## Pending / Backlog
- P1: SMS Notifications via Twilio (mocked, needs user's Twilio keys)
- P2: Token storage security (localStorage → httpOnly cookies)
- P2: Component refactoring (Community.js, Profile.js, Benefits.js, Auth.js)
