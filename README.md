# MythicHeats – University Submission

## Project Structure

```
├── backend/          → Backend logic (Supabase Edge Functions, config, migrations)
│   └── supabase/
├── database/         → Database schema (schema.sql with all table definitions & RLS policies)
├── docs/             → Documentation (Word files, reports – uploaded manually)
├── src/              → Frontend source code (React + TypeScript)
├── public/           → Static assets
├── package.json      → Frontend dependencies
└── README.md         → This file
```

> **Note for TA:** The root directory serves as the **Frontend** folder for deployment purposes.
> The React app runs directly from the project root. Please `cd .` (stay in root) to run the frontend.

## How to Run the Frontend

```sh
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```

The app will be available at `http://localhost:5173`.

## Tech Stack

| Layer      | Technology                          |
|------------|-------------------------------------|
| Frontend   | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| Backend    | Supabase (Edge Functions, Auth, RLS) |
| Database   | PostgreSQL (hosted via Supabase)     |
| Auth       | Google OAuth (restricted to @lhr.nu.edu.pk) |

## Backend

The `backend/supabase/` folder contains:
- **Edge Functions** – Serverless functions (e.g., Google Sheets sync)
- **Migrations** – SQL migration files for database schema changes
- **config.toml** – Supabase project configuration

## Database

The `database/schema.sql` file contains the complete database schema including:
- All table definitions (usernames, chat_messages, courses, notifications, google_sheets_data)
- Row-Level Security (RLS) policies for each table

## Authentication

- Google OAuth login restricted to `@lhr.nu.edu.pk` domain
- Admin bypass for designated owner email
- Auto-generated usernames from Google metadata + roll number

## Live Deployment

- **URL:** https://mythicheats.lovable.app
