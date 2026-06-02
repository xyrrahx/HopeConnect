# HopeConnect - Product Requirements Document

## Problem Statement
A web app aimed at homeless/low-income individuals to find essential resources, jobs, and community support. Must include maps, SMS notifications, and pastel brutalism design. Must work **everywhere in the world**, not just specific seeded cities.

## Tech Stack
- **Frontend**: React, Framer Motion, Tailwind CSS, iconoir-react, qrcode.react
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic, httpx
- **Database**: MongoDB
- **Integrations**: Google Maps API (active), OpenStreetMap Overpass API (live resource discovery), Twilio SMS (mocked)

## What's Implemented

### Global Resource Discovery (OpenStreetMap)
- **Works anywhere in the world** — queries OpenStreetMap Overpass API for nearby resources
- Auto-detects user location and fetches live results for shelters, clinics, food banks, libraries, laundromats, pharmacies, community centres, etc.
- Results cached in MongoDB for 6 hours to minimize API calls
- Source filter tabs: "All Sources", "Community" (seeded/user-submitted), "Nearby (Live)" (OSM)
- Live results show "Live" badge on cards
- Completely free — no API key needed

### Core Features
- 93 community resources across New York + Toronto
- Multi-city support with city selector dropdown
- 3 job listings, 3 benefits, 4 emergency contacts
- Location-based radius filtering with graceful fallback
- Google Maps integration with markers
- Category, city, search, radius, verified, and source filters
- Offline PWA mode via Service Worker
- User auth with admin role system

### Resource Cards
- Get Directions, Share (copy/SMS/native), QR Code
- Claim & Verify for business owners (free beta)
- Thumbs up/down anonymous ratings
- Website link for OSM resources

### Verified Badge System
- Claim flow with admin approval, green badge, rank higher, filter toggle

### Admin Dashboard
- Stats, 3 tabs (Submissions, Claims, All Resources), toggle verified

### Code Quality (Applied)
- Removed hardcoded secrets from tests
- Removed all console.log/error statements
- Fixed array index keys, nested ternaries, Python comparison anti-patterns
- Fixed React hook dependency warnings

## Key API Endpoints
- GET /api/resources/discover?lat=X&lng=Y&radius_miles=Z (global live discovery)
- GET /api/resources (?category, ?verified_only, ?city)
- GET /api/resources/cities
- POST /api/resources/{id}/rate?vote=helpful|not_helpful
- POST /api/resources/{id}/claim, GET /api/resources/claims (admin)
- POST /api/resources/{id}/toggle-verified (admin)
- POST /api/resources/suggest, GET /api/resources/pending
- GET /api/admin/stats

## Pending / Backlog
- P1: SMS Notifications via Twilio (mocked, needs Twilio keys)
- P2: Token storage security
- P2: Further component refactoring
