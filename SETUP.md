# Project Setup Guide

This project is split into two separate applications:

## 📁 Project Structure

```
awesome-javascript-interviews/
├── client/          # React + Vite frontend application
├── server/          # Express.js backend API server
├── scripts/         # Build scripts (data generation)
└── [content folders]/  # Interview question content
```

## 🚀 Quick Start

### 1. Install Dependencies

Install dependencies for all parts of the project:

```bash
npm run install:all
```

This will install:
- Root dependencies (build tools)
- Client dependencies (React, Vite, etc.)
- Server dependencies (Express, etc.)

Or install individually:

```bash
# Root dependencies
npm install

# Client dependencies
cd client && npm install

# Server dependencies
cd server && npm install
```

### 2. Development Mode

#### Option A: Run Both Together (Recommended)

```bash
npm run dev:all
```

This starts:
- Express server on `http://localhost:3000`
- Vite dev server on `http://localhost:5173`

#### Option B: Run Separately

**Terminal 1 - Start Express Server:**
```bash
npm run dev:server
# or
cd server && npm run dev
```

**Terminal 2 - Start Vite Dev Server:**
```bash
npm run dev
# or
cd client && npm run dev
```

### 3. Production Build

```bash
# Generate static data and build client
npm run build

# Start production server
npm start
```

The server will serve the built React app from `client/dist/`.

## 📦 Package Structure

### Root `package.json`
- **Purpose**: Orchestration scripts and shared tooling
- **Dependencies**: `concurrently` (for running both apps)
- **Scripts**: Commands to manage client and server together

### `client/package.json`
- **Purpose**: React frontend application
- **Dependencies**: 
  - `react`, `react-dom`, `react-router-dom`
  - `marked` (Markdown parsing)
- **Dev Dependencies**: 
  - `vite`, `@vitejs/plugin-react`
  - `typescript`, `@types/react`
- **Type**: ES Modules (`"type": "module"`)

### `server/package.json`
- **Purpose**: Express API server
- **Dependencies**: 
  - `express`
- **Type**: CommonJS (`"type": "commonjs"`)

## 🔧 Available Scripts

### Root Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server (client) |
| `npm run dev:server` | Start Express server |
| `npm run dev:all` | Start both client and server concurrently |
| `npm run build` | Generate data + build client for production |
| `npm run build:data` | Generate static data.json |
| `npm run preview` | Preview production build |
| `npm start` | Start production server |
| `npm run install:all` | Install all dependencies |

### Client Scripts (`cd client`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Vite dev server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |

### Server Scripts (`cd server`)

| Script | Description |
|--------|-------------|
| `npm run dev` | Start Express server |
| `npm start` | Start Express server (production) |

## 🌐 Ports

- **Client (Vite)**: `http://localhost:5173`
- **Server (Express)**: `http://localhost:3000`
- **API Proxy**: Vite automatically proxies `/api/*` requests to Express server

## 📝 Development Workflow

1. **Start both servers**:
   ```bash
   npm run dev:all
   ```

2. **Open browser**: Navigate to `http://localhost:5173`

3. **Make changes**:
   - Edit React components in `client/src/`
   - Edit server routes in `server/server.js`
   - Hot Module Replacement (HMR) will update automatically

4. **Build for production**:
   ```bash
   npm run build
   npm start
   ```

## 🏗️ Architecture

### Client (React + Vite)
- **Framework**: React 19
- **Router**: React Router v7
- **Build Tool**: Vite 5
- **Language**: TypeScript/JavaScript
- **Entry**: `client/src/index.jsx`
- **Output**: `client/dist/`

### Server (Express)
- **Framework**: Express.js
- **Language**: JavaScript (CommonJS)
- **Entry**: `server/server.js`
- **Port**: 3000
- **API Routes**: `/api/*`

### Data Flow

```
Browser → Vite Dev Server (5173) → Proxy → Express API (3000) → File System
```

In production:
```
Browser → Express Server (3000) → Built React App (dist/) + API
```

## 📂 Important Files

- `client/vite.config.js` - Vite configuration
- `client/tsconfig.json` - TypeScript configuration
- `server/server.js` - Express server and API routes
- `scripts/generate-static-data.js` - Generates `client/public/data.json`

## 🔍 Troubleshooting

### Port Already in Use

**Change Vite port** (`client/vite.config.js`):
```javascript
server: {
  port: 5174, // Change port
}
```

**Change Express port** (`server/server.js`):
```javascript
const port = 3001; // Change port
```

### Dependencies Not Found

Make sure you've installed dependencies in all directories:
```bash
npm run install:all
```

### Build Errors

1. Clear cache:
   ```bash
   rm -rf client/dist client/node_modules/.vite
   ```

2. Reinstall:
   ```bash
   cd client && rm -rf node_modules && npm install
   ```

### API Not Working

1. Ensure Express server is running
2. Check proxy configuration in `client/vite.config.js`
3. Verify CORS settings in `server/server.js`

---

**Last Updated**: 2025

