# NestJS Quick Start Guide

## Step-by-Step Migration

### 1. Install NestJS CLI
```bash
npm i -g @nestjs/cli
```

### 2. Create New NestJS Project
```bash
cd server
nest new . --skip-git
# Or create in new directory: nest new nestjs-server
```

### 3. Install Required Packages
```bash
npm install @nestjs/passport @nestjs/jwt @nestjs/microservices @nestjs/config
npm install passport passport-google-oauth20 passport-jwt
npm install openai pdf-parse multer
npm install class-validator class-transformer
npm install --save-dev @types/passport-google-oauth20 @types/passport-jwt @types/multer
```

### 4. Project Structure Setup
```bash
# Generate modules
nest g module auth
nest g controller auth
nest g service auth

nest g module openai
nest g service openai
nest g controller openai

nest g module resume
nest g controller resume
nest g service resume

nest g module files
nest g controller files
nest g service files
```

### 5. Update package.json Scripts
```json
{
  "scripts": {
    "build": "nest build",
    "format": "prettier --write \"src/**/*.ts\" \"test/**/*.ts\"",
    "start": "nest start",
    "dev": "nest start --watch",
    "start:debug": "nest start --debug --watch",
    "start:prod": "node dist/main",
    "lint": "eslint \"{src,apps,libs,test}/**/*.ts\" --fix",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:cov": "jest --coverage",
    "test:debug": "node --inspect-brk -r tsconfig-paths/register -r ts-node/register node_modules/.bin/jest --runInBand",
    "test:e2e": "jest --config ./test/jest-e2e.json"
  }
}
```

## Migration Checklist

### Phase 1: Basic Setup ✅
- [ ] Install NestJS CLI
- [ ] Create NestJS project
- [ ] Install dependencies
- [ ] Set up TypeScript configuration
- [ ] Configure environment variables

### Phase 2: Module Migration ✅
- [ ] Migrate file serving routes → FilesModule
- [ ] Migrate folder/file APIs → FilesModule
- [ ] Migrate resume analyzer → ResumeModule
- [ ] Set up OpenAI service

### Phase 3: Authentication ✅
- [ ] Install Google OAuth packages
- [ ] Create Google strategy
- [ ] Create JWT strategy
- [ ] Implement auth guards
- [ ] Protect routes with guards

### Phase 4: Microservices (Optional) ✅
- [ ] Set up OpenAI microservice
- [ ] Configure TCP transport
- [ ] Update ResumeService to use microservice
- [ ] Test microservice communication

### Phase 5: Testing ✅
- [ ] Write unit tests for services
- [ ] Write integration tests
- [ ] Test OpenAI integration
- [ ] Test Google Auth flow

## Key Configuration Files

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2021",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": false,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "forceConsistentCasingInFileNames": false,
    "noFallthroughCasesInSwitch": false
  }
}
```

### `.env` Template
```env
# Application
PORT=3000
NODE_ENV=development

# OpenAI
OPENAI_API_KEY=sk-...

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/auth/google/callback

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production

# Microservices
OPENAI_SERVICE_HOST=localhost
OPENAI_SERVICE_PORT=3001
```

## Common Commands

```bash
# Development
npm run dev

# Build
npm run build

# Production
npm run start:prod

# Generate new module
nest g module module-name

# Generate new service
nest g service service-name

# Generate new controller
nest g controller controller-name

# Run tests
npm test

# Run e2e tests
npm run test:e2e
```

## Migration Tips

1. **Start Small**: Migrate one route at a time
2. **Keep Express Running**: Run both servers during migration
3. **Test Incrementally**: Test each migrated endpoint
4. **Use DTOs**: Create DTOs for request validation
5. **Add Guards Gradually**: Start without auth, then add guards
6. **Microservices Last**: Get monolith working first, then extract services

## Troubleshooting

### Issue: Module not found
**Solution**: Check imports and ensure modules are registered in `app.module.ts`

### Issue: Dependency injection error
**Solution**: Ensure service is in `providers` array of module

### Issue: Guard not working
**Solution**: Check `@UseGuards()` decorator and ensure strategy is registered

### Issue: Microservice connection failed
**Solution**: Verify port numbers and ensure microservice is running

## Next Steps After Migration

1. ✅ Add Swagger documentation (`@nestjs/swagger`)
2. ✅ Implement rate limiting (`@nestjs/throttler`)
3. ✅ Add logging (`@nestjs/logger`)
4. ✅ Set up CI/CD pipeline
5. ✅ Add monitoring and health checks
6. ✅ Implement caching (Redis)
7. ✅ Add database integration (TypeORM/Prisma)

