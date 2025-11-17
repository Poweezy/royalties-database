/**
 * Environment Variable Injection Script
 * 
 * This script reads .env files and injects environment variables
 * into the HTML file for runtime access.
 * 
 * Usage: node scripts/inject-env.js
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

/**
 * Load environment variables from .env file
 * @param {string} envPath - Path to .env file
 * @returns {Object} Environment variables object
 */
function loadEnvFile(envPath) {
  const env = {};
  
  if (!existsSync(envPath)) {
    console.warn(`Warning: .env file not found at ${envPath}`);
    return env;
  }

  const envContent = readFileSync(envPath, 'utf-8');
  const lines = envContent.split('\n');

  for (const line of lines) {
    // Skip comments and empty lines
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) {
      continue;
    }

    // Parse KEY=VALUE format
    const equalIndex = trimmedLine.indexOf('=');
    if (equalIndex === -1) {
      continue;
    }

    const key = trimmedLine.substring(0, equalIndex).trim();
    let value = trimmedLine.substring(equalIndex + 1).trim();

    // Remove quotes if present
    if ((value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }

    // Only process VITE_ prefixed variables for Vite projects
    // or REACT_APP_ for React projects
    if (key.startsWith('VITE_') || key.startsWith('REACT_APP_')) {
      env[key] = value;
    }
  }

  return env;
}

/**
 * Inject environment variables into HTML
 * @param {string} htmlPath - Path to HTML file
 * @param {Object} env - Environment variables object
 */
function injectEnvIntoHTML(htmlPath, env) {
  if (!existsSync(htmlPath)) {
    console.error(`Error: HTML file not found at ${htmlPath}`);
    return false;
  }

  let htmlContent = readFileSync(htmlPath, 'utf-8');

  // Create script tag with environment variables
  const envScript = `
    <script>
      // Injected environment variables
      window.__ENV__ = ${JSON.stringify(env, null, 2)};
    </script>
  `;

  // Check if __ENV__ script already exists
  const envScriptRegex = /<script>\s*\/\/\s*Injected environment variables[\s\S]*?<\/script>/;
  
  if (envScriptRegex.test(htmlContent)) {
    // Replace existing script
    htmlContent = htmlContent.replace(envScriptRegex, envScript.trim());
  } else {
    // Insert before closing head tag or before first script tag
    const headCloseRegex = /<\/head>/i;
    if (headCloseRegex.test(htmlContent)) {
      htmlContent = htmlContent.replace(headCloseRegex, `    ${envScript.trim()}\n  </head>`);
    } else {
      // Insert at the beginning if no head tag
      const bodyOpenRegex = /<body[^>]*>/i;
      if (bodyOpenRegex.test(htmlContent)) {
        htmlContent = htmlContent.replace(bodyOpenRegex, `  ${envScript.trim()}\n  $&`);
      }
    }
  }

  writeFileSync(htmlPath, htmlContent, 'utf-8');
  return true;
}

/**
 * Main function
 */
function main() {
  const envPath = join(rootDir, '.env');
  const htmlPath = join(rootDir, 'royalties.html');
  const envExamplePath = join(rootDir, '.env.example');

  console.log('🔧 Injecting environment variables...');

  // Load environment variables
  const env = loadEnvFile(envPath);

  // If .env doesn't exist, check .env.example
  if (Object.keys(env).length === 0 && existsSync(envExamplePath)) {
    console.warn('⚠️  .env file not found, using .env.example as reference');
    console.warn('⚠️  Please create a .env file based on .env.example');
  }

  // Always include NODE_ENV
  if (!env.NODE_ENV) {
    env.NODE_ENV = process.env.NODE_ENV || 'development';
  }

  // Inject into HTML
  if (injectEnvIntoHTML(htmlPath, env)) {
    console.log('✅ Environment variables injected successfully');
    console.log(`📝 Loaded ${Object.keys(env).length} environment variables`);
  } else {
    console.error('❌ Failed to inject environment variables');
    process.exit(1);
  }
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}


