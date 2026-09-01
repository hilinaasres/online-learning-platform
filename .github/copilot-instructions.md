<!-- .github/copilot-instructions.md - guidance for AI coding agents on this repo -->
# Copilot / AI Agent Instructions — physics-website

This repo is a small two-part site: a Vite + React frontend (`physics-frontend`) and a minimal Express backend (`physics-backend`). Below are focused, actionable rules and pointers so an AI coding agent can be productive immediately.

- **Big picture**: Frontend is a SPA built with Vite + React (see `physics-frontend/`). Backend is an Express server listening on port 5000 (see `physics-backend/server.js`). There is no built-in proxy configuration — frontend API calls should target `http://localhost:5000` unless you add a proxy.

- **Key files/dirs to inspect**:
  - `physics-frontend/package.json` — scripts: `dev`, `build`, `preview`, and `lint`.
  - `physics-frontend/vite.config.js` — Vite + React plugin config.
  - `physics-frontend/src/` — React entry (`main.jsx`) and UI in `App.jsx`.
  - `physics-backend/server.js` — Express app, CORS enabled, listens on port 5000.
  - `physics-backend/package.json` — currently malformed/duplicated JSON. Be careful when editing.
  - `physics-frontend/README.md` and `eslint.config.js` — helpful for build & lint conventions.

- **How to run locally (commands)**:
  - Frontend: from `physics-frontend` run:

    npm install
    npm run dev

  - Backend: from `physics-backend` run (two options):

    node server.js
    npx nodemon server.js  # uses dependency already declared

  - Build frontend for production:

    npm run build --prefix physics-frontend

- **Common developer expectations / patterns**:
  - Frontend uses modern React (React 19) with Vite HMR. Files reference assets in `public/` (e.g., `/vite.svg`). Keep absolute `/` paths for public assets.
  - Backend is intentionally minimal: CORS and JSON body parsing enabled. Expect endpoints to be added in `physics-backend/server.js` or new route files imported there.
  - No automated tests are present. Avoid assuming test harnesses exist.

- **Project-specific gotchas** (do not change without human confirmation):
  - `physics-backend/package.json` appears corrupted (duplicate JSON blocks). If you propose edits, fix structure and add helpful npm scripts (`start`, `dev`) but keep `type: "module"` intact.
  - There is no frontend↔backend proxy; cross-origin requests are allowed by backend CORS but CI/dev may expect explicit host/ports.

- **When making changes**:
  - Prefer small, focused edits and run the local dev steps above to validate behavior.
  - For backend changes, run `node server.js` and confirm `Server running on http://localhost:5000` appears.
  - For frontend changes, run `npm run dev` in `physics-frontend` and verify HMR and that the site loads at the Vite dev URL.

- **Examples to reference when creating code**:
  - Add a new GET route: modify `physics-backend/server.js` and export nothing — the file is the entrypoint.
  - Consume backend from React: call `fetch('http://localhost:5000/your-route')` from components or a small API helper in `physics-frontend/src/`.

If any section is unclear or you want stricter rules (for example: linting autofixes, commit message format, or required tests), tell me which area and I will extend this file accordingly.
