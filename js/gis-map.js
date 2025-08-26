document.addEventListener('DOMContentLoaded', function () {
    // Check if Leaflet is loaded
    if (typeof L === 'undefined') {
        console.error('Leaflet is not loaded!');
        return;
    }

    // Initialize the map
    const map = L.map('gis-map').setView([-26.5, 31.5], 8);

    // Add a tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Sample data for mines and quarries
    const locations = [
        { name: 'Kwalini Quarry', lat: -26.3, lng: 31.3, type: 'Quarry' },
        { name: 'Mbabane Quarry', lat: -26.3167, lng: 31.1333, type: 'Quarry' },
        { name: 'Sidvokodvo Quarry', lat: -26.6333, lng: 31.4333, type: 'Quarry' },
        { name: 'Maloma Colliery', lat: -27.0167, lng: 31.65, type: 'Mine' },
        { name: 'Ngwenya Mine', lat: -26.2167, lng: 31.0333, type: 'Mine' },
        { name: 'Malolotja Mine', lat: -26.0667, lng: 31.1333, type: 'Mine' }
    ];

    // Add markers to the map
    locations.forEach(location => {
        const marker = L.marker([location.lat, location.lng]).addTo(map);
        marker.bindPopup(`<b>${location.name}</b><br>${location.type}`);
    });
});
