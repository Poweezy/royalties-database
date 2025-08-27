/**
 * GisDashboard.js
 *
 * This module is responsible for initializing and managing the GIS dashboard,
 * including the Leaflet map, tile layers, and mine markers.
 */
export class GisDashboard {
    constructor() {
        this.map = null;
        this.mineLocations = [];
    }

    /**
     * Initializes the GIS dashboard. This function is called when the user navigates to the GIS dashboard section.
     */
    init() {
        // Check if the map is already initialized
        if (this.map) {
            return;
        }

        // Initialize the map
        this.map = L.map('map').setView([-26.5225, 31.4659], 9); // Centered on Eswatini

        // Add a tile layer from OpenStreetMap
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.map);

        console.log('GIS Dashboard initialized.');

        this.loadMines();
    }

    /**
     * Adds mine markers to the map.
     * @param {Array} mines - An array of mine objects, each with name, lat, and lon properties.
     */
    addMineMarkers(mines) {
        this.mineLocations = mines;
        this.mineLocations.forEach(mine => {
            const marker = L.marker([mine.lat, mine.lon]).addTo(this.map);
            marker.bindPopup(`<b>${mine.name}</b>`);
        });
    }

    /**
     * Loads the mine locations and adds them to the map.
     */
    loadMines() {
        const mines = [
            { name: 'Maloma Colliery', lat: -27.01667, lon: 31.65 },
            { name: 'Ngwenya Mine', lat: -26.20335, lon: 31.02779 },
            { name: 'Mbabane Quarry', lat: -26.20120, lon: 31.03058 },
            { name: 'Kwalini Quarry', lat: -26.53028, lon: 31.18889 },
            { name: 'Sidvokodvo Quarry', lat: -26.6321289, lon: 31.4213323 },
            { name: 'Malolotja Mine', lat: -26.16667, lon: 31.1 }
        ];

        this.addMineMarkers(mines);
    }
}
