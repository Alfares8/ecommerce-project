# Ecommerce Platform — Docker Quickstart

## Prereqs
- Docker & Docker Compose

## Setup
Create a `.env` for the backend if you want to override defaults (optional):

```
PORT=4000
MONGO_URI=mongodb://mongo:27017/ecommerce
JWT_SECRET=change_me_please
CORS_ORIGIN=http://localhost:5173
STRIPE_SECRET_KEY=
```

Frontend `.env` (optional):
```
VITE_API_BASE=http://localhost:4000/api
VITE_STRIPE_PK=pk_test_12345
```

## Run
```bash
docker compose up --build
```

Services:
- Frontend: http://localhost:5173
- Backend API: http://localhost:4000/api
- Mongo Express: http://localhost:8081

## Notes
- CORS is preconfigured to allow `http://localhost:5173`.
- The backend connects to `mongodb://mongo:27017/ecommerce` inside the Compose network.
- To seed data, open a shell in the backend container and run `node src/controllers/seed.js` (or add a script).
