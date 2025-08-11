import { describe, it, expect } from 'vitest';
import { security } from './security.js';

describe('security.sanitizeInput', () => {
  it('should not change a valid username', () => {
    const username = 'test.user-123';
    expect(security.sanitizeInput(username, 'username')).toBe(username);
  });

  it('should remove invalid characters from a username', () => {
    const username = 'test!user@123';
    expect(security.sanitizeInput(username, 'username')).toBe('testuser123');
  });

  it('should return an empty string for an invalid email', () => {
    const email = 'not-an-email';
    expect(security.sanitizeInput(email, 'email')).toBe('');
  });

  it('should return the email if it is valid', () => {
    const email = 'test@example.com';
    expect(security.sanitizeInput(email, 'email')).toBe(email);
  });
});
