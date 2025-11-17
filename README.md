# Mining Royalties Manager

A comprehensive royalty management system for the Eswatini mining sector.

## 🚀 Features

- **User Authentication & Management**: Secure role-based access control
- **Royalty Records Management**: Track and manage mining royalties
- **Contract & Lease Management**: Comprehensive contract and lease tracking
- **Financial Reporting**: Advanced analytics and reporting capabilities
- **Compliance Monitoring**: Regulatory compliance tracking
- **GIS Dashboard**: Interactive mapping and geographic visualization
- **Document Management**: Secure document storage and workflow
- **Expense Tracking**: JIB and expense management
- **Audit Trail**: Complete activity logging

## 📋 Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)
- HTTP server (for local development with ES6 modules)

## 🛠️ Setup & Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd royalties-database
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

```bash
# Copy the example environment file
npm run setup

# Or manually:
cp .env.example .env
```

Edit `.env` file with your configuration (see `.env.example` for all available options).

### 4. Inject Environment Variables

```bash
npm run inject-env
```

This script reads your `.env` file and injects environment variables into the HTML file.

### 5. Start Development Server

```bash
# Using Vite (recommended)
npm run dev

# Or using Python HTTP server
python -m http.server 8000

# Or using Node.js http-server
npx http-server -p 8000
```

### 6. Access Application

Open your browser and navigate to:
- Vite: `http://localhost:5173`
- Python/Node server: `http://localhost:8000/royalties.html`

## 🔧 Configuration

### Environment Variables

The application supports environment-based configuration through `.env` file:

```bash
# Application Environment
NODE_ENV=development  # development, staging, production

# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_API_TIMEOUT=30000

# Security Configuration
VITE_MAX_LOGIN_ATTEMPTS=5
VITE_LOCKOUT_DURATION=900000

# Feature Flags
VITE_OFFLINE_MODE=true
VITE_ERROR_REPORTING=false

# Logging
VITE_LOG_LEVEL=debug  # debug, info, warn, error
```

See `.env.example` for all available configuration options.

### Configuration Access

Configuration is available throughout the application via the `config` utility:

```javascript
import { config } from './utils/config.js';

// Get configuration value
const apiUrl = config.get('api.baseUrl');
const isProduction = config.isProduction();

// Check feature flags
if (config.isFeatureEnabled('enableOfflineMode')) {
  // Enable offline features
}
```

## 📝 Logging

The application uses a production-ready logging service:

```javascript
import { logger } from './utils/logger.js';

// Log levels: debug, info, warn, error, fatal
logger.debug('Debug message', data);
logger.info('Info message', data);
logger.warn('Warning message', data);
logger.error('Error message', error);
logger.fatal('Fatal error', error);

// Performance logging
logger.performance('Operation name', durationMs, metadata);
```

### Log Levels

- **debug**: Detailed debugging information (development only)
- **info**: Informational messages
- **warn**: Warning messages (may indicate issues)
- **error**: Error messages (need attention)
- **fatal**: Critical errors (application may be unstable)

Log levels are configured via `VITE_LOG_LEVEL` environment variable.

## 🔐 Security

### Development Mode

- Demo credentials are enabled by default
- Console logging is enabled
- Detailed error messages shown

### Production Mode

⚠️ **CRITICAL**: Before production deployment:

1. **Disable demo mode**: Set `VITE_DEMO_MODE=false` in production `.env`
2. **Enable HTTPS**: Ensure HTTPS is enforced
3. **Configure backend API**: Set proper `VITE_API_URL`
4. **Enable error reporting**: Configure Sentry or similar service
5. **Review security settings**: Check all `VITE_*` security variables

## 🧪 Testing

### Run Tests

```bash
# Run all Playwright tests
npx playwright test

# Run tests with UI
npx playwright test --ui

# Run specific test
npx playwright test forgot_password.spec.js
```

### Test Coverage

- ✅ Dashboard navigation
- ✅ User management
- ✅ Expense tracking
- ✅ GIS dashboard
- ✅ Import/Export functionality
- ✅ PDF export
- ✅ Forgot password flow

## 📦 Build & Deployment

### Build for Production

```bash
npm run build
```

This will:
1. Inject environment variables
2. Build and optimize assets
3. Generate production-ready files in `dist/`

### Preview Production Build

```bash
npm run preview
```

## 📚 Project Structure

```
royalties-database/
├── js/
│   ├── app.js                 # Main application module
│   ├── services/              # Service layer
│   │   ├── auth.service.js
│   │   ├── database.service.js
│   │   └── ...
│   ├── modules/               # Feature modules
│   │   ├── ChartManager.js
│   │   ├── UserManager.js
│   │   └── ...
│   ├── components/            # UI components
│   │   ├── BulkOperationsPanel.js
│   │   └── ...
│   └── utils/                 # Utility modules
│       ├── config.js          # Configuration manager
│       ├── logger.js          # Logging service
│       ├── error-handler.js
│       └── ...
├── css/                       # Stylesheets
├── tests/                     # Test files
├── scripts/                   # Build scripts
│   └── inject-env.js
├── royalties.html             # Main HTML file
├── royalties.css              # Main stylesheet
├── .env.example               # Environment template
├── package.json
└── README.md
```

## 🔄 Development Workflow

1. **Make changes** to code
2. **Test locally** with `npm run dev`
3. **Run tests** with `npx playwright test`
4. **Commit changes** (ensure `.env` is in `.gitignore`)
5. **Build for production** with `npm run build`

## 📖 Documentation

- `PRODUCTION_READINESS_TODO.md` - Complete production readiness checklist
- `IMPLEMENTATION_STATUS.md` - Current implementation status
- `AGENTS.md` - Architecture and development guidelines
- `ENHANCED-FEATURES.md` - Enhanced features documentation
- `ENHANCED-USER-MANAGEMENT.md` - User management features

## 🐛 Troubleshooting

### Application won't start

1. Check browser console for errors
2. Verify all dependencies are installed: `npm install`
3. Ensure environment variables are injected: `npm run inject-env`
4. Check that you're using an HTTP server (not `file://` protocol)

### Database errors

1. Check browser console for specific error messages
2. Clear IndexedDB: Open DevTools > Application > IndexedDB > Delete
3. Check database version compatibility

### Module import errors

1. Ensure you're using an HTTP server
2. Check file paths are correct
3. Verify all module exports match imports

## 🤝 Contributing

1. Follow code style guidelines in `AGENTS.md`
2. Write tests for new features
3. Update documentation as needed
4. Run linter before committing: `npm run lint`

## 📄 License

[Add your license information here]

## 📞 Support

For support, email: support@government.sz

---

**Version**: 1.0.0  
**Last Updated**: 2025-01-17


