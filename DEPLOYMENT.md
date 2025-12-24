# Deployment Guide

This guide covers deploying both the **Client** (React/Vite) and **Server** (Express/Node.js) applications.

## Architecture Overview

- **Client**: React + Vite frontend (deployed to AWS Amplify)
- **Server**: Express.js API backend (needs separate deployment)
- **Communication**: Client calls server API via `VITE_API_URL` environment variable

---

## Option 1: AWS Amplify (Client) + AWS App Runner/EC2 (Server) ⭐ Recommended

### Step 1: Deploy Client to AWS Amplify

1. **Connect your repository** to AWS Amplify Console
2. **Configure build settings** (already have `amplify.yml`)
3. **Set Environment Variables** in Amplify Console:
   ```
   VITE_API_URL=https://your-server-domain.com/api
   VITE_AUTH_CLIENT_ID=your-google-oauth-client-id
   VITE_AUTH_REDIRECT_URI=https://your-amplify-domain.com/auth/callback
   VITE_AUTH_AUTHORIZATION_ENDPOINT=https://accounts.google.com/o/oauth2/v2/auth
   VITE_AUTH_TOKEN_ENDPOINT=https://oauth2.googleapis.com/token
   VITE_AUTH_SCOPES=openid profile email
   ```

### Step 2: Deploy Server to AWS App Runner (Easiest)

**AWS App Runner** is the simplest option for Node.js APIs:

1. **Create `apprunner.yaml`** in server folder (see below)
2. **In AWS Console**:
   - Go to AWS App Runner
   - Create new service
   - Source: Connect to GitHub/CodeCommit
   - Select your repository and `server` folder
   - Build: Use `apprunner.yaml`
   - Deploy

3. **Set Environment Variables** in App Runner:
   ```
   PORT=3000
   NODE_ENV=production
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   JWT_SECRET=your-jwt-secret
   OPENAI_API_KEY=your-openai-key
   ```

### Step 3: Deploy Server to AWS EC2 (Alternative)

1. **Launch EC2 instance** (Ubuntu 22.04 LTS recommended)
2. **SSH into instance** and run:
   ```bash
   # Install Node.js
   curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
   sudo apt-get install -y nodejs
   
   # Install PM2 for process management
   sudo npm install -g pm2
   
   # Clone your repo
   git clone <your-repo-url>
   cd Awesome-JavaScript-Interviews/server
   
   # Install dependencies
   npm install --production
   
   # Create .env file
   nano .env
   # Add your environment variables
   
   # Start with PM2
   pm2 start server.js --name interview-api
   pm2 save
   pm2 startup
   ```

3. **Configure Nginx** as reverse proxy:
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

4. **Set up SSL** with Let's Encrypt:
   ```bash
   sudo apt install certbot python3-certbot-nginx
   sudo certbot --nginx -d your-domain.com
   ```

---

## Option 2: Deploy Both Together (Single Server)

If you want to deploy both client and server on the same server:

### Using the Server's Static File Serving

Your `server.js` already serves static files from `client/dist`. This means:

1. **Build the client**:
   ```bash
   cd client
   npm run build
   ```

2. **Deploy server** (which will serve both):
   - The server looks for `../client/dist` folder
   - If found, serves it as static files
   - API routes are at `/api/*`
   - All other routes serve the React app

3. **Environment Variables** for server:
   ```
   PORT=3000
   NODE_ENV=production
   # ... other server env vars
   ```

4. **Client environment variables** need to be set at build time:
   ```bash
   cd client
   VITE_API_URL=/api npm run build
   ```

---

## Option 3: Vercel/Netlify (Client) + Railway/Render (Server)

### Client on Vercel/Netlify

1. **Connect repository** to Vercel or Netlify
2. **Build settings**:
   - Build command: `cd client && npm run build`
   - Output directory: `client/dist`
3. **Environment variables**: Same as Amplify above

### Server on Railway or Render

**Railway:**
1. Connect GitHub repo
2. Select `server` folder
3. Set environment variables
4. Deploy

**Render:**
1. Create new Web Service
2. Connect GitHub repo
3. Root directory: `server`
4. Build command: `npm install`
5. Start command: `npm start`
6. Set environment variables

---

## Environment Variables Checklist

### Client (Build-time variables - must start with `VITE_`)
- `VITE_API_URL` - Your server API URL (e.g., `https://api.yourdomain.com/api`)
- `VITE_AUTH_CLIENT_ID` - Google OAuth Client ID
- `VITE_AUTH_REDIRECT_URI` - OAuth callback URL
- `VITE_AUTH_AUTHORIZATION_ENDPOINT` - OAuth auth endpoint
- `VITE_AUTH_TOKEN_ENDPOINT` - OAuth token endpoint
- `VITE_AUTH_SCOPES` - OAuth scopes (space-separated)

### Server (Runtime variables)
- `PORT` - Server port (default: 3000)
- `NODE_ENV` - Environment (`production` or `development`)
- `GOOGLE_CLIENT_ID` - Google OAuth Client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth Client Secret
- `JWT_SECRET` - Secret for JWT token signing
- `OPENAI_API_KEY` - OpenAI API key (for resume analysis)

---

## CORS Configuration

Your server already has CORS configured to allow all origins (`*`). For production, consider restricting:

```javascript
// In server.js, update CORS:
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", process.env.CLIENT_URL || "*");
  // ... rest of CORS headers
});
```

---

## Post-Deployment Checklist

- [ ] Client builds successfully
- [ ] Server is accessible at configured URL
- [ ] Client can reach server API (check browser console)
- [ ] OAuth redirect URI matches in Google Console
- [ ] Environment variables are set correctly
- [ ] SSL/HTTPS is configured
- [ ] CORS is properly configured
- [ ] Rate limiting is working
- [ ] File uploads work (if applicable)

---

## Troubleshooting

### Client can't reach server
- Check `VITE_API_URL` is set correctly
- Verify CORS settings on server
- Check server is running and accessible

### OAuth not working
- Verify redirect URI matches exactly in Google Console
- Check `VITE_AUTH_REDIRECT_URI` matches deployed client URL
- Ensure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set

### Build fails
- Check Node.js version (should be 18+)
- Verify all dependencies are in `package.json`
- Check for TypeScript errors

