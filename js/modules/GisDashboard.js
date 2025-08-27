/**
 * GisDashboard.js
 *
 * This module is responsible for initializing and managing the GIS dashboard,
 * including the Leaflet map, tile layers, and mine markers.
 */
export class GisDashboard {
    constructor(contracts) {
        this.map = null;
        this.mineLocations = [];
        this.contracts = contracts || [];
        this.layers = {
            mines: L.layerGroup(),
            quarries: L.layerGroup()
        };

        this.mineIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        this.quarryIcon = new L.Icon({
            iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
            shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
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

        const overlayMaps = {
            "Mines": this.layers.mines,
            "Quarries": this.layers.quarries
        };

        L.control.layers(null, overlayMaps).addTo(this.map);
        this.layers.mines.addTo(this.map);
        this.layers.quarries.addTo(this.map);

        console.log('GIS Dashboard initialized.');

        this.loadMines();
        this.addLegend();
    }

    /**
     * Adds mine markers to the map.
     * @param {Array} mines - An array of mine objects, each with name, lat, and lon properties.
     */
    addMineMarkers(mines) {
        this.mineLocations = mines;
        this.mineLocations.forEach(mine => {
            const isQuarry = mine.name.toLowerCase().includes('quarry');
            const icon = isQuarry ? this.quarryIcon : this.mineIcon;
            const layer = isQuarry ? this.layers.quarries : this.layers.mines;

            const contract = this.contracts.find(c => c.entity === mine.name);
            let popupContent = `<b>${mine.name}</b>`;

            if (contract) {
                const status = new Date(contract.startDate) < new Date() ? 'Active' : 'Pending';
                popupContent += `<br>Mineral: ${contract.mineral}<br>Status: ${status}`;
            }

            const marker = L.marker([mine.lat, mine.lon], { icon: icon }).addTo(layer);
            marker.bindPopup(popupContent);
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

    addLegend() {
        const legend = L.control({ position: 'bottomright' });

        legend.onAdd = () => {
            const div = L.DomUtil.create('div', 'info legend');
            let labels = ['<strong>Legend</strong>'];

            labels.push(`<img src="${this.mineIcon.options.iconUrl}" style="width: 12px; height: 20px;"> Mine`);
            labels.push(`<img src="${this.quarryIcon.options.iconUrl}" style="width: 12px; height: 20px;"> Quarry`);

            div.innerHTML = labels.join('<br>');
            return div;
        };

        legend.addTo(this.map);
    }
}
