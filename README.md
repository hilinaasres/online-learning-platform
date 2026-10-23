# Learnify — Online Learning Platform

Learnify is a full-stack learning platform prototype for students, instructors, and administrators. It currently includes student registration, bcrypt password hashing, JWT authentication, role-protected API access, instructor-shared notes and quizzes, messaging, and grade records. Course management, expanded assessments, notifications, and deployment preparation are planned in later phases.

## Technology

- React 19 and Vite
- Node.js and Express
- MongoDB and Mongoose

## Project layout

```text
Online Learning Platform/
├── Online Learning Platform-frontend/   # React + Vite SPA
│   └── src/
│       ├── api/
│       ├── components/
│       ├── hooks/
│       └── pages/
├── Online Learning Platform-backend/    # Express + Mongoose API
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   └── services/
├── .env.example
└── README.md
```

## Prerequisites

- Node.js 20.19+ (or 22.12+)
- npm
- MongoDB running locally or a MongoDB Atlas connection string

## Local setup

From the repository root, copy the example environment files:

```powershell
Copy-Item "Online Learning Platform-backend\.env.example" "Online Learning Platform-backend\.env"
Copy-Item "Online Learning Platform-frontend\.env.example" "Online Learning Platform-frontend\.env"
```

On macOS/Linux, use `cp` with the same paths.

Install dependencies:

```powershell
Set-Location "Online Learning Platform-backend"
npm install
Set-Location "..\Online Learning Platform-frontend"
npm install
```

Set `MONGODB_URI` and a strong `JWT_SECRET` in the backend `.env`. Generate a secret with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Then seed demo accounts and sample content:

```powershell
Set-Location "..\Online Learning Platform-backend"
npm run seed
```

The seed command creates or updates only the demo records. It does not clear other documents in the database. Run the API and frontend in separate terminals:

```powershell
# Terminal 1
Set-Location "Online Learning Platform-backend"
npm run dev
```

```powershell
# Terminal 2
Set-Location "Online Learning Platform-frontend"
npm run dev
```

- Frontend: <http://localhost:5173>
- API health check: <http://localhost:5001/health>

## Demo accounts

All demo accounts use `Password123!`.

| Role | Email |
| --- | --- |
| Admin | `admin@learnify.dev` |
| Instructor | `instructor1@learnify.dev` |
| Instructor | `instructor2@learnify.dev` |
| Student | `student1@learnify.dev` |
| Student | `student2@learnify.dev` |
| Student | `student3@learnify.dev` |

Public registration is intended for student accounts.

## Environment variables

| Variable | App | Purpose |
| --- | --- | --- |
| `PORT` | Backend | API port (default: `5001`) |
| `MONGODB_URI` | Backend | MongoDB connection string |
| `FRONTEND_URL` | Backend | Frontend origin for CORS (default: `http://localhost:5173`) |
| `JWT_SECRET` | Backend | Random secret used to sign access tokens (at least 32 characters) |
| `VITE_API_URL` | Frontend | API base URL (default: `http://localhost:5001`) |

Use the root or app-specific `.env.example` files as templates. Never commit `.env` files or real credentials.

## Available scripts

**Backend**

- `npm start` — start the API
- `npm run dev` — start the API with Node.js watch mode
- `npm run seed` — create or update the demo data

**Frontend**

- `npm run dev` — start the Vite development server
- `npm run build` — create a production build
- `npm run preview` — preview the production build locally
- `npm run lint` — run ESLint

## Security notes

- Passwords use bcrypt hashes. On API startup, existing plaintext password records are migrated automatically; the seed script also stores demo passwords as hashes.
- All data endpoints require a valid JWT. Registration creates student accounts only; admin and instructor accounts are provisioned separately.
- The API restricts browser CORS to `FRONTEND_URL`, validates request bodies, applies Helmet headers, and rate-limits login attempts.
- Set a unique, randomly generated `JWT_SECRET` before starting the API; the example file leaves it blank.
- The UI still uses some placeholder dashboard summaries, and the course/module/lesson workflow is planned for Phase 3.
