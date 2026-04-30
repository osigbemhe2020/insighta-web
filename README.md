# Insighta Labs+ — Web Portal

The web interface for the Insighta Labs+ Profile Intelligence System. Built with Next.js App Router, deployed on Vercel.

---

## Live URL

[https://your-portal-url.vercel.app](https://your-portal-url.vercel.app)

---

## Pages

| Page | Route | Access |
|---|---|---|
| Login | `/` | Public |
| Dashboard | `/dashboard` | Authenticated |
| Profiles List | `/profiles` | Authenticated |
| Profile Detail | `/profiles/[id]` | Authenticated |
| Natural Language Search | `/search` | Authenticated |
| Account | `/account` | Authenticated |

---

## Running Locally

```bash
git clone https://github.com/your-username/insighta-web.git
cd insighta-web
npm install

# Copy env file and fill in your backend URL
cp .env.local.example .env.local

npm run dev
```

Visit `http://localhost:3000`

---

## Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Your deployed backend URL — used in browser API calls |
| `BACKEND_URL` | Same URL — used in server-side code |

Set these in Vercel under **Project Settings → Environment Variables** before deploying.

---

## System Architecture

```
Browser
  │
  ├── Next.js Web Portal (Vercel)
  │     ├── middleware.js        — auth guard, redirects unauthenticated users to /
  │     ├── lib/api.js           — axios instance with auto token refresh + X-API-Version header
  │     ├── app/page.js          — login page
  │     ├── app/dashboard/       — metrics overview
  │     ├── app/profiles/        — list, filter, paginate, detail view
  │     ├── app/search/          — natural language search
  │     └── app/account/         — current user info
  │
  └── Backend API (Node.js / Express)
        ├── /auth/github          — OAuth initiation
        ├── /auth/github/callback — sets HTTP-only cookies
        ├── /auth/refresh         — rotates token pair
        ├── /auth/logout          — revokes refresh token in DB
        ├── /auth/me              — current user info
        └── /api/profiles/*       — profile CRUD, search, export
```

---

## Authentication Flow

1. User clicks **Continue with GitHub** on the login page
2. Browser redirects to `GET /auth/github` on the backend
3. Backend generates PKCE values + state, stores them in short-lived cookies, redirects to GitHub
4. User approves the app on GitHub
5. GitHub redirects to `/auth/github/callback` on the backend
6. Backend exchanges the code for a GitHub token, fetches user data, upserts the user in MongoDB
7. Backend generates a JWT access token (3 min) and refresh token (5 min)
8. Backend sets both as **HTTP-only cookies** on the response and redirects to `/dashboard`
9. All subsequent API calls include the cookies automatically — tokens never touch JavaScript
10. When the access token expires, `lib/api.js` intercepts the 401 and calls `POST /auth/refresh` automatically
11. On logout, `POST /auth/logout` is called — the backend revokes the refresh token in MongoDB and the cookies are cleared

---

## Token Handling

Tokens are stored exclusively in **HTTP-only cookies** set by the backend:

| Cookie | Expiry | Accessible to JS |
|---|---|---|
| `access_token` | 3 minutes | No |
| `refresh_token` | 5 minutes | No |

The browser sends these automatically on every request to the backend. The portal's JavaScript code never reads or stores them — this prevents XSS attacks from stealing tokens.

**Auto-refresh:** `lib/api.js` uses an Axios response interceptor. On any 401 response, it immediately calls `POST /auth/refresh` (cookies sent automatically) and retries the original request with the new token. If the refresh also fails, the user is redirected to the login page.

---

## CSRF Protection

State-changing requests (POST, DELETE) are protected by the PKCE `state` parameter during OAuth and by the HTTP-only cookie + `SameSite: strict` policy which prevents cross-origin requests from including the cookies automatically.

---

## Role Enforcement

Role checking is enforced entirely on the backend. The portal respects it by:
- Showing admin-only actions (create, delete) only when `user.role === 'admin'`
- Handling 403 responses from the API gracefully with an error message

---

## CI

GitHub Actions runs on every push and PR to `main`:
- Installs dependencies on Node 18 and Node 20
- Runs `npm run build` to verify the Next.js build succeeds
- Uses a placeholder `NEXT_PUBLIC_BACKEND_URL` so the build doesn't fail without real credentials
