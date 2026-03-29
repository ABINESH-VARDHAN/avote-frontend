# AVote Frontend

**React 18 · Vite · Hand-drawn doodle UI**

---

## Project Structure

```
avote-frontend/
├── index.html           ← HTML shell
├── vite.config.js       ← Vite + dev proxy to backend
├── .env.example         ← Copy to .env
├── public/
│   └── favicon.svg
└── src/
    ├── main.jsx         ← React root mount
    ├── App.jsx          ← Entire app (auth + notes UI)
    └── api.js           ← API client (talks to Express backend)
```

---

## Quick Start

### 1 · Install dependencies
```bash
cd avote-frontend
npm install
```

### 2 · Configure environment
```bash
cp .env.example .env
```

The default `.env` points to `http://localhost:5000/api` which matches
the backend running locally. No changes needed for local dev.

### 3 · Start backend first
Make sure the **avote-backend** server is running on port 5000.

### 4 · Start frontend
```bash
npm run dev
```

Opens at **http://localhost:5173**

---

## Build for Production

```bash
npm run build
# Output goes to dist/
```

Set `VITE_API_URL` in your `.env` to your deployed backend URL before building.

---

## How it connects to the backend

`src/api.js` handles all HTTP calls:

```js
import api from './api'

// Auth
await api.auth.register({ name, email, password })
await api.auth.login({ email, password })
api.auth.logout()

// Notes
await api.notes.getAll()
await api.notes.getAll({ search: 'biology' })
await api.notes.create({ title, body, pinned })
await api.notes.update(id, { title, body })
await api.notes.togglePin(id)
await api.notes.delete(id)
```

The Vite dev server proxies `/api/*` → `http://localhost:5000` so
there are no CORS issues during development.
