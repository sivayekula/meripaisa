# Meripaisa — daily expense & income tracker

React Native (Expo) app + NestJS API + MongoDB.

## Backend
cd backend && cp .env.example .env   # set MONGO_URI and JWT_SECRET
npm install && npm run start:dev     # http://localhost:3000
Default categories/subcategories are seeded on first start.

## Mobile
cd mobile && cp .env.example .env    # set EXPO_PUBLIC_API_URL
npm install && npx expo start
- Android emulator: http://10.0.2.2:3000
- iOS simulator: http://localhost:3000
- Real phone: http://<your-computer-LAN-IP>:3000

## API
POST /auth/signup | /auth/login      (email or phone + password)
GET/PATCH /users/me, PATCH /users/me/password
GET /categories?type=  POST /categories  POST /categories/:id/subcategories
POST /transactions  GET /transactions?type&from&to  GET /transactions/summary?from&to
PATCH/DELETE /transactions/:id       (only within 5 days of creation, enforced server-side)
