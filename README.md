# digital-id-web — Digital ID (React frontend)

A React 19 single-page application with JWT-based authentication, user profiles, and account management. Built with Vite for fast development and optimized production builds.

## Features

- **Authentication** — Login with username, email, or phone number. Register with real-time availability checks (debounced) for username, email, and phone.
- **Password Management** — Forgot password (email reset link), reset password via token, and change password for authenticated users. Live password strength checklist enforces rules (length, uppercase, lowercase, digit, special character).
- **User Profile** — View account details including name, username, email, phone, date of birth, gender, role, status, and last login.
- **Settings** — Change password with validation. Placeholders for Notifications and Privacy sections.
- **Protected Routes** — Home, Profile, and Settings require authentication; unauthenticated users are redirected to the login page.
- **404 Handling** — Custom page for unknown routes.

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 |
| Build Tool | Vite (with rolldown-vite) |
| Routing | react-router-dom 7 |
| Styling | Plain CSS (dark theme, gradient background) |
| State | React hooks (`useState`, `useEffect`) |
| Linting | ESLint 9 (flat config) |

## Project Structure

```
src/
├── main.jsx                  # Entry point (StrictMode, BrowserRouter)
├── App.jsx                   # Routes and AuthScreen (login/register)
├── api/
│   └── auth.js               # API layer (JWT, login, register, etc.)
├── components/
│   └── Layout.jsx            # Header, nav dropdown, footer
├── pages/
│   ├── Home.jsx              # Dashboard
│   ├── Profile.jsx           # User profile
│   └── Settings.jsx          # Settings and change password
└── utils/
    └── passwordValidation.js # Password rules and validation helpers
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- A running backend API (default: `http://localhost:8080`)

### Installation

```bash
npm install
```

### Environment

Create a `.env` file in the project root:

```
VITE_API_BASE_URL=http://localhost:8080
```

### Development

```bash
npm run dev
```

### Production Build

```bash
npm run build
npm run preview
```

### Linting

```bash
npm run lint
```

## API Endpoints

The app expects a backend with the following endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/auth/me` | Get current user |
| GET | `/api/auth/check-availability` | Check username/email/phone availability |
| POST | `/api/auth/forgot-password` | Send password reset email |
| POST | `/api/auth/reset-password` | Reset password with token |
| POST | `/api/auth/change-password` | Change password (authenticated) |

Authentication uses JWT tokens stored in `localStorage`.
