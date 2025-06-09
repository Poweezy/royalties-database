// Form Component with Validation
export class FormBuilder {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' ? document.getElementById(container) : container;
        this.options = {
            fields: [],
            submitHandler: null,
            validateOnInput: true,
            showProgress: false,
            ...options
        };
        this.form = null;
        this.validators = {};
        this.errors = {};
        this.init();
    }

    init() {
        this.createForm();
        this.bindEvents();
        if (this.options.data) {
            this.populate(this.options.data);
        }
    }

    createForm() {
        this.form = document.createElement('form');
        this.form.className = 'form-builder';
        this.form.noValidate = true;

        if (this.options.showProgress) {
            this.form.innerHTML += `
                <div class="form-progress">
                    <div class="progress-bar" style="width: 0%"></div>
                </div>
            `;
        }

        this.options.fields.forEach((field, index) => {
            this.form.appendChild(this.createField(field, index));
        });

        if (this.options.submitButton !== false) {
            const submitSection = document.createElement('div');
            submitSection.className = 'form-actions';
            submitSection.innerHTML = `
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> ${this.options.submitText || 'Submit'}
                </button>
                ${this.options.cancelButton ? `
                    <button type="button" class="btn btn-secondary form-cancel">
                        <i class="fas fa-times"></i> Cancel
                    </button>
                ` : ''}
            `;
            this.form.appendChild(submitSection);
        }

        this.container.appendChild(this.form);
    }

    createField(field, index) {
        const wrapper = document.createElement('div');
        wrapper.className = `form-group ${field.className || ''}`;
        
        if (field.type === 'hidden') {
            wrapper.innerHTML = `<input type="hidden" name="${field.name}" value="${field.value || ''}" id="${field.id || field.name}">`;
            return wrapper;
        }

        const label = field.label ? `
            <label for="${field.id || field.name}">
                ${field.icon ? `<i class="${field.icon}"></i>` : ''} 
                ${field.label} 
                ${field.required ? '<span class="required">*</span>' : ''}
            </label>
        ` : '';

        let input = '';
        switch (field.type) {
            case 'text':
            case 'email':
            case 'password':
            case 'number':
            case 'date':
            case 'datetime-local':
            case 'tel':
            case 'url':
                input = this.createTextInput(field);
                break;
            case 'textarea':
                input = this.createTextarea(field);
                break;
            case 'select':
                input = this.createSelect(field);
                break;
            case 'checkbox':
                input = this.createCheckbox(field);
                break;
            case 'radio':
                input = this.createRadio(field);
                break;
            case 'file':
                input = this.createFileInput(field);
                break;
            default:
                input = this.createTextInput(field);
        }

        const help = field.help ? `<small class="form-help">${field.help}</small>` : '';
        const validation = `
            <div class="validation-error" id="${field.name}-error" style="display: none;">
                <i class="fas fa-exclamation-circle"></i> <span></span>
            </div>
            <div class="validation-success" id="${field.name}-success" style="display: none;">
                <i class="fas fa-check-circle"></i> <span></span>
            </div>
        `;

        wrapper.innerHTML = label + input + help + validation;
        return wrapper;
    }

    createTextInput(field) {
        const attributes = this.buildAttributes(field);
        return `<input type="${field.type}" ${attributes}>`;
    }

    createTextarea(field) {
        const attributes = this.buildAttributes(field, ['rows', 'cols']);
        return `<textarea ${attributes}>${field.value || ''}</textarea>`;
    }

    createSelect(field) {
        const attributes = this.buildAttributes(field, ['multiple']);
        const options = field.options.map(option => {
            const value = typeof option === 'object' ? option.value : option;
            const text = typeof option === 'object' ? option.text : option;
            const selected = field.value === value ? 'selected' : '';
            return `<option value="${value}" ${selected}>${text}</option>`;
        }).join('');
        
        return `<select ${attributes}>${options}</select>`;
    }

    createCheckbox(field) {
        const attributes = this.buildAttributes(field);
        const checked = field.value ? 'checked' : '';
        return `
            <label class="checkbox-label">
                <input type="checkbox" ${attributes} ${checked}>
                <span>${field.checkboxLabel || field.label}</span>
            </label>
        `;
    }

    createRadio(field) {
        return field.options.map(option => {
            const value = typeof option === 'object' ? option.value : option;
            const text = typeof option === 'object' ? option.text : option;
            const checked = field.value === value ? 'checked' : '';
            return `
                <label class="radio-label">
                    <input type="radio" name="${field.name}" value="${value}" ${checked}>
                    <span>${text}</span>
                </label>
            `;
        }).join('');
    }

    createFileInput(field) {
        const attributes = this.buildAttributes(field, ['accept', 'multiple']);
        return `
            <div class="file-input-wrapper">
                <input type="file" ${attributes} style="display: none;">
                <button type="button" class="btn btn-secondary file-input-trigger">
                    <i class="fas fa-upload"></i> Choose File
                </button>
                <span class="file-input-text">No file selected</span>
            </div>
        `;
    }

    buildAttributes(field, extraAttrs = []) {
        const attrs = [
            `name="${field.name}"`,
            `id="${field.id || field.name}"`,
            field.placeholder ? `placeholder="${field.placeholder}"` : '',
            field.required ? 'required' : '',
            field.disabled ? 'disabled' : '',
            field.readonly ? 'readonly' : '',
            field.min !== undefined ? `min="${field.min}"` : '',
            field.max !== undefined ? `max="${field.max}"` : '',
            field.step !== undefined ? `step="${field.step}"` : '',
            field.pattern ? `pattern="${field.pattern}"` : '',
            field.class ? `class="${field.class}"` : '',
            field.value !== undefined && field.type !== 'checkbox' ? `value="${field.value}"` : ''
        ];

        extraAttrs.forEach(attr => {
            if (field[attr] !== undefined) {
                attrs.push(`${attr}="${field[attr]}"`);
            }
        });

        return attrs.filter(attr => attr).join(' ');
    }

    bindEvents() {
        // Form submission
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleSubmit();
        });

        // Real-time validation
        if (this.options.validateOnInput) {
            this.form.addEventListener('input', (e) => {
                const field = this.getFieldConfig(e.target.name);
                if (field) {
                    this.validateField(field, e.target.value);
                }
            });

            this.form.addEventListener('blur', (e) => {
                const field = this.getFieldConfig(e.target.name);
                if (field) {
                    this.validateField(field, e.target.value);
                }
            }, true);
        }

        // File input handling
        this.form.addEventListener('change', (e) => {
            if (e.target.type === 'file') {
                const wrapper = e.target.closest('.file-input-wrapper');
                const textSpan = wrapper.querySelector('.file-input-text');
                const files = e.target.files;
                
                if (files.length === 0) {
                    textSpan.textContent = 'No file selected';
                } else if (files.length === 1) {
                    textSpan.textContent = files[0].name;
                } else {
                    textSpan.textContent = `${files.length} files selected`;
                }
            }
        });

        // File input trigger
        this.form.addEventListener('click', (e) => {
            if (e.target.classList.contains('file-input-trigger')) {
                const fileInput = e.target.parentElement.querySelector('input[type="file"]');
                fileInput.click();
            }
        });

        // Cancel button
        const cancelBtn = this.form.querySelector('.form-cancel');
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                if (this.options.cancelHandler) {
                    this.options.cancelHandler();
                }
            });
        }

        // Form progress
        if (this.options.showProgress) {
            this.form.addEventListener('input', () => {
                this.updateProgress();
            });
        }
    }

    validateField(field, value) {
        const errors = [];
        
        // Required validation
        if (field.required && (!value || value.trim() === '')) {
            errors.push(`${field.label} is required`);
        }
        
        if (value && value.trim() !== '') {
            // Type-specific validation
            switch (field.type) {
                case 'email':
                    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
                        errors.push('Please enter a valid email address');
                    }
                    break;
                case 'number':
                    if (isNaN(value)) {
                        errors.push('Please enter a valid number');
                    } else {
                        const num = parseFloat(value);
                        if (field.min !== undefined && num < field.min) {
                            errors.push(`Value must be at least ${field.min}`);
                        }
                        if (field.max !== undefined && num > field.max) {
                            errors.push(`Value must be at most ${field.max}`);
                        }
                    }
                    break;
                case 'url':
                    try {
                        new URL(value);
                    } catch {
                        errors.push('Please enter a valid URL');
                    }
                    break;
            }
            
            // Length validation
            if (field.minLength && value.length < field.minLength) {
                errors.push(`Must be at least ${field.minLength} characters`);
            }
            if (field.maxLength && value.length > field.maxLength) {
                errors.push(`Must be at most ${field.maxLength} characters`);
            }
            
            // Pattern validation
            if (field.pattern && !new RegExp(field.pattern).test(value)) {
                errors.push(field.patternMessage || 'Invalid format');
            }
            
            // Custom validation
            if (field.validator && typeof field.validator === 'function') {
                const customError = field.validator(value);
                if (customError) {
                    errors.push(customError);
                }
            }
        }
        
        this.showFieldValidation(field.name, errors);
        return errors.length === 0;
    }

    showFieldValidation(fieldName, errors) {
        const errorDiv = document.getElementById(`${fieldName}-error`);
        const successDiv = document.getElementById(`${fieldName}-success`);
        const field = this.form.querySelector(`[name="${fieldName}"]`);
        
        if (errors.length > 0) {
            errorDiv.querySelector('span').textContent = errors[0];
            errorDiv.style.display = 'block';
            successDiv.style.display = 'none';
            field.classList.add('field-invalid');
            field.classList.remove('field-valid');
            this.errors[fieldName] = errors;
        } else {
            errorDiv.style.display = 'none';
            successDiv.style.display = 'block';
            successDiv.querySelector('span').textContent = 'Valid';
            field.classList.add('field-valid');
            field.classList.remove('field-invalid');
            delete this.errors[fieldName];
        }
    }

    validate() {
        let isValid = true;
        
        this.options.fields.forEach(field => {
            if (field.type === 'hidden') return;
            
            const element = this.form.querySelector(`[name="${field.name}"]`);
            const value = this.getFieldValue(field.name);
            
            if (!this.validateField(field, value)) {
                isValid = false;
            }
        });
        
        return isValid;
    }

    handleSubmit() {
        if (this.validate()) {
            const data = this.getData();
            if (this.options.submitHandler) {
                this.options.submitHandler(data);
            }
        } else {
            // Focus on first invalid field
            const firstInvalid = this.form.querySelector('.field-invalid');
            if (firstInvalid) {
                firstInvalid.focus();
            }
        }
    }

    getData() {
        const data = {};
        this.options.fields.forEach(field => {
            data[field.name] = this.getFieldValue(field.name);
        });
        return data;
    }

    getFieldValue(fieldName) {
        const element = this.form.querySelector(`[name="${fieldName}"]`);
        if (!element) return null;
        
        switch (element.type) {
            case 'checkbox':
                return element.checked;
            case 'radio':
                const checked = this.form.querySelector(`[name="${fieldName}"]:checked`);
                return checked ? checked.value : null;
            case 'file':
                return element.files;
            case 'number':
                return element.value ? parseFloat(element.value) : null;
            default:
                return element.value;
        }
    }

    populate(data) {
        Object.keys(data).forEach(key => {
            const element = this.form.querySelector(`[name="${key}"]`);
            if (element) {
                switch (element.type) {
                    case 'checkbox':
                        element.checked = !!data[key];
                        break;
                    case 'radio':
                        const radio = this.form.querySelector(`[name="${key}"][value="${data[key]}"]`);
                        if (radio) radio.checked = true;
                        break;
                    default:
                        element.value = data[key] || '';
                }
            }
        });
    }

    reset() {
        this.form.reset();
        this.errors = {};
        
        // Clear validation states
        this.form.querySelectorAll('.field-valid, .field-invalid').forEach(field => {
            field.classList.remove('field-valid', 'field-invalid');
        });
        
        this.form.querySelectorAll('.validation-error, .validation-success').forEach(div => {
            div.style.display = 'none';
        });
        
        // Reset file input text
        this.form.querySelectorAll('.file-input-text').forEach(span => {
            span.textContent = 'No file selected';
        });
        
        this.updateProgress();
    }

    getFieldConfig(fieldName) {
        return this.options.fields.find(field => field.name === fieldName);
    }

    updateProgress() {
        if (!this.options.showProgress) return;
        
        const totalFields = this.options.fields.filter(f => f.type !== 'hidden').length;
        const completedFields = this.options.fields.filter(f => {
            if (f.type === 'hidden') return true;
            const value = this.getFieldValue(f.name);
            return value !== null && value !== '' && value !== false;
        }).length;
        
        const progress = totalFields > 0 ? (completedFields / totalFields) * 100 : 0;
        const progressBar = this.form.querySelector('.progress-bar');
        if (progressBar) {
            progressBar.style.width = `${progress}%`;
        }
    }

    setFieldValue(fieldName, value) {
        const element = this.form.querySelector(`[name="${fieldName}"]`);
        if (element) {
            switch (element.type) {
                case 'checkbox':
                    element.checked = !!value;
                    break;
                case 'radio':
                    const radio = this.form.querySelector(`[name="${fieldName}"][value="${value}"]`);
                    if (radio) radio.checked = true;
                    break;
                default:
                    element.value = value || '';
            }
            
            // Trigger validation
            if (this.options.validateOnInput) {
                const field = this.getFieldConfig(fieldName);
                if (field) {
                    this.validateField(field, value);
                }
            }
        }
    }

    disable() {
        this.form.querySelectorAll('input, select, textarea, button').forEach(element => {
            element.disabled = true;
        });
    }

    enable() {
        this.form.querySelectorAll('input, select, textarea, button').forEach(element => {
            element.disabled = false;
        });
    }
}
