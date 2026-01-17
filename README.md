# Everspring API - Vercel Serverless Functions

Backend serverless functions for the pflanzenXL Everspring integration.

## Quick start

1) Deploy this repo to Vercel.
2) In Vercel Project → Settings → Environment Variables set:
- EVERSPRING_API_KEY
- EVERSPRING_BASE_URL (https://api.test.everspring.app/v1/channels)
- EVERSPRING_CHANNEL_ID (PLACEHOLDER until onboarding)
- CORS_ORIGIN (your Horizon domains)
- LOG_LEVEL (info)
- ADMIN_TOKEN (your own random bearer token)

## Endpoints

- GET /api/catalog
- GET /api/product?id=...
- POST /api/order
- GET /api/orderStatus?id=LOCAL_ORDER_ID
- GET /api/orderTracking?id=LOCAL_ORDER_ID
- POST /api/admin/importProductcodes (requires Authorization: Bearer <ADMIN_TOKEN>)

## Notes

- This is "pre-onboarding" ready. With EVERSPRING_CHANNEL_ID=PLACEHOLDER you may get 401/404 from supplier, which is expected.
