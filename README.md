# APEX RN Prep

A full-stack foundation for the APEX RN Prep 11-week live online NCLEX-RN program.

## Requirements

- Node.js 20+
- npm 10+
- MySQL 8+ for persistent production data

## Install

```bash
npm install --prefix server
npm install --prefix client
```

Copy `.env.example` to `server/.env`, set `DB_NAME=apexrn`, and fill in the MySQL and JWT values. The API can boot without MySQL using its in-memory seed data, which is useful for design review.

## Run

Each app has its own package and dependencies. Run the API and the client in two terminals:

```bash
npm run dev --prefix server
npm run dev --prefix client
```

The public client runs at `http://localhost:5173`. The API runs at `http://localhost:5000`.

## Build and production

```bash
npm run build --prefix client
npm start --prefix server
```

## Database

Use the existing MySQL database named `apexrn`, then run `npm run schema --prefix server`. This applies any pending versioned SQL files from `server/migrations/` in filename order and records them in a `migrations` table, so re-running only applies new files. The server reads all credentials from the environment. Run `npm run seed --prefix server` after configuring MySQL to create the initial admin using `SEED_ADMIN_EMAIL` and `SEED_ADMIN_PASSWORD`.

## Admin

The admin workspace is available at `/admin/login`. The client login is wired to the admin surface; production authentication is provided by the API endpoint `POST /api/auth/login`.

## API structure

Public resources are available through `/api/home`, `/api/about`, `/api/program`, `/api/testimonials`, `/api/faqs`, `/api/resources`, `/api/contact`, and `/api/qa/register`. Protected management routes live below `/api/admin` and use a JWT bearer token.

The client communicates through the API service boundary, so the `client` and `server` directories can be moved into separate projects later with only the API base URL changed.
