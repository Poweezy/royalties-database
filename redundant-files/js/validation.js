// Enhanced password toggle functionality
function togglePassword(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;
  
  const container = input.parentElement;
  const button = container.querySelector('.password-toggle-btn');
  const icon = button.querySelector('i');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'fas fa-eye-slash';
    button.setAttribute('aria-label', 'Hide password');
  } else {
    input.type = 'password';
    icon.className = 'fas fa-eye';
    button.setAttribute('aria-label', 'Show password');
  }
}

// Enhanced form validation helpers
function validateUsername(username) {
  if (!username || username.trim().length === 0) {
    return { valid: false, message: 'Username is required' };
  }
  if (username.length < 3) {
    return { valid: false, message: 'Username must be at least 3 characters long' };
  }
  if (username.length > 50) {
    return { valid: false, message: 'Username must be less than 50 characters' };
  }
  if (!/^[a-zA-Z0-9._-]+$/.test(username)) {
    return { valid: false, message: 'Username can only contain letters, numbers, dots, dashes, and underscores' };
  }
  const reserved = ['admin', 'root', 'system', 'test', 'demo'];
  if (reserved.includes(username.toLowerCase())) {
    return { valid: false, message: 'This username is reserved' };
  }
  return { valid: true, message: 'Username is available' };
}

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || email.trim().length === 0) {
    return { valid: false, message: 'Email address is required' };
  }
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Please enter a valid email address' };
  }
  const domain = email.split('@')[1];
  if (domain && domain.indexOf('.') === -1) {
    return { valid: false, message: 'Please enter a valid email domain' };
  }
  return { valid: true, message: 'Email address is valid' };
}

function validatePassword(password) {
  if (!password) {
    return { valid: false, message: 'Password is required', strength: 'none', score: 0 };
  }
  
  let score = 0;
  let feedback = [];
  
  if (password.length >= 8) score += 1;
  else feedback.push('at least 8 characters');
  
  if (/[a-z]/.test(password)) score += 1;
  else feedback.push('lowercase letters');
  
  if (/[A-Z]/.test(password)) score += 1;
  else feedback.push('uppercase letters');
  
  if (/[0-9]/.test(password)) score += 1;
  else feedback.push('numbers');
  
  if (/[^a-zA-Z0-9]/.test(password)) score += 1;
  else feedback.push('special characters');
  
  let strength = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';
  
  const isValid = score >= 3;
  const message = isValid 
    ? 'Password strength is good' 
    : `Password needs: ${feedback.join(', ')}`;
  
  return { 
    valid: isValid, 
    message: message,
    strength: strength,
    score: score
  };
}

// Export functions for module use
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    togglePassword,
    validateUsername,
    validateEmail,
    validatePassword
  };
}
