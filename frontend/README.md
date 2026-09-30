# AarogyaGrid AI — Frontend

Predict. Share. Respond.

## Public home page
The public entry route `/` introduces AarogyaGrid AI and CodeGoblins, with Login and Sign Up links, demo access, feature information, useful footer links and a compact expandable FAQ. The existing authenticated dashboard remains at `/dashboard`; all other app routes are preserved.

The shared logo links to home. It stays in the sidebar when expanded and appears in the top bar when collapsed or on mobile (as the compact A mark on small screens).

This source ZIP excludes generated `node_modules` and `dist` folders. Install dependencies before running it. Existing environment configuration is retained.

## Changes in this update
- Added `src/pages/Home.jsx`: public landing page, header auth links, demo entry, footer, FAQs and CodeGoblins branding.
- Added `src/pages/home.css`: responsive landing styles using the existing palette and shared components, plus persistent shell branding styles.
- Added `src/components/Brand.jsx`: reusable home-linked AarogyaGrid logo.
- Updated `src/App.jsx`: serves Home at `/`, preserving existing auth and protected routes.
- Updated `src/components/Shell.jsx`: shared sidebar branding and a logo in the top bar when the sidebar is hidden.
- Updated `src/main.jsx`: imports the new stylesheet.
- Updated `README.md`: entry-page, packaging and change notes.

Validation: production build passed; browser checks passed for header auth links, demo access, protected routes, all eight app pages, FAQ expansion, home layouts at 320/375/768/1024/1440 px and desktop/mobile sidebar branding. Live backend and Google sign-in integrations were not exercised. The build reports a non-blocking large-bundle warning.

## Run
1. `npm install`
2. Copy `.env.example` to `.env` if needed.
3. `npm run dev`

The login screen has **Demo Website** access, so judges can enter the dashboard without registration or a running backend. Sign Up stores a local demo account in the browser. When the Express/FastAPI services are available, the app attempts to use their APIs and falls back to demo data for a smooth hackathon presentation.

## Palette
- `#D8A2A2` — dusty rose
- `#FFDCDC` — soft pink (`#FFDCDC`)
- `#FFF9D6` — soft cream
- `#8EA66B` — sage green
