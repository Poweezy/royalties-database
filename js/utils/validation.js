export class ValidationManager {
  constructor() {
    this.rules = new Map();
    this.setupDefaultRules();
  }

  setupDefaultRules() {
    this.addRule('required', (value) => {
      return value !== null && value !== undefined && value !== '';
    });

    this.addRule('email', (value) => {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      return emailRegex.test(value);
    });

    this.addRule('minLength', (value, min) => {
      return value && value.length >= min;
    });

    this.addRule('maxLength', (value, max) => {
      return !value || value.length <= max;
    });

    this.addRule('numeric', (value) => {
      return !isNaN(Number(value)) && isFinite(value);
    });

    this.addRule('positive', (value) => {
      return Number(value) > 0;
    });

    this.addRule('username', (value) => {
      const usernameRegex = /^[a-zA-Z0-9._-]+$/;
      return usernameRegex.test(value);
    });
  }

  addRule(name, validator) {
    this.rules.set(name, validator);
  }

  validate(value, ruleSet) {
    const errors = [];
    
    for (const [ruleName, ruleValue] of Object.entries(ruleSet)) {
      const validator = this.rules.get(ruleName);
      
      if (validator) {
        const isValid = ruleValue === true 
          ? validator(value)
          : validator(value, ruleValue);
          
        if (!isValid) {
          errors.push(this.getErrorMessage(ruleName, ruleValue));
        }
      }
    }
    
    return errors;
  }

  getErrorMessage(ruleName, ruleValue) {
    const messages = {
      required: 'This field is required',
      email: 'Please enter a valid email address',
      minLength: `Must be at least ${ruleValue} characters long`,
      maxLength: `Must be no more than ${ruleValue} characters long`,
      numeric: 'Please enter a valid number',
      positive: 'Must be a positive number',
      username: 'Username can only contain letters, numbers, dots, underscores, and hyphens'
    };
    
    return messages[ruleName] || 'Invalid value';
  }

  validateForm(formElement) {
    const formData = new FormData(formElement);
    const errors = {};
    
    // Get validation rules from data attributes
    const inputs = formElement.querySelectorAll('[data-validation]');
    
    inputs.forEach(input => {
      const rules = JSON.parse(input.dataset.validation);
      const value = formData.get(input.name);
      const fieldErrors = this.validate(value, rules);
      
      if (fieldErrors.length > 0) {
        errors[input.name] = fieldErrors;
      }
    });
    
    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  displayErrors(errors, containerSelector = '.form-errors') {
    const container = document.querySelector(containerSelector);
    if (!container) return;
    
    container.innerHTML = '';
    
    if (Object.keys(errors).length === 0) {
      container.style.display = 'none';
      return;
    }
    
    container.style.display = 'block';
    
    for (const [field, fieldErrors] of Object.entries(errors)) {
      fieldErrors.forEach(error => {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = `${field}: ${error}`;
        container.appendChild(errorElement);
      });
    }
  }
}
