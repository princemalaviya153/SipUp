# Quick Setup Guide

## Installation

1. Install dependencies:
```bash
npm install
```

## Development

Start the development server:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

## Build for Production

```bash
npm run build
```

The production build will be in the `dist` folder.

## Admin Access

- Navigate to: `http://localhost:3000/admin`
- Username: `admin`
- Password: `sipup123`

## Features Implemented

✅ Hero section with animated fruit background
✅ Menu with tabs (Juices & Shakes / Fruit Plates)
✅ Customization modal with fruit selector
✅ Shopping cart sidebar
✅ Quick checkout (no login required)
✅ Admin dashboard with order management
✅ Order status tracking (New → Preparing → Ready → Completed)
✅ Sales tracking (Today/This Week)
✅ Smooth animations with Framer Motion
✅ Mobile-first responsive design
✅ PWA ready
✅ localStorage persistence

## Menu Items

All menu items from the requirements are included:
- 23 Juice & Shake items
- 2 Fruit Plate items
- All pricing and combinations as specified

## Design System

- Colors: Watermelon (#FF6B6B), Mint (#4ECDC4), Pineapple (#FFE66D)
- Fonts: Poppins (headings), Inter (body)
- Border radius: 16px
- Soft shadows throughout

Browser Support
-------------

Works on all modern browsers (Chrome, Firefox, Safari, Edge)

## Recent Updates

- ✅ Fixed UI: Prevented Scroll To Top button from overlapping the Cart sidebar (z-index adjusted).
