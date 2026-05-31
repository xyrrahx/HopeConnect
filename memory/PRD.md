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
- 19 resource categories with 93 total resources (57 NYC + 36 Toronto)
- Multi-city support: New York + Toronto with city selector dropdown
- 3 job listings, 3 benefits, 4 emergency contacts
- Location-based radius filtering with graceful fallback
- Google Maps integration with markers
- Category, city, search, radius, and verified filters
- Offline PWA mode via Service Worker
- User auth (register/login with JWT), admin role system

### Resource Cards
- "Get Directions" — deep-links to Google Maps
- "Share" — copy info, SMS share, native share
- "QR Code" — scannable QR for Google Maps directions
- "Claim & Verify" — business owners submit verification claims (free beta)
- "Helpful?" thumbs up/down — anonymous rating, no login needed

### Verified Badge System
- Claim & verify flow with admin approval
- Green verified badge, highlighted cards, rank higher
- "Verified Only" filter, admin manual toggle

### Admin Dashboard
- Stats: resources, verified, jobs, users, pending, claims
- 3 tabs: Submissions, Verification Claims, All Resources

### User-Submitted Resources
- Interactive Google Maps pin drop + form, admin approval

## Key API Endpoints
- GET /api/resources (?category, ?verified_only, ?city)
- GET /api/resources/cities
- POST /api/resources/{id}/rate?vote=helpful|not_helpful
- POST /api/resources/{id}/claim
- GET /api/resources/claims (admin)
- POST /api/resources/{id}/toggle-verified (admin)
- POST /api/resources/suggest, GET /api/resources/pending
- GET /api/admin/stats

## Pending / Backlog
- P1: SMS Notifications via Twilio (mocked, needs Twilio keys)
- P2: Token storage security
- P2: Component refactoring
