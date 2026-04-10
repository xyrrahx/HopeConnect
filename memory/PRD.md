# HopeConnect - Product Requirements Document

## Problem Statement
A web app aimed at homeless/low-income individuals to find essential resources, jobs, and community support. Must include maps, SMS notifications, and a pastel brutalism design aesthetic.

## Core Requirements
- 19 resource categories (Shelters, Food, Washrooms, Laundromats, Clothing Banks, WiFi, Legal Aid, ID Services, Harm Reduction, etc.)
- Job listings with location-based radius filtering
- Google Maps integration
- SMS notifications (Twilio)
- Easy to navigate, pastel brutalism design
- Offline mode (PWA Service Worker)

## Tech Stack
- **Frontend**: React, Framer Motion, Tailwind CSS, iconoir-react
- **Backend**: FastAPI, Motor (async MongoDB), Pydantic
- **Database**: MongoDB
- **Integrations**: Google Maps API (active), Twilio SMS (mocked)

## What's Implemented
- Full-stack app with 55 seeded resources across 19 categories
- 3 seeded job listings
- 3 benefits, 4 emergency contacts
- User auth (register/login with JWT)
- Location-based radius filtering (Haversine distance)
- Google Maps integration with markers
- Category dropdown filter, search, radius controls
- "Get Directions" deep-links to Google Maps on Resource & Job cards
- Favorites system (auth required)
- Community posts, Benefits page, Emergency contacts
- Offline PWA mode via Service Worker
- Modular component architecture (ResourceCard, ResourceFilters, LocationInfo, hooks)
- Refactored startup_db into clean seed functions

## Pending / Backlog
- P1: SMS Notifications via Twilio (currently mocked, needs user's Twilio keys)
- P1: Interactive map for user-submitted resources with admin approval flow
- P2: Token storage security (move from localStorage to httpOnly cookies)
- P2: Further component refactoring (Community.js, Profile.js, Benefits.js, Auth.js)

## Admin / Test Credentials
- Demo user: demo@hopeconnect.com / demo123
