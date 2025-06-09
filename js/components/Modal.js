// Modal Component
export class Modal {
    constructor(options = {}) {
        this.options = {
            title: '',
            size: 'medium', // small, medium, large, extra-large
            closeOnOverlay: true,
            showCloseButton: true,
            ...options
        };
        this.modal = null;
        this.isOpen = false;
    }

    create(content) {
        const sizeClass = {
            'small': 'modal-sm',
            'medium': '',
            'large': 'modal-lg',
            'extra-large': 'modal-xl'
        };

        this.modal = document.createElement('div');
        this.modal.className = 'modal-overlay z-modal';
        
        this.modal.innerHTML = `
            <div class="modal-container ${sizeClass[this.options.size]}">
                ${this.options.title ? `
                    <div class="modal-header">
                        <h3>${this.options.title}</h3>
                        ${this.options.showCloseButton ? `
                            <button class="modal-close" type="button">
                                <i class="fas fa-times"></i>
                            </button>
                        ` : ''}
                    </div>
                ` : ''}
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;

        this.setupEventListeners();
        return this.modal;
    }

    setupEventListeners() {
        if (this.options.showCloseButton) {
            const closeBtn = this.modal.querySelector('.modal-close');
            if (closeBtn) {
                closeBtn.addEventListener('click', () => this.close());
            }
        }

        if (this.options.closeOnOverlay) {
            this.modal.addEventListener('click', (e) => {
                if (e.target === this.modal) {
                    this.close();
                }
            });
        }

        // Escape key support
        this.escapeHandler = (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        };
        document.addEventListener('keydown', this.escapeHandler);
    }

    open(content) {
        this.create(content);
        document.body.appendChild(this.modal);
        this.isOpen = true;
        
        // Focus management
        const firstFocusable = this.modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
        if (firstFocusable) {
            firstFocusable.focus();
        }

        return this.modal;
    }

    close() {
        if (this.modal && this.modal.parentElement) {
            this.modal.remove();
        }
        this.isOpen = false;
        document.removeEventListener('keydown', this.escapeHandler);
    }

    addFooter(buttons) {
        if (!this.modal) return;

        const footer = document.createElement('div');
        footer.className = 'modal-footer';
        
        buttons.forEach(button => {
            const btn = document.createElement('button');
            btn.className = `btn ${button.class || 'btn-secondary'}`;
            btn.innerHTML = button.text;
            if (button.onClick) {
                btn.addEventListener('click', button.onClick);
            }
            footer.appendChild(btn);
        });

        this.modal.querySelector('.modal-container').appendChild(footer);
    }

    static confirm(message, title = 'Confirm Action') {
        return new Promise((resolve) => {
            const modal = new Modal({
                title,
                size: 'small',
                closeOnOverlay: false
            });

            const content = `
                <div class="text-center">
                    <div class="mb-3">
                        <i class="fas fa-question-circle fa-3x text-warning"></i>
                    </div>
                    <p>${message}</p>
                </div>
            `;

            modal.open(content);
            modal.addFooter([
                {
                    text: '<i class="fas fa-times"></i> Cancel',
                    class: 'btn-secondary',
                    onClick: () => {
                        modal.close();
                        resolve(false);
                    }
                },
                {
                    text: '<i class="fas fa-check"></i> Confirm',
                    class: 'btn-danger',
                    onClick: () => {
                        modal.close();
                        resolve(true);
                    }
                }
            ]);
        });
    }

    static alert(message, title = 'Alert', type = 'info') {
        return new Promise((resolve) => {
            const modal = new Modal({
                title,
                size: 'small'
            });

            const iconMap = {
                'info': 'info-circle text-info',
                'success': 'check-circle text-success',
                'warning': 'exclamation-triangle text-warning',
                'error': 'times-circle text-danger'
            };

            const content = `
                <div class="text-center">
                    <div class="mb-3">
                        <i class="fas fa-${iconMap[type]} fa-3x"></i>
                    </div>
                    <p>${message}</p>
                </div>
            `;

            modal.open(content);
            modal.addFooter([
                {
                    text: '<i class="fas fa-check"></i> OK',
                    class: 'btn-primary',
                    onClick: () => {
                        modal.close();
                        resolve();
                    }
                }
            ]);
        });
    }
}
