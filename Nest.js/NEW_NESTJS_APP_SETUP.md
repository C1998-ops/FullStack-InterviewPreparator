# Setting Up a New NestJS Application

## Quick Setup Guide

### 1. Create New NestJS Project (Separate Directory)

```bash
# Navigate to your projects directory (outside current app)
cd E:\Projects

# Create new NestJS application
nest new my-nestjs-app
# Or with custom name
nest new interview-prep-backend

cd my-nestjs-app
```

### 2. Initial Project Structure

```
my-nestjs-app/
├── src/
│   ├── main.ts                 # Entry point
│   ├── app.module.ts          # Root module
│   ├── app.controller.ts      # Example controller
│   └── app.service.ts         # Example service
├── test/                      # E2E tests
├── .env                       # Environment variables
├── package.json
└── tsconfig.json
```

### 3. Install Core Dependencies

```bash
# Core NestJS packages
npm install @nestjs/common @nestjs/core @nestjs/platform-express

# Authentication
npm install @nestjs/passport @nestjs/jwt passport passport-google-oauth20 passport-jwt

# OpenAI
npm install openai

# Configuration
npm install @nestjs/config

# Microservices (if needed)
npm install @nestjs/microservices

# File handling
npm install multer @types/multer

# PDF parsing
npm install pdf-parse

# Validation
npm install class-validator class-transformer

# Dev dependencies
npm install --save-dev @types/passport-google-oauth20 @types/passport-jwt
```

### 4. Environment Setup

Create `.env` file:
```env
# Application
PORT=3000
NODE_ENV=development

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# JWT
JWT_SECRET=your_jwt_secret_key

# CORS (if connecting to your Express app frontend)
CORS_ORIGIN=http://localhost:5173
```

### 5. Configure Main Application

Update `src/main.ts`:
```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Enable CORS (if needed for your Express app's frontend)
  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
  });
  
  // Global validation pipe
  app.useGlobalPipes(new ValidationPipe());
  
  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`NestJS Application running on http://localhost:${port}`);
}
bootstrap();
```

### 6. Recommended Module Structure

```bash
# Generate modules for your new app
nest g module auth
nest g controller auth
nest g service auth

nest g module openai
nest g service openai

nest g module resume  # or whatever your domain is
nest g controller resume
nest g service resume
```

### 7. Connect to Your Express App (Optional)

If you want both apps to work together:

**Option A: Separate Ports**
- Express app: `http://localhost:3000` (current)
- NestJS app: `http://localhost:3001` (new)

**Option B: NestJS as API, Express as Static Server**
- NestJS: `http://localhost:3001` (API only)
- Express: `http://localhost:3000` (serves frontend, proxies API calls)

**Option C: Full NestJS**
- Migrate frontend serving to NestJS
- Single port for everything

### 8. Development Scripts

Update `package.json`:
```json
{
  "scripts": {
    "dev": "nest start --watch",
    "start": "nest start",
    "start:prod": "node dist/main",
    "build": "nest build",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

### 9. Running Both Apps Together

If you need both apps running:

**Terminal 1 (Express app):**
```bash
cd E:\Projects\InterviewPrep\Awesome-JavaScript-Interviews
npm run dev:server
```

**Terminal 2 (NestJS app):**
```bash
cd E:\Projects\my-nestjs-app
npm run dev
```

Or use `concurrently` in a parent directory:
```json
{
  "scripts": {
    "dev:express": "cd Awesome-JavaScript-Interviews && npm run dev:server",
    "dev:nestjs": "cd my-nestjs-app && npm run dev",
    "dev:all": "concurrently \"npm run dev:express\" \"npm run dev:nestjs\""
  }
}
```

## Key Differences from Express

| Aspect | Express (Current) | NestJS (New App) |
|--------|------------------|------------------|
| **Structure** | Manual organization | Module-based |
| **Dependency Injection** | Manual | Built-in |
| **Testing** | Manual mocking | Easy with DI |
| **Validation** | Manual middleware | Decorators + DTOs |
| **Type Safety** | Optional | Full TypeScript |
| **Microservices** | Manual setup | Built-in support |

## Next Steps

1. ✅ Create new NestJS project in separate directory
2. ✅ Install dependencies
3. ✅ Set up environment variables
4. ✅ Create modules (auth, openai, etc.)
5. ✅ Implement features using examples from `NESTJS_EXAMPLES.md`
6. ✅ Test independently
7. ✅ Deploy separately

## Reference Documentation

- `NESTJS_MIGRATION_GUIDE.md` - Architecture overview
- `NESTJS_EXAMPLES.md` - Code examples
- `NESTJS_FAQ.md` - Common questions
- `NESTJS_QUICK_START.md` - Detailed setup

All documentation applies to your new NestJS app! 🚀

