/**
 * Enhanced GisDashboard.js
 *
 * This module is responsible for initializing and managing the enhanced GIS dashboard,
 * including advanced Leaflet map features, multiple layers, overlays, and analysis tools.
 */
export class GisDashboard {
  constructor(contracts) {
    this.map = null;
    this.mineLocations = [];
    this.contracts = contracts || [];

    // Enhanced layer structure with additional map layers and overlays
    this.layers = {
      mines: L.layerGroup(),
      quarries: L.layerGroup(),
      concessions: L.layerGroup(),
      districts: L.layerGroup(),
      protectedAreas: L.layerGroup(),
      infrastructure: L.layerGroup(),
      markerClusters: null,
    };

    // Base tile layers for different map types
    this.baseLayers = {};
    this.overlayMaps = {};

    // Analysis tools
    this.measureControl = null;
    this.drawControl = null;
    this.geocoder = null;
    this.currentPosition = null;

    // Icons for different entity types
    this.icons = this.createIcons();

    // Initialize map controls and features
    this.initializeMapFeatures();
  }

  /**
   * Create custom icons for different entity types
   */
  createIcons() {
    const iconConfig = {
      iconSize: [25, 41],
      iconAnchor: [12, 41],
      popupAnchor: [1, -34],
      shadowSize: [41, 41],
      shadowUrl:
        "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    };

    return {
      mine: new L.Icon({
        ...iconConfig,
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
      }),
      quarry: new L.Icon({
        ...iconConfig,
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
      }),
      coalMine: new L.Icon({
        ...iconConfig,
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-black.png",
      }),
      ironMine: new L.Icon({
        ...iconConfig,
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
      }),
      gravelQuarry: new L.Icon({
        ...iconConfig,
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
      }),
      infrastructure: new L.Icon({
        ...iconConfig,
        iconUrl:
          "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
      }),
    };
  }

  /**
   * Initialize advanced map features and controls
   */
  initializeMapFeatures() {
    // Initialize marker clustering
    this.layers.markerClusters = L.markerClusterGroup({
      chunkedLoading: true,
      maxClusterRadius: 50,
      spiderfyOnMaxZoom: false,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      iconCreateFunction: function (cluster) {
        const childCount = cluster.getChildCount();
        let className = "marker-cluster-";

        if (childCount < 10) {
          className += "small";
        } else if (childCount < 100) {
          className += "medium";
        } else {
          className += "large";
        }

        return new L.DivIcon({
          html: "<div><span>" + childCount + "</span></div>",
          className: "marker-cluster " + className,
          iconSize: new L.Point(40, 40),
        });
      },
    });
  }

  /**
   * Initializes the enhanced GIS dashboard with advanced features
   */
  init() {
    // Check if the map is already initialized
    if (this.map) {
      return;
    }

    // Initialize the map
    this.map = L.map("map").setView([-26.5225, 31.4659], 9); // Centered on Eswatini

    // Setup base layers (different map types)
    this.setupBaseLayers();

    // Setup overlay layers
    this.setupOverlayLayers();

    // Add layer control with base layers and overlays
    const layerControl = L.control
      .layers(this.baseLayers, this.overlayMaps)
      .addTo(this.map);

    // Add default layers
    this.baseLayers["OpenStreetMap"].addTo(this.map);
    this.layers.mines.addTo(this.map);
    this.layers.quarries.addTo(this.map);
    this.layers.markerClusters.addTo(this.map);

    // Setup measurement tools
    this.setupMeasurementTools();

    // Setup drawing tools
    this.setupDrawingTools();

    // Add search/geocoding
    this.setupGeocoder();

    // Add coordinate display
    this.setupCoordinateDisplay();

    // Add map scale
    L.control.scale({ imperial: false }).addTo(this.map);

    // Add fullscreen control
    this.setupFullscreenControl();

    // Add location control
    this.setupLocationControl();

    // Load all map data
    this.loadMines();
    this.loadConcessions();
    this.loadDistricts();
    this.loadProtectedAreas();
    this.loadInfrastructure();
    this.addEnhancedLegend();

    // Add map export functionality
    this.setupMapExport();

    console.log("Enhanced GIS Dashboard initialized with advanced features.");
  }

  /**
   * Setup different base tile layers (map types)
   */
  setupBaseLayers() {
    this.baseLayers = {
      OpenStreetMap: L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        },
      ),
      Satellite: L.tileLayer(
        "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
        {
          attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
        },
      ),
      Terrain: L.tileLayer(
        "https://stamen-tiles-{s}.a.ssl.fastly.net/terrain/{z}/{x}/{y}{r}.png",
        {
          attribution:
            'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> — Map data © <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        },
      ),
      Topographic: L.tileLayer(
        "https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png",
        {
          attribution:
            'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a>',
        },
      ),
    };
  }

  /**
   * Setup overlay layers for geographic data
   */
  setupOverlayLayers() {
    this.overlayMaps = {
      Mines: this.layers.mines,
      Quarries: this.layers.quarries,
      "Mining Concessions": this.layers.concessions,
      "Administrative Districts": this.layers.districts,
      "Protected Areas": this.layers.protectedAreas,
      Infrastructure: this.layers.infrastructure,
      "Clustered Markers": this.layers.markerClusters,
    };
  }

  /**
   * Adds enhanced mine markers to the map with detailed popups
   * @param {Array} mines - An array of mine objects, each with name, lat, and lon properties.
   */
  addMineMarkers(mines) {
    this.mineLocations = mines;
    this.mineLocations.forEach((mine) => {
      const isQuarry = mine.name.toLowerCase().includes("quarry");
      const mineralType = this.getMineralType(mine.name);

      // Select appropriate icon based on mine type and mineral
      let icon = this.selectIcon(mine.name, mineralType, isQuarry);
      const layer = isQuarry ? this.layers.quarries : this.layers.mines;

      const contract = this.contracts.find((c) => c.entity === mine.name);

      // Create enhanced popup content
      const popupContent = this.createEnhancedPopup(mine, contract);

      // Create marker with enhanced popup
      const marker = L.marker([mine.lat, mine.lon], { icon: icon }).bindPopup(
        popupContent,
        {
          maxWidth: 300,
          className: "enhanced-popup",
        },
      );

      // Add to both regular layer and cluster group
      marker.addTo(layer);
      this.layers.markerClusters.addLayer(marker);

      // Add click event for additional functionality
      marker.on("click", (e) => {
        this.onMarkerClick(mine, e);
      });
    });
  }

  /**
   * Determine mineral type from mine name or contract data
   */
  getMineralType(mineName) {
    if (
      mineName.toLowerCase().includes("coal") ||
      mineName.toLowerCase().includes("colliery")
    ) {
      return "coal";
    } else if (
      mineName.toLowerCase().includes("iron") ||
      mineName === "Ngwenya Mine"
    ) {
      return "iron";
    } else if (
      mineName.toLowerCase().includes("gravel") ||
      mineName.toLowerCase().includes("quarry")
    ) {
      return "gravel";
    }
    return "general";
  }

  /**
   * Select appropriate icon based on mine characteristics
   */
  selectIcon(mineName, mineralType, isQuarry) {
    if (mineralType === "coal") {
      return this.icons.coalMine;
    } else if (mineralType === "iron") {
      return this.icons.ironMine;
    } else if (mineralType === "gravel") {
      return this.icons.gravelQuarry;
    } else if (isQuarry) {
      return this.icons.quarry;
    }
    return this.icons.mine;
  }

  /**
   * Create enhanced popup content with detailed information
   */
  createEnhancedPopup(mine, contract) {
    const coordinates = `${mine.lat.toFixed(4)}, ${mine.lon.toFixed(4)}`;
    let popupContent = `
            <div class="enhanced-popup-content">
                <h4>${mine.name}</h4>
                <p><strong>Coordinates:</strong> ${coordinates}</p>
        `;

    if (contract) {
      const getContractStatus = (c) => {
          const now = new Date();
          const start = new Date(c.startDate);
          if (c.endDate) {
              const end = new Date(c.endDate);
              if (now < start) return "Pending";
              if (now > end) return "Expired";
              return "Active";
          }
          return now >= start ? "Active" : "Pending";
      };
      const status = getContractStatus(contract);
      const statusClass = status.toLowerCase();

      popupContent += `
                <p><strong>Mineral:</strong> ${contract.mineral}</p>
                <p><strong>Status:</strong> <span class="status-badge ${statusClass}">${status}</span></p>
                <p><strong>Start Date:</strong> ${new Date(contract.startDate).toLocaleDateString()}</p>
                <p><strong>End Date:</strong> ${contract.endDate ? new Date(contract.endDate).toLocaleDateString() : "N/A"}</p>
                <p><strong>Contract Value:</strong> ${contract.value ? "E" + contract.value.toLocaleString() : "N/A"}</p>
            `;
    }

    popupContent += `
                <div class="popup-actions">
                    <button onclick="app.gisDashboard.zoomToLocation(${mine.lat}, ${mine.lon})" class="btn btn-sm btn-primary">
                        <i class="fas fa-search-plus"></i> Zoom In
                    </button>
                    <button onclick="app.gisDashboard.measureDistance(${mine.lat}, ${mine.lon})" class="btn btn-sm btn-info">
                        <i class="fas fa-ruler"></i> Measure
                    </button>
                    <button onclick="app.gisDashboard.showDetails('${mine.name}')" class="btn btn-sm btn-secondary">
                        <i class="fas fa-info-circle"></i> Details
                    </button>
                </div>
            </div>
        `;

    return popupContent;
  }

  /**
   * Handle marker click events
   */
  onMarkerClick(mine, event) {
    // Update coordinate display
    this.updateCoordinateDisplay(mine.lat, mine.lon);

    // Optional: Add analytics tracking
    console.log(`Marker clicked: ${mine.name} at ${mine.lat}, ${mine.lon}`);
  }

  /**
   * Loads the mine locations and adds them to the map.
   */
  loadMines() {
    const mines = [
      { name: "Maloma Colliery", lat: -27.01667, lon: 31.65 },
      { name: "Ngwenya Mine", lat: -26.20335, lon: 31.02779 },
      { name: "Mbabane Quarry", lat: -26.2012, lon: 31.03058 },
      { name: "Kwalini Quarry", lat: -26.53028, lon: 31.18889 },
      { name: "Sidvokodvo Quarry", lat: -26.6321289, lon: 31.4213323 },
      { name: "Malolotja Mine", lat: -26.16667, lon: 31.1 },
    ];

    this.addMineMarkers(mines);
  }

  /**
   * Load mining concession boundaries
   */
  loadConcessions() {
    const concessionData = [
      {
        name: "Maloma Colliery Concession",
        coordinates: [
          [-27.05, 31.6],
          [-26.98, 31.6],
          [-26.98, 31.7],
          [-27.05, 31.7],
          [-27.05, 31.6],
        ],
        type: "Coal Mining",
        status: "Active",
      },
      {
        name: "Ngwenya Mining Area",
        coordinates: [
          [-26.25, 30.98],
          [-26.15, 30.98],
          [-26.15, 31.08],
          [-26.25, 31.08],
          [-26.25, 30.98],
        ],
        type: "Iron Ore Mining",
        status: "Active",
      },
    ];

    concessionData.forEach((concession) => {
      const polygon = L.polygon(concession.coordinates, {
        color: "#ff6b35",
        weight: 2,
        opacity: 0.8,
        fillColor: "#ff6b35",
        fillOpacity: 0.2,
      }).addTo(this.layers.concessions);

      polygon.bindPopup(`
                <div class="concession-popup">
                    <h5>${concession.name}</h5>
                    <p><strong>Type:</strong> ${concession.type}</p>
                    <p><strong>Status:</strong> <span class="status-badge ${concession.status.toLowerCase()}">${concession.status}</span></p>
                    <p><strong>Area:</strong> ${(L.GeometryUtil.geodesicArea(polygon.getLatLngs()[0]) / 1000000).toFixed(2)} km²</p>
                </div>
            `);
    });
  }

  /**
   * Load administrative district overlays
   */
  loadDistricts() {
    const districtData = [
      {
        name: "Hhohho Region",
        coordinates: [
          [-26.0, 31.0],
          [-25.8, 31.0],
          [-25.8, 31.3],
          [-26.0, 31.3],
          [-26.0, 31.0],
        ],
      },
      {
        name: "Manzini Region",
        coordinates: [
          [-26.3, 31.0],
          [-26.1, 31.0],
          [-26.1, 31.4],
          [-26.3, 31.4],
          [-26.3, 31.0],
        ],
      },
    ];

    districtData.forEach((district) => {
      const polygon = L.polygon(district.coordinates, {
        color: "#2563eb",
        weight: 1,
        opacity: 0.6,
        fillColor: "#2563eb",
        fillOpacity: 0.1,
        dashArray: "5, 5",
      }).addTo(this.layers.districts);

      polygon.bindPopup(
        `<h5>${district.name}</h5><p>Administrative District</p>`,
      );
    });
  }

  /**
   * Load environmental protection areas
   */
  loadProtectedAreas() {
    const protectedAreas = [
      {
        name: "Malolotja Nature Reserve",
        coordinates: [
          [-26.2, 31.05],
          [-26.1, 31.05],
          [-26.1, 31.15],
          [-26.2, 31.15],
          [-26.2, 31.05],
        ],
      },
    ];

    protectedAreas.forEach((area) => {
      const polygon = L.polygon(area.coordinates, {
        color: "#16a34a",
        weight: 2,
        opacity: 0.8,
        fillColor: "#16a34a",
        fillOpacity: 0.3,
      }).addTo(this.layers.protectedAreas);

      polygon.bindPopup(
        `<h5>${area.name}</h5><p>Protected Environmental Area</p>`,
      );
    });
  }

  /**
   * Load infrastructure overlays (roads, railways)
   */
  loadInfrastructure() {
    const infrastructureData = [
      {
        name: "Main Highway",
        coordinates: [
          [-26.5, 31.0],
          [-26.3, 31.2],
          [-26.1, 31.4],
        ],
        type: "highway",
      },
      {
        name: "Railway Line",
        coordinates: [
          [-26.8, 31.1],
          [-26.5, 31.3],
          [-26.2, 31.5],
        ],
        type: "railway",
      },
    ];

    infrastructureData.forEach((infra) => {
      const polyline = L.polyline(infra.coordinates, {
        color: infra.type === "highway" ? "#dc2626" : "#7c3aed",
        weight: 4,
        opacity: 0.8,
      }).addTo(this.layers.infrastructure);

      polyline.bindPopup(
        `<h5>${infra.name}</h5><p>Infrastructure: ${infra.type}</p>`,
      );
    });
  }

  /**
   * Setup measurement tools for distance and area calculation
   */
  setupMeasurementTools() {
    this.measure = {
        points: [],
        line: null,
        tooltip: null,
    };

    const measureControl = L.control({ position: "topleft" });

    measureControl.onAdd = (map) => {
      const div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
      div.innerHTML = '<a href="#" title="Measure distances"><i class="fas fa-ruler"></i></a>';
      div.style.backgroundColor = "white";
      div.style.width = "30px";
      div.style.height = "30px";
      div.style.lineHeight = "30px";
      div.style.textAlign = "center";

      L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation)
                .on(div, 'click', L.DomEvent.preventDefault)
                .on(div, 'click', () => this.toggleMeasureMode());

      return div;
    };

    measureControl.addTo(this.map);
    this.measureControl = measureControl;
  }

  /**
   * Setup drawing tools for buffer zones and custom shapes
   */
  setupDrawingTools() {
    this.draw = {
        points: [],
        polygon: null,
    };

    const drawControl = L.control({ position: "topleft" });

    drawControl.onAdd = (map) => {
      const div = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
      div.innerHTML = '<a href="#" title="Draw a polygon"><i class="fas fa-draw-polygon"></i></a>';
      div.style.backgroundColor = "white";
      div.style.width = "30px";
      div.style.height = "30px";
      div.style.lineHeight = "30px";
      div.style.textAlign = "center";

      L.DomEvent.on(div, 'click', L.DomEvent.stopPropagation)
                .on(div, 'click', L.DomEvent.preventDefault)
                .on(div, 'click', () => this.toggleDrawMode());

      return div;
    };

    drawControl.addTo(this.map);
    this.drawControl = drawControl;
  }

  /**
   * Setup geocoder for location search
   */
  setupGeocoder() {
    // Simple geocoder implementation
    const geocoderControl = L.control({ position: "topright" });

    geocoderControl.onAdd = (map) => {
      const div = L.DomUtil.create("div", "geocoder-control");
      div.innerHTML = `
                <input type="text" id="geocoder-input" placeholder="Search location..." />
                <button id="geocoder-btn"><i class="fas fa-search"></i></button>
            `;
      div.style.backgroundColor = "white";
      div.style.padding = "5px";
      div.style.borderRadius = "3px";
      div.style.border = "1px solid #ccc";

      return div;
    };

    geocoderControl.addTo(this.map);

    // Add event listeners after control is added
    setTimeout(() => {
      const input = document.getElementById("geocoder-input");
      const button = document.getElementById("geocoder-btn");

      if (input && button) {
        button.onclick = () => this.searchLocation(input.value);
        input.onkeypress = (e) => {
          if (e.key === "Enter") this.searchLocation(input.value);
        };
      }
    }, 100);
  }

  /**
   * Setup coordinate display
   */
  setupCoordinateDisplay() {
    const coordDisplay = L.control({ position: "bottomleft" });

    coordDisplay.onAdd = (map) => {
      const div = L.DomUtil.create("div", "coord-display");
      div.innerHTML =
        '<span id="coord-text">Click on map for coordinates</span>';
      div.style.backgroundColor = "rgba(255,255,255,0.8)";
      div.style.padding = "5px 10px";
      div.style.borderRadius = "3px";
      div.style.border = "1px solid #ccc";
      div.style.fontSize = "12px";

      return div;
    };

    coordDisplay.addTo(this.map);

    // Update coordinates on map click
    this.map.on("click", (e) => {
      this.updateCoordinateDisplay(e.latlng.lat, e.latlng.lng);
    });
  }

  /**
   * Setup fullscreen control
   */
  setupFullscreenControl() {
    const fullscreenControl = L.control({ position: "topleft" });

    fullscreenControl.onAdd = (map) => {
      const div = L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control leaflet-control-custom",
      );
      div.innerHTML =
        '<a href="#" title="Toggle fullscreen"><i class="fas fa-expand"></i></a>';
      div.style.backgroundColor = "white";
      div.style.width = "30px";
      div.style.height = "30px";
      div.style.lineHeight = "30px";
      div.style.textAlign = "center";

      div.onclick = () => {
        this.toggleFullscreen();
      };

      return div;
    };

    fullscreenControl.addTo(this.map);
  }

  /**
   * Setup location control for GPS positioning
   */
  setupLocationControl() {
    const locationControl = L.control({ position: "topleft" });

    locationControl.onAdd = (map) => {
      const div = L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control leaflet-control-custom",
      );
      div.innerHTML =
        '<a href="#" title="Show my location"><i class="fas fa-crosshairs"></i></a>';
      div.style.backgroundColor = "white";
      div.style.width = "30px";
      div.style.height = "30px";
      div.style.lineHeight = "30px";
      div.style.textAlign = "center";

      div.onclick = () => {
        this.locateUser();
      };

      return div;
    };

    locationControl.addTo(this.map);
  }

  /**
   * Setup map export functionality
   */
  setupMapExport() {
    const exportControl = L.control({ position: "topleft" });

    exportControl.onAdd = (map) => {
      const div = L.DomUtil.create(
        "div",
        "leaflet-bar leaflet-control leaflet-control-custom",
      );
      div.innerHTML =
        '<a href="#" title="Export map"><i class="fas fa-download"></i></a>';
      div.style.backgroundColor = "white";
      div.style.width = "30px";
      div.style.height = "30px";
      div.style.lineHeight = "30px";
      div.style.textAlign = "center";

      div.onclick = () => {
        this.exportMap();
      };

      return div;
    };

    exportControl.addTo(this.map);
  }

  // Analysis and utility methods
  toggleMeasureMode() {
    this.isMeasuring = !this.isMeasuring;
    const measureIcon = this.measureControl.getContainer().querySelector('i');

    if (this.isMeasuring) {
        measureIcon.style.color = '#2563eb'; // Active color
        this.map.on('click', this.onMapClickForMeasure, this);
        this.map.getContainer().style.cursor = 'crosshair';
    } else {
        measureIcon.style.color = '#000'; // Default color
        this.map.off('click', this.onMapClickForMeasure, this);
        this.map.getContainer().style.cursor = '';
        this.clearMeasurement();
    }
  }

  onMapClickForMeasure(e) {
    this.measure.points.push(e.latlng);

    if (this.measure.points.length === 1) {
        this.measure.tooltip = L.tooltip({ permanent: true })
            .setLatLng(e.latlng)
            .setContent("Click to set the second point")
            .addTo(this.map);
    }

    if (this.measure.points.length === 2) {
        if (this.measure.line) {
            this.map.removeLayer(this.measure.line);
        }
        this.measure.line = L.polyline(this.measure.points, { color: 'red' }).addTo(this.map);

        const distance = this.measure.points[0].distanceTo(this.measure.points[1]);
        this.measure.tooltip.setContent(`Distance: ${(distance / 1000).toFixed(2)} km`);

        // Reset for next measurement
        this.measure.points = [];
        setTimeout(() => this.toggleMeasureMode(), 1000); // Auto-disable after measurement
    }
  }

  clearMeasurement() {
    if (this.measure.line) {
        this.map.removeLayer(this.measure.line);
    }
    if (this.measure.tooltip) {
        this.map.removeLayer(this.measure.tooltip);
    }
    this.measure.points = [];
    this.measure.line = null;
    this.measure.tooltip = null;
  }

  toggleDrawMode() {
    this.isDrawing = !this.isDrawing;
    const drawIcon = this.drawControl.getContainer().querySelector('i');

    if (this.isDrawing) {
        drawIcon.style.color = '#2563eb';
        this.map.on('click', this.onMapClickForDraw, this);
        this.map.getContainer().style.cursor = 'crosshair';

        // Add a button to finish drawing
        this.addFinishDrawingButton();
    } else {
        drawIcon.style.color = '#000';
        this.map.off('click', this.onMapClickForDraw, this);
        this.map.getContainer().style.cursor = '';
        this.clearDrawing();
        this.removeFinishDrawingButton();
    }
  }

  onMapClickForDraw(e) {
    this.draw.points.push(e.latlng);
    if (this.draw.polygon) {
        this.map.removeLayer(this.draw.polygon);
    }
    this.draw.polygon = L.polygon(this.draw.points, { color: 'blue' }).addTo(this.map);
  }

  addFinishDrawingButton() {
      if(this.finishDrawingControl) return;
      this.finishDrawingControl = L.control({ position: 'topright' });
      this.finishDrawingControl.onAdd = (map) => {
          const div = L.DomUtil.create('div', 'leaflet-control-custom finish-drawing-btn');
          div.innerHTML = '<button class="btn btn-primary">Finish Drawing</button>';
          L.DomEvent.on(div, 'click', () => {
              this.toggleDrawMode();
          });
          return div;
      };
      this.finishDrawingControl.addTo(this.map);
  }

  removeFinishDrawingButton() {
      if(this.finishDrawingControl) {
          this.map.removeControl(this.finishDrawingControl);
          this.finishDrawingControl = null;
      }
  }

  clearDrawing() {
    if (this.draw.polygon) {
        this.map.removeLayer(this.draw.polygon);
    }
    this.draw.points = [];
    this.draw.polygon = null;
  }

  searchLocation(query) {
    if (!query) return;

    const searchTerm = query.toLowerCase();
    const result = this.mineLocations.find(mine => mine.name.toLowerCase().includes(searchTerm));

    if (result) {
        this.map.setView([result.lat, result.lon], 14);
        const marker = this.findMarkerByMineName(result.name);
        if (marker) {
            marker.openPopup();
        }
    } else {
        alert(`Location "${query}" not found`);
    }
  }

  findMarkerByMineName(name) {
      let foundMarker = null;
      this.layers.markerClusters.eachLayer(marker => {
          if (marker.getPopup().getContent().includes(name)) {
              foundMarker = marker;
          }
      });
      return foundMarker;
  }

  updateCoordinateDisplay(lat, lng) {
    const coordElement = document.getElementById("coord-text");
    if (coordElement) {
      coordElement.innerHTML = `Lat: ${lat.toFixed(4)}, Lng: ${lng.toFixed(4)}`;
    }
  }

  toggleFullscreen() {
    const mapContainer = document.getElementById("map");
    if (!document.fullscreenElement) {
      mapContainer.requestFullscreen().then(() => {
        setTimeout(() => this.map.invalidateSize(), 100);
      });
    } else {
      document.exitFullscreen().then(() => {
        setTimeout(() => this.map.invalidateSize(), 100);
      });
    }
  }

  locateUser() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          this.map.setView([lat, lng], 15);

          if (this.currentPosition) {
            this.map.removeLayer(this.currentPosition);
          }

          this.currentPosition = L.marker([lat, lng])
            .bindPopup("Your current location")
            .addTo(this.map);
        },
        (error) => {
          alert("Could not get your location: " + error.message);
        },
      );
    } else {
      alert("Geolocation not supported by this browser");
    }
  }

  exportMap() {
    // Simple implementation - would use html2canvas or similar in production
    const mapContainer = document.getElementById("map");
    const mapBounds = this.map.getBounds();
    const mapCenter = this.map.getCenter();
    const mapZoom = this.map.getZoom();

    const exportData = {
      bounds: mapBounds,
      center: mapCenter,
      zoom: mapZoom,
      layers: Object.keys(this.overlayMaps).filter((key) =>
        this.map.hasLayer(this.overlayMaps[key]),
      ),
      timestamp: new Date().toISOString(),
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: "application/json" });

    const link = document.createElement("a");
    link.href = URL.createObjectURL(dataBlob);
    link.download = `map_export_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Public methods for popup actions
  zoomToLocation(lat, lng) {
    this.map.setView([lat, lng], 15);
  }

  measureDistance(lat, lng) {
    console.log(
      `Measure distance from ${lat}, ${lng} - implement with leaflet-measure`,
    );
  }

  showDetails(mineName) {
    const mine = this.mineLocations.find((m) => m.name === mineName);
    const contract = this.contracts.find((c) => c.entity === mineName);

    let details = `Details for ${mineName}:\n`;
    if (mine) {
      details += `Location: ${mine.lat}, ${mine.lon}\n`;
    }
    if (contract) {
      details += `Mineral: ${contract.mineral}\n`;
      details += `Start Date: ${contract.startDate}\n`;
    }

    alert(details);
  }

  addEnhancedLegend() {
    const legend = L.control({ position: "bottomright" });

    legend.onAdd = () => {
      const div = L.DomUtil.create("div", "info legend enhanced-legend");
      let labels = [
        '<h4><i class="fas fa-map-marked-alt"></i> Map Legend</h4>',
      ];

      // Mining markers
      labels.push('<div class="legend-section"><h5>Mining Operations</h5>');
      labels.push(
        `<div class="legend-item"><img src="${this.icons.mine.options.iconUrl}" style="width: 16px; height: 24px;"> General Mine</div>`,
      );
      labels.push(
        `<div class="legend-item"><img src="${this.icons.coalMine.options.iconUrl}" style="width: 16px; height: 24px;"> Coal Mine</div>`,
      );
      labels.push(
        `<div class="legend-item"><img src="${this.icons.ironMine.options.iconUrl}" style="width: 16px; height: 24px;"> Iron Ore Mine</div>`,
      );
      labels.push(
        `<div class="legend-item"><img src="${this.icons.quarry.options.iconUrl}" style="width: 16px; height: 24px;"> Quarry</div>`,
      );
      labels.push(
        `<div class="legend-item"><img src="${this.icons.gravelQuarry.options.iconUrl}" style="width: 16px; height: 24px;"> Gravel Quarry</div></div>`,
      );

      // Area overlays
      labels.push('<div class="legend-section"><h5>Areas & Boundaries</h5>');
      labels.push(
        '<div class="legend-item"><span class="legend-polygon" style="background: rgba(255,107,53,0.3); border: 2px solid #ff6b35;"></span> Mining Concessions</div>',
      );
      labels.push(
        '<div class="legend-item"><span class="legend-polygon" style="background: rgba(37,99,235,0.1); border: 1px dashed #2563eb;"></span> Administrative Districts</div>',
      );
      labels.push(
        '<div class="legend-item"><span class="legend-polygon" style="background: rgba(22,163,74,0.3); border: 2px solid #16a34a;"></span> Protected Areas</div></div>',
      );

      // Infrastructure
      labels.push('<div class="legend-section"><h5>Infrastructure</h5>');
      labels.push(
        '<div class="legend-item"><span class="legend-line" style="background: #dc2626;"></span> Highways</div>',
      );
      labels.push(
        '<div class="legend-item"><span class="legend-line" style="background: #7c3aed;"></span> Railways</div></div>',
      );

      div.innerHTML = labels.join("");
      div.style.maxHeight = "400px";
      div.style.overflowY = "auto";
      div.style.padding = "10px";
      div.style.fontSize = "12px";

      return div;
    };

    legend.addTo(this.map);
  }
}
