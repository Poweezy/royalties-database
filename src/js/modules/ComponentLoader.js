// Component loader
export function loadComponents() {
  document.querySelectorAll('[data-include]').forEach(element => {
    const filePath = element.getAttribute('data-include');
    fetch(filePath)
      .then(response => response.text())
      .then(data => {
        element.innerHTML = data;
        // Trigger any initialization scripts for the component
        const event = new CustomEvent('componentLoaded', { detail: { component: filePath } });
        document.dispatchEvent(event);
      })
      .catch(error => console.error('Error loading component:', error));
  });
}

// Initialize components after they are loaded
document.addEventListener('componentLoaded', (event) => {
  const component = event.detail.component;
  // Add any component-specific initialization here
  console.log(`Component loaded: ${component}`);
});
