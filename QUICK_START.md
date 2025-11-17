# Quick Start Guide

**Get up and running in 5 minutes**

---

## 🚀 Setup (First Time)

```bash
# 1. Install dependencies
npm install

# 2. Setup environment
npm run setup

# 3. Edit .env file (optional - defaults work for development)
# nano .env

# 4. Inject environment variables
npm run inject-env

# 5. Start development server
npm run dev
```

Open browser: `http://localhost:5173`

---

## 🔑 Demo Login Credentials

**Admin User:**
- Username: `admin`
- Password: `admin123`

**Auditor User:**
- Username: `auditor`
- Password: `auditor123`

**Manager User:**
- Username: `manager`
- Password: `manager123`

---

## 📝 Common Commands

```bash
# Development
npm run dev              # Start dev server
npm run inject-env       # Inject environment variables

# Code Quality
npm run lint             # Run ESLint
npm run format           # Format with Prettier

# Testing
npx playwright test      # Run all tests
npx playwright test --ui # Run with UI

# Build
npm run build            # Production build
npm run preview          # Preview production build
```

---

## 🐛 Troubleshooting

### Application won't start
1. Check Node.js version: `node --version` (needs 18+)
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Check browser console for errors

### Module import errors
- Ensure you're using HTTP server (not `file://`)
- Run `npm run inject-env` before starting

### Database errors
- Clear IndexedDB: DevTools > Application > IndexedDB > Delete
- Refresh page

---

## 📚 Next Steps

- Read `README.md` for full documentation
- Check `DEVELOPER_GUIDE.md` for development guidelines
- Review `SECURITY_GUIDELINES.md` before production
- See `BUILD_DEPLOYMENT.md` for deployment

---

**That's it! You're ready to develop.** 🎉

