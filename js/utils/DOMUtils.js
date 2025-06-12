export class DOMUtils {
    static createElement(tag, attributes = {}, children = []) {
        const element = document.createElement(tag);
        
        Object.entries(attributes).forEach(([key, value]) => {
            if (key === 'className') {
                element.className = value;
            } else if (key === 'innerHTML') {
                element.innerHTML = value;
            } else {
                element.setAttribute(key, value);
            }
        });
        
        children.forEach(child => {
            if (typeof child === 'string') {
                element.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                element.appendChild(child);
            }
        });
        
        return element;
    }

    static updateElement(id, content) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = content;
            return true;
        }
        return false;
    }

    static createModal(title, content, actions = []) {
        return this.createElement('div', {
            className: 'modal-overlay',
            innerHTML: `
                <div class="modal-container">
                    <div class="modal-header">
                        <h3>${title}</h3>
                        <button class="modal-close">×</button>
                    </div>
                    <div class="modal-body">${content}</div>
                    <div class="modal-footer">
                        ${actions.map(action => 
                            `<button class="btn ${action.class || 'btn-secondary'}" data-action="${action.action}">${action.text}</button>`
                        ).join('')}
                    </div>
                </div>
            `
        });
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function() {
            const args = arguments;
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}
