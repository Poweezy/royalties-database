/**
 * Security Audit Script
 * 
 * Checks for common security issues:
 * - Hardcoded credentials
 * - Console statements in production
 * - Missing security headers
 * - Insecure configurations
 */

import { readFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const issues = {
  critical: [],
  high: [],
  medium: [],
  low: [],
};

/**
 * Check for hardcoded credentials
 */
function checkHardcodedCredentials(filePath, content) {
  const patterns = [
    { pattern: /password\s*[:=]\s*["'][^"']{8,}["']/gi, severity: 'critical', message: 'Hardcoded password found' },
    { pattern: /api[_-]?key\s*[:=]\s*["'][^"']+["']/gi, severity: 'critical', message: 'Hardcoded API key found' },
    { pattern: /secret\s*[:=]\s*["'][^"']+["']/gi, severity: 'critical', message: 'Hardcoded secret found' },
    { pattern: /token\s*[:=]\s*["'][^"']{20,}["']/gi, severity: 'high', message: 'Hardcoded token found' },
    { pattern: /demo[_-]?users?\s*[:=]/gi, severity: 'high', message: 'Demo users detected' },
  ];

  patterns.forEach(({ pattern, severity, message }) => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        issues[severity].push({
          file: filePath,
          message: `${message}: ${match.substring(0, 50)}...`,
          line: getLineNumber(content, match),
        });
      });
    }
  });
}

/**
 * Check for console statements
 */
function checkConsoleStatements(filePath, content) {
  // Skip test files
  if (filePath.includes('.test.') || filePath.includes('.spec.')) {
    return;
  }

  const consolePatterns = [
    /console\.log\(/g,
    /console\.debug\(/g,
    /console\.info\(/g,
  ];

  consolePatterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      matches.forEach(match => {
        issues.medium.push({
          file: filePath,
          message: `Console statement found: ${match}`,
          line: getLineNumber(content, match),
        });
      });
    }
  });
}

/**
 * Check for security headers in HTML
 */
function checkSecurityHeaders(filePath, content) {
  if (!filePath.endsWith('.html')) {
    return;
  }

  const checks = [
    { pattern: /Content-Security-Policy/i, severity: 'high', message: 'Missing Content-Security-Policy header' },
    { pattern: /X-Frame-Options/i, severity: 'medium', message: 'Missing X-Frame-Options header' },
    { pattern: /X-Content-Type-Options/i, severity: 'medium', message: 'Missing X-Content-Type-Options header' },
  ];

  checks.forEach(({ pattern, severity, message }) => {
    if (!content.match(pattern)) {
      issues[severity].push({
        file: filePath,
        message,
        line: null,
      });
    }
  });
}

/**
 * Get line number for match
 */
function getLineNumber(content, match) {
  const beforeMatch = content.substring(0, content.indexOf(match));
  return (beforeMatch.match(/\n/g) || []).length + 1;
}

/**
 * Run security audit
 */
async function runAudit() {
  console.log('🔍 Running security audit...\n');

  // Get all JavaScript and HTML files
  const jsFiles = await glob('**/*.{js,html}', {
    cwd: rootDir,
    ignore: [
      'node_modules/**',
      'dist/**',
      'build/**',
      'coverage/**',
      '*.min.js',
      'vendor/**',
      '.git/**',
    ],
  });

  for (const file of jsFiles) {
    const filePath = join(rootDir, file);
    try {
      const content = readFileSync(filePath, 'utf-8');
      
      checkHardcodedCredentials(file, content);
      checkConsoleStatements(file, content);
      checkSecurityHeaders(file, content);
    } catch (error) {
      console.error(`Error reading ${file}:`, error.message);
    }
  }

  // Print results
  console.log('📊 Security Audit Results:\n');
  
  if (issues.critical.length > 0) {
    console.log('🔴 CRITICAL ISSUES:');
    issues.critical.forEach(issue => {
      console.log(`  - ${issue.file}:${issue.line || ''} - ${issue.message}`);
    });
    console.log('');
  }

  if (issues.high.length > 0) {
    console.log('🟠 HIGH PRIORITY ISSUES:');
    issues.high.forEach(issue => {
      console.log(`  - ${issue.file}:${issue.line || ''} - ${issue.message}`);
    });
    console.log('');
  }

  if (issues.medium.length > 0) {
    console.log('🟡 MEDIUM PRIORITY ISSUES:');
    issues.medium.forEach(issue => {
      console.log(`  - ${issue.file}:${issue.line || ''} - ${issue.message}`);
    });
    console.log('');
  }

  if (issues.low.length > 0) {
    console.log('🟢 LOW PRIORITY ISSUES:');
    issues.low.forEach(issue => {
      console.log(`  - ${issue.file}:${issue.line || ''} - ${issue.message}`);
    });
    console.log('');
  }

  const totalIssues = issues.critical.length + issues.high.length + issues.medium.length + issues.low.length;
  
  if (totalIssues === 0) {
    console.log('✅ No security issues found!\n');
    process.exit(0);
  } else {
    console.log(`⚠️  Total issues found: ${totalIssues}`);
    console.log(`   Critical: ${issues.critical.length}`);
    console.log(`   High: ${issues.high.length}`);
    console.log(`   Medium: ${issues.medium.length}`);
    console.log(`   Low: ${issues.low.length}\n`);
    
    // Exit with error if critical issues found
    if (issues.critical.length > 0 || issues.high.length > 0) {
      console.log('❌ Security audit failed. Please fix critical and high priority issues.\n');
      process.exit(1);
    } else {
      console.log('⚠️  Security audit passed with warnings.\n');
      process.exit(0);
    }
  }
}

// Run audit
runAudit().catch(error => {
  console.error('Error running security audit:', error);
  process.exit(1);
});

