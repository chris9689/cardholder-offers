# Cardholder Offers

This is a Vite + React + TypeScript application.

## Run locally

Prerequisites: Node.js

1. Install dependencies:
   `npm install`
2. Start the dev server:
   `npm run dev`
3. Open the app in your browser:
   `http://localhost:3000`

## Dynamic Yield Server API

Server-side Dynamic Yield calls are proxied through Vercel functions:

- `api/dy/pageview.js` -> `https://dy-api.com/v2/collect/user/pageview`
- `api/dy/choose.js` -> `https://dy-api.com/v2/serve/user/choose`

Set this environment variable in Vercel project settings:

- `DY_API_KEY` = your Dynamic Yield API key

## Scripts

- `npm run dev` - start local development server
- `npm run build` - build production assets
- `npm run preview` - preview the production build
- `npm run lint` - run TypeScript type-checking
