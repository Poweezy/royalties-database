# Build & Deployment Guide

**Production Deployment Instructions**

---

## 🏗️ BUILD PROCESS

### Development Build

```bash
# Install dependencies
npm install

# Setup environment
npm run setup

# Start development server
npm run dev
```

### Production Build

```bash
# 1. Set production environment
export NODE_ENV=production
# Or on Windows:
set NODE_ENV=production

# 2. Update .env file for production
# Ensure VITE_DEMO_MODE=false
# Set proper API URLs
# Configure error reporting

# 3. Inject environment variables
npm run inject-env

# 4. Build for production
npm run build

# 5. Preview production build
npm run preview
```

### Build Output

Production build creates:
- `dist/` - Optimized production files
- Minified JavaScript
- Optimized CSS
- Compressed assets
- Source maps (optional)

---

## 🚀 DEPLOYMENT OPTIONS

### Option 1: Static Hosting (Recommended for PWA)

#### Netlify

1. **Connect Repository**
   ```bash
   # Install Netlify CLI
   npm install -g netlify-cli
   
   # Login
   netlify login
   
   # Initialize
   netlify init
   ```

2. **Create `netlify.toml`**
   ```toml
   [build]
     command = "npm run build"
     publish = "dist"
   
   [[redirects]]
     from = "/*"
     to = "/royalties.html"
     status = 200
   
   [build.environment]
     NODE_ENV = "production"
   ```

3. **Deploy**
   ```bash
   netlify deploy --prod
   ```

#### Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Create `vercel.json`**
   ```json
   {
     "buildCommand": "npm run build",
     "outputDirectory": "dist",
     "rewrites": [
       { "source": "/(.*)", "destination": "/royalties.html" }
     ]
   }
   ```

3. **Deploy**
   ```bash
   vercel --prod
   ```

#### GitHub Pages

1. **Create `.github/workflows/deploy.yml`**
   ```yaml
   name: Deploy to GitHub Pages
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - uses: actions/setup-node@v3
           with:
             node-version: '18'
         - run: npm install
         - run: npm run build
         - uses: peaceiris/actions-gh-pages@v3
           with:
             github_token: ${{ secrets.GITHUB_TOKEN }}
             publish_dir: ./dist
   ```

---

### Option 2: Traditional Web Server

#### Apache Configuration

```apache
<VirtualHost *:80>
    ServerName yourdomain.com
    DocumentRoot /var/www/royalties-database/dist
    
    # Redirect HTTP to HTTPS
    Redirect permanent / https://yourdomain.com/
</VirtualHost>

<VirtualHost *:443>
    ServerName yourdomain.com
    DocumentRoot /var/www/royalties-database/dist
    
    # SSL Configuration
    SSLEngine on
    SSLCertificateFile /path/to/certificate.crt
    SSLCertificateKeyFile /path/to/private.key
    
    # Security Headers
    Header always set X-Content-Type-Options "nosniff"
    Header always set X-Frame-Options "DENY"
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"
    
    # Content Security Policy
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;"
    
    # SPA Routing
    <Directory /var/www/royalties-database/dist>
        Options -Indexes
        AllowOverride All
        Require all granted
    </Directory>
    
    # Rewrite rules for SPA
    RewriteEngine On
    RewriteBase /
    RewriteRule ^index\.html$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /royalties.html [L]
</VirtualHost>
```

#### Nginx Configuration

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;
    root /var/www/royalties-database/dist;
    index royalties.html;

    # SSL Configuration
    ssl_certificate /path/to/certificate.crt;
    ssl_certificate_key /path/to/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-Frame-Options "DENY" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;" always;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # SPA Routing
    location / {
        try_files $uri $uri/ /royalties.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Don't cache HTML
    location ~* \.html$ {
        expires -1;
        add_header Cache-Control "no-cache, no-store, must-revalidate";
    }
}
```

---

## 🔐 ENVIRONMENT CONFIGURATION

### Production Environment Variables

Create `.env.production`:

```bash
NODE_ENV=production

# API Configuration
VITE_API_URL=https://api.yourdomain.com/api
VITE_API_TIMEOUT=30000

# Security
VITE_DEMO_MODE=false
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_LOCKOUT_DURATION=900000

# Features
VITE_OFFLINE_MODE=true
VITE_ERROR_REPORTING=true
VITE_ANALYTICS=true

# Logging
VITE_LOG_LEVEL=error

# Error Reporting (Sentry)
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# Analytics (Google Analytics)
VITE_GA_ID=G-XXXXXXXXXX
```

---

## 📦 CI/CD PIPELINE

### GitHub Actions Example

Create `.github/workflows/deploy.yml`:

```yaml
name: Build and Deploy

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run lint
      - run: npx playwright test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run build
      - uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/download-artifact@v3
        with:
          name: dist
      - name: Deploy to server
        uses: appleboy/scp-action@master
        with:
          host: ${{ secrets.HOST }}
          username: ${{ secrets.USERNAME }}
          key: ${{ secrets.SSH_KEY }}
          source: "dist/*"
          target: "/var/www/royalties-database"
```

---

## 🔄 DEPLOYMENT CHECKLIST

### Pre-Deployment

- [ ] All tests passing
- [ ] Linting passes
- [ ] Build succeeds without errors
- [ ] Environment variables configured
- [ ] Security settings reviewed
- [ ] Demo mode disabled
- [ ] API endpoints configured
- [ ] Error reporting configured
- [ ] Analytics configured (if needed)

### Deployment

- [ ] Backup current production
- [ ] Deploy new build
- [ ] Verify deployment
- [ ] Test critical functionality
- [ ] Monitor error logs
- [ ] Check performance metrics

### Post-Deployment

- [ ] Verify all features working
- [ ] Check error rates
- [ ] Monitor performance
- [ ] Verify analytics tracking
- [ ] Test on multiple browsers
- [ ] Test on mobile devices

---

## 🔙 ROLLBACK PROCEDURE

### Quick Rollback

1. **Restore Previous Build**
   ```bash
   # Restore from backup
   cp -r /backup/dist/* /var/www/royalties-database/dist/
   ```

2. **Restart Services**
   ```bash
   # If using process manager
   pm2 restart royalties-app
   
   # Or restart web server
   sudo systemctl restart nginx
   ```

3. **Verify Rollback**
   - Check application loads
   - Verify critical features
   - Monitor error logs

---

## 📊 MONITORING

### Post-Deployment Monitoring

1. **Error Tracking**
   - Monitor Sentry (if configured)
   - Check server error logs
   - Review browser console errors

2. **Performance Monitoring**
   - Core Web Vitals
   - API response times
   - Page load times

3. **User Analytics**
   - User activity
   - Feature usage
   - Error rates

---

## 🛠️ TROUBLESHOOTING

### Build Fails

1. Check Node.js version (18+)
2. Clear node_modules and reinstall
3. Check for syntax errors
4. Verify environment variables

### Deployment Fails

1. Check server permissions
2. Verify file paths
3. Check web server configuration
4. Review error logs

### Application Errors After Deployment

1. Check environment variables
2. Verify API endpoints
3. Check browser console
4. Review server logs
5. Verify service worker cache

---

## 📝 NOTES

- Always test in staging before production
- Keep backups of previous versions
- Document deployment process
- Monitor after deployment
- Have rollback plan ready

---

**Last Updated**: 2025-01-17

