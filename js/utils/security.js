import CryptoJS from 'crypto-js';

export class SecurityManager {
  constructor() {
    this.encryptionKey = this.generateKey();
    this.loginAttempts = new Map();
  }

  generateKey() {
    // In production, this should come from a secure source
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    
    // Remove HTML tags and scripts
    return input
      .replace(/<script[^>]*>.*?<\/script>/gi, '')
      .replace(/<[^>]*>/g, '')
      .trim();
  }

  validatePassword(password) {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    const errors = [];
    
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    }
    
    if (!hasUpperCase) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!hasLowerCase) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!hasNumbers) {
      errors.push('Password must contain at least one number');
    }
    
    if (!hasSpecialChar) {
      errors.push('Password must contain at least one special character');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  checkLoginAttempts(username) {
    const attempts = this.loginAttempts.get(username) || { count: 0, lastAttempt: 0 };
    const now = Date.now();
    const lockoutDuration = 15 * 60 * 1000; // 15 minutes
    
    if (attempts.count >= 5 && (now - attempts.lastAttempt) < lockoutDuration) {
      return {
        isLocked: true,
        remainingTime: lockoutDuration - (now - attempts.lastAttempt)
      };
    }
    
    return { isLocked: false };
  }

  recordLoginAttempt(username, success) {
    const attempts = this.loginAttempts.get(username) || { count: 0, lastAttempt: 0 };
    
    if (success) {
      this.loginAttempts.delete(username);
    } else {
      attempts.count += 1;
      attempts.lastAttempt = Date.now();
      this.loginAttempts.set(username, attempts);
    }
  }

  encryptData(data) {
    try {
      return CryptoJS.AES.encrypt(JSON.stringify(data), this.encryptionKey).toString();
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  }

  decryptData(encryptedData) {
    try {
      const bytes = CryptoJS.AES.decrypt(encryptedData, this.encryptionKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  }

  generateCSRFToken() {
    return CryptoJS.lib.WordArray.random(128/8).toString();
  }

  validateCSRFToken(token, storedToken) {
    return token === storedToken;
  }
}
