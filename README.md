# AltMedi: Medicine Alternative, Safety & Price Comparison

AltMedi is a production-grade healthcare affordability and clinical decision-support platform for India. It translates handwritten prescriptions, matches bioequivalent generics (including PMBJP Jan Aushadhi equivalents with up to 90% savings), checks real-time local pharmacy stock, and maintains human-in-the-loop clinical governance.

---

## 📁 Project Architecture

The codebase is organized into two completely separated and decoupled subprojects:

```
Altmedi/
├── frontend/               # React 19, Vite, Tailwind CSS, i18n, PWA
│   ├── src/                # UI components, state, services, types
│   ├── public/             # Web manifest, icons, service worker
│   ├── package.json        # Independent frontend dependencies
│   ├── vite.config.ts      # Bundler config with /api proxy to backend:3001
│   ├── tsconfig.json       # Frontend TypeScript config
│   └── .env                # VITE_API_URL=/api/v1
│
├── backend/                # Node.js, Express, TypeScript, Prisma ORM
│   ├── src/                # REST API routes, middleware, services, types
│   ├── prisma/             # PostgreSQL database schema & seed scripts
│   ├── package.json        # Independent backend dependencies
│   ├── tsconfig.json       # Backend TypeScript config
│   └── .env                # Database URL, API port, Supabase keys
│
├── README.md               # Root setup & documentation
├── package.json            # Root orchestration scripts
└── .gitignore              # Monorepo ignore rules
```

---

## 🚀 Quick Start (Single-Command)

You can install all dependencies and run both servers from the project root:

### 1. Install All Dependencies
```bash
npm run install:all
```
*(Installs both `frontend/node_modules` and `backend/node_modules`)*

### 2. Generate Prisma Database Client
```bash
npm run db:generate
```

### 3. Run Both Servers Concurrently
```bash
npm run dev
```
- **Frontend App**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:3001/api/v1](http://localhost:3001/api/v1)

---

## 🛠️ Manual & Independent Setup

Each subproject can be installed, configured, and run independently.

### 🌐 Frontend Setup (`frontend/`)

1. **Navigate to the frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   *Default `.env`: `VITE_API_URL=/api/v1` (automatically proxied to port 3001 by Vite).*

4. **Start the frontend development server**:
   ```bash
   npm run dev
   ```
   Access the app at [http://localhost:3000](http://localhost:3000).

5. **Build for production**:
   ```bash
   npm run build
   ```

6. **Type-check**:
   ```bash
   npm run lint
   ```

---

### ⚙️ Backend Setup (`backend/`)

1. **Navigate to the backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure environment**:
   ```bash
   cp .env.example .env
   ```
   Ensure `DATABASE_URL` and `API_PORT=3001` are populated.

4. **Generate Prisma Client & Seed**:
   ```bash
   npm run db:generate
   npm run db:seed
   ```

5. **Start the backend development server**:
   ```bash
   npm run dev
   ```
   API runs at [http://localhost:3001](http://localhost:3001).

6. **Health check**:
   ```bash
   curl http://localhost:3001/api/v1/health
   # Returns: {"status":"ok","database":"connected"}
   ```

---

## 📜 Root Orchestration Scripts

From the root `Altmedi/` directory:

| Command | Action |
|:---|:---|
| `npm run install:all` | Installs dependencies in both `frontend/` and `backend/` |
| `npm run dev` | Runs backend and frontend development servers |
| `npm run dev:frontend` | Starts only the frontend Vite server |
| `npm run dev:backend` | Starts only the backend API server |
| `npm run build` | Builds the production bundle in `frontend/dist/` |
| `npm run db:generate` | Generates the Prisma client in `backend/` |
| `npm run db:seed` | Seeds the database with default catalog, users, and tenants |
| `npm run lint` | Runs TypeScript checks for both frontend and backend |

---

## 🔒 Security & Separation Rules

- **Strict Separation**: The frontend communicates with the backend solely via REST API calls (`/api/v1/...`).
- **No Shared Source Dependencies**: The frontend never directly imports backend files or Prisma runtime libraries.
- **Independent Environments**: Frontend environment variables are prefixed with `VITE_` and never expose server secrets or database passwords.
