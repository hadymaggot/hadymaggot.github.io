// Indonesia Interactive Map with Cyberpunk Theme - GeoJSON Version
// Features: Real GeoJSON boundaries, drilldown navigation, live API integration

// State management
let map = {
    svg: null,
    currentLevel: 'provinces', // provinces, districts, subdistricts, villages
    selectedProvince: null,
    selectedDistrict: null,
    selectedSubdistrict: null,
    breadcrumb: [],
    zoom: {
        level: 1,
        minZoom: 0.5,
        maxZoom: 10,
        step: 0.5,
        currentViewBox: { x: 94, y: -6, width: 54, height: 22 },
        defaultViewBox: { x: 94, y: -6, width: 54, height: 22 }
    },
    layers: {
        provinces: true,
        districts: false,
        subdistricts: false,
        villages: false,
        weather: false,
        traffic: false,
        basemap: true,
        streets: false
    },
    geojsonData: {
        provinces: null,
        districts: {},
        subdistricts: {},
        villages: {}
    }
};

// Province mapping (kode to nama)
const provinceMapping = {
    "11": "Aceh",
    "12": "Sumatera Utara",
    "13": "Sumatera Barat",
    "14": "Riau",
    "15": "Jambi",
    "16": "Sumatera Selatan",
    "17": "Bengkulu",
    "18": "Lampung",
    "19": "Kepulauan Bangka Belitung",
    "21": "Kepulauan Riau",
    "31": "DKI Jakarta",
    "32": "Jawa Barat",
    "33": "Jawa Tengah",
    "34": "DI Yogyakarta",
    "35": "Jawa Timur",
    "36": "Banten",
    "51": "Bali",
    "52": "Nusa Tenggara Barat",
    "53": "Nusa Tenggara Timur",
    "61": "Kalimantan Barat",
    "62": "Kalimantan Tengah",
    "63": "Kalimantan Selatan",
    "64": "Kalimantan Timur",
    "65": "Kalimantan Utara",
    "71": "Sulawesi Utara",
    "72": "Sulawesi Tengah",
    "73": "Sulawesi Selatan",
    "74": "Sulawesi Tenggara",
    "75": "Gorontalo",
    "76": "Sulawesi Barat",
    "81": "Maluku",
    "82": "Maluku Utara",
    "91": "Papua Barat",
    "94": "Papua"
};

// Load GeoJSON data from file
async function loadGeoJSON(path) {
    try {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Error loading GeoJSON:', path, error);
        return null;
    }
}

// Load all provinces
async function loadProvincesData() {
    const provinces = [];
    
    // Load province files (1-8)
    for (let i = 1; i <= 8; i++) {
        const geojson = await loadGeoJSON(`/indonesian_boundaries/db_geojson/prov/wilayah_boundaries_prov_${i}.geojson`);
        if (geojson && geojson.features) {
            provinces.push(...geojson.features);
        }
    }
    
    map.geojsonData.provinces = {
        type: "FeatureCollection",
        features: provinces
    };
    
    return map.geojsonData.provinces;
}

// Load districts for a specific province
async function loadDistrictsData(provinceCode) {
    if (map.geojsonData.districts[provinceCode]) {
        return map.geojsonData.districts[provinceCode];
    }
    
    const geojson = await loadGeoJSON(`/indonesian_boundaries/db_geojson/kab/wilayah_boundaries_kab_${provinceCode}.geojson`);
    if (geojson) {
        map.geojsonData.districts[provinceCode] = geojson;
    }
    return geojson;
}

// Load subdistricts for a specific district
async function loadSubdistrictsData(districtCode) {
    if (map.geojsonData.subdistricts[districtCode]) {
        return map.geojsonData.subdistricts[districtCode];
    }
    
    const geojson = await loadGeoJSON(`/indonesian_boundaries/db_geojson/kec/wilayah_boundaries_kec_${districtCode}.geojson`);
    if (geojson) {
        map.geojsonData.subdistricts[districtCode] = geojson;
    }
    return geojson;
}

// Initialize map
async function initIndonesiaMap() {
    const mapContainer = document.getElementById('indonesia-map');
    if (!mapContainer) return;

    // Clear existing content
    mapContainer.innerHTML = '';

    // Create SVG container
    map.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    map.svg.setAttribute('width', '100%');
    map.svg.setAttribute('height', '100%');
    map.svg.setAttribute('viewBox', '94 -6 54 22');
    map.svg.setAttribute('id', 'main-svg');
    map.svg.style.background = '#0a0a0a';

    // Add grid pattern
    addGridPattern();

    // Add grid background
    const gridRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    gridRect.setAttribute('width', '100%');
    gridRect.setAttribute('height', '100%');
    gridRect.setAttribute('fill', 'url(#grid)');
    map.svg.appendChild(gridRect);

    mapContainer.appendChild(map.svg);

    // Add basemap layer
    if (map.layers.basemap) {
        addBasemapLayer();
    }

    // Add map styles
    addMapStyles();
    
    // Create zoom controls
    createZoomControls();
    
    // Load and render provinces
    await renderProvincesFromGeoJSON();
    
    // Initialize breadcrumb
    updateBreadcrumb();
}

// Add grid pattern to SVG
function addGridPattern() {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const pattern = document.createElementNS('http://www.w3.org/2000/svg', 'pattern');
    pattern.setAttribute('id', 'grid');
    pattern.setAttribute('width', '1');
    pattern.setAttribute('height', '1');
    pattern.setAttribute('patternUnits', 'userSpaceOnUse');

    const gridPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    gridPath.setAttribute('d', 'M 1 0 L 0 0 0 1');
    gridPath.setAttribute('fill', 'none');
    gridPath.setAttribute('stroke', 'rgba(122, 197, 90, 0.1)');
    gridPath.setAttribute('stroke-width', '0.05');

    pattern.appendChild(gridPath);
    defs.appendChild(pattern);
    map.svg.appendChild(defs);
}

// Add basemap layer (ocean/land background)
function addBasemapLayer() {
    const basemapGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    basemapGroup.setAttribute('id', 'basemap-group');
    
    // Ocean background
    const ocean = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    ocean.setAttribute('x', '94');
    ocean.setAttribute('y', '-6');
    ocean.setAttribute('width', '54');
    ocean.setAttribute('height', '22');
    ocean.setAttribute('fill', '#0a1520');
    ocean.setAttribute('opacity', '0.8');
    
    basemapGroup.appendChild(ocean);
    map.svg.appendChild(basemapGroup);
}

// Zoom controls
function zoomIn() {
    if (map.zoom.level < map.zoom.maxZoom) {
        map.zoom.level += map.zoom.step;
        applyZoom();
    }
}

function zoomOut() {
    if (map.zoom.level > map.zoom.minZoom) {
        map.zoom.level -= map.zoom.step;
        applyZoom();
    }
}

function applyZoom() {
    const vb = map.zoom.currentViewBox;
    const centerX = vb.x + vb.width / 2;
    const centerY = vb.y + vb.height / 2;
    
    const newWidth = vb.width / map.zoom.level;
    const newHeight = vb.height / map.zoom.level;
    
    const newX = centerX - newWidth / 2;
    const newY = centerY - newHeight / 2;
    
    map.svg.setAttribute('viewBox', `${newX} ${newY} ${newWidth} ${newHeight}`);
}

// Create zoom control buttons
function createZoomControls() {
    const mapContainer = document.getElementById('indonesia-map');
    
    const zoomControls = document.createElement('div');
    zoomControls.className = 'zoom-controls';
    zoomControls.innerHTML = `
        <button class="zoom-btn zoom-in" id="zoom-in-btn" title="Zoom In">+</button>
        <button class="zoom-btn zoom-out" id="zoom-out-btn" title="Zoom Out">−</button>
        <button class="zoom-btn zoom-reset" id="zoom-reset-btn" title="Reset View">⌂</button>
    `;
    
    mapContainer.appendChild(zoomControls);
    
    // Add event listeners
    document.getElementById('zoom-in-btn').addEventListener('click', zoomIn);
    document.getElementById('zoom-out-btn').addEventListener('click', zoomOut);
    document.getElementById('zoom-reset-btn').addEventListener('click', resetView);
}

// Render provinces from GeoJSON
async function renderProvincesFromGeoJSON() {
    const provincesData = await loadProvincesData();
    if (!provincesData) {
        console.error('Failed to load provinces data');
        return;
    }

    const provinceGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    provinceGroup.setAttribute('id', 'provinces-group');

    provincesData.features.forEach((feature, index) => {
        const props = feature.properties;
        const geometry = feature.geometry;
        
        // Create path for province boundary
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = geometryToPath(geometry);
        path.setAttribute('d', d);
        path.setAttribute('fill', 'rgba(122, 197, 90, 0.1)');
        path.setAttribute('stroke', '#7AC55A');
        path.setAttribute('stroke-width', '0.05');
        path.setAttribute('class', 'province-polygon');
        path.setAttribute('data-province', props.nama);
        path.setAttribute('data-code', props.kode);

        // Add interactivity
        path.style.cursor = 'pointer';
        path.addEventListener('mouseenter', function(e) {
            this.setAttribute('fill', 'rgba(122, 197, 90, 0.3)');
            this.setAttribute('stroke-width', '0.1');
            showProvinceTooltip(props.nama, props, e);
        });

        path.addEventListener('mouseleave', function() {
            this.setAttribute('fill', 'rgba(122, 197, 90, 0.1)');
            this.setAttribute('stroke-width', '0.05');
            hideTooltip();
        });

        path.addEventListener('click', function(e) {
            e.stopPropagation();
            handleProvinceClick(props.nama, props.kode, feature);
        });

        provinceGroup.appendChild(path);

        // Add label at center point
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', props.lng);
        text.setAttribute('y', -props.lat);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#C3DB65');
        text.setAttribute('font-size', '0.4');
        text.setAttribute('font-family', 'JetBrains Mono, monospace');
        text.setAttribute('class', 'province-label');
        text.setAttribute('pointer-events', 'none');
        text.textContent = props.nama;

        provinceGroup.appendChild(text);
    });

    map.svg.appendChild(provinceGroup);
}

// Convert GeoJSON geometry to SVG path
function geometryToPath(geometry) {
    let pathData = '';
    
    if (geometry.type === 'Polygon') {
        geometry.coordinates.forEach((ring, ringIndex) => {
            ring.forEach((coord, i) => {
                const [lng, lat] = coord;
                pathData += (i === 0 ? 'M' : 'L') + lng + ',' + (-lat) + ' ';
            });
            pathData += 'Z ';
        });
    } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach(polygon => {
            polygon.forEach((ring, ringIndex) => {
                ring.forEach((coord, i) => {
                    const [lng, lat] = coord;
                    pathData += (i === 0 ? 'M' : 'L') + lng + ',' + (-lat) + ' ';
                });
                pathData += 'Z ';
            });
        });
    }
    
    return pathData.trim();
}

// Calculate bounds from geometry
function calculateBounds(geometry) {
    let coords = [];
    
    if (geometry.type === 'Polygon') {
        coords = geometry.coordinates[0];
    } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach(polygon => {
            coords = coords.concat(polygon[0]);
        });
    }
    
    const lngs = coords.map(c => c[0]);
    const lats = coords.map(c => c[1]);
    
    return {
        minLng: Math.min(...lngs),
        maxLng: Math.max(...lngs),
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats)
    };
}

// Handle province click - drilldown to districts
async function handleProvinceClick(provinceName, provinceCode, feature) {
    if (!map.layers.districts) {
        alert('Aktifkan layer Kabupaten/Kota terlebih dahulu');
        return;
    }

    map.selectedProvince = provinceName;
    map.breadcrumb = [{ type: 'province', name: provinceName, code: provinceCode }];
    updateBreadcrumb();

    // Zoom to province
    zoomToFeature(feature);

    // Load and render districts
    await renderDistricts(provinceCode);
}

// Render districts for selected province
async function renderDistricts(provinceCode) {
    // Remove existing district group
    const existingGroup = document.getElementById('districts-group');
    if (existingGroup) existingGroup.remove();

    const districtsData = await loadDistrictsData(provinceCode);
    if (!districtsData || !districtsData.features) {
        console.log('No district data available for province', provinceCode);
        return;
    }

    const districtGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    districtGroup.setAttribute('id', 'districts-group');

    districtsData.features.forEach((feature, index) => {
        const props = feature.properties;
        const geometry = feature.geometry;
        
        // Create path for district boundary
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = geometryToPath(geometry);
        path.setAttribute('d', d);
        path.setAttribute('fill', 'rgba(195, 219, 101, 0.1)');
        path.setAttribute('stroke', '#C3DB65');
        path.setAttribute('stroke-width', '0.03');
        path.setAttribute('class', 'district-polygon');
        path.setAttribute('data-district', props.nama);
        path.setAttribute('data-code', props.kode);

        path.style.cursor = 'pointer';
        path.addEventListener('mouseenter', function(e) {
            this.setAttribute('fill', 'rgba(195, 219, 101, 0.3)');
            this.setAttribute('stroke-width', '0.06');
            showDistrictTooltip(props.nama, e);
        });

        path.addEventListener('mouseleave', function() {
            this.setAttribute('fill', 'rgba(195, 219, 101, 0.1)');
            this.setAttribute('stroke-width', '0.03');
            hideTooltip();
        });

        path.addEventListener('click', function(e) {
            e.stopPropagation();
            handleDistrictClick(props.nama, props.kode, feature);
        });

        districtGroup.appendChild(path);

        // Add label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', props.lng);
        text.setAttribute('y', props.lat);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#C3DB65');
        text.setAttribute('font-size', '0.25');
        text.setAttribute('font-family', 'JetBrains Mono, monospace');
        text.setAttribute('class', 'district-label');
        text.setAttribute('pointer-events', 'none');
        text.textContent = props.nama.replace('Kabupaten ', '').replace('Kota ', '');

        districtGroup.appendChild(text);
    });

    map.svg.appendChild(districtGroup);
}

// Handle district click
async function handleDistrictClick(districtName, districtCode, feature) {
    if (!map.layers.subdistricts) {
        alert('Aktifkan layer Kecamatan terlebih dahulu');
        return;
    }

    map.selectedDistrict = districtName;
    map.breadcrumb.push({ type: 'district', name: districtName, code: districtCode });
    updateBreadcrumb();

    // Zoom to district
    zoomToFeature(feature);

    // Load and render subdistricts
    await renderSubdistricts(districtCode);
}

// Render subdistricts for selected district
async function renderSubdistricts(districtCode) {
    // Remove existing subdistrict group
    const existingGroup = document.getElementById('subdistricts-group');
    if (existingGroup) existingGroup.remove();

    const subdistrictsData = await loadSubdistrictsData(Math.floor(districtCode));
    if (!subdistrictsData || !subdistrictsData.features) {
        console.log('No subdistrict data available for district', districtCode);
        return;
    }

    const subdistrictGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    subdistrictGroup.setAttribute('id', 'subdistricts-group');

    subdistrictsData.features.forEach((feature, index) => {
        const props = feature.properties;
        const geometry = feature.geometry;
        
        // Create path for subdistrict boundary
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const d = geometryToPath(geometry);
        path.setAttribute('d', d);
        path.setAttribute('fill', 'rgba(255, 215, 0, 0.1)');
        path.setAttribute('stroke', '#FFD700');
        path.setAttribute('stroke-width', '0.02');
        path.setAttribute('class', 'subdistrict-polygon');
        path.setAttribute('data-subdistrict', props.nama);

        path.style.cursor = 'pointer';
        path.addEventListener('mouseenter', function(e) {
            this.setAttribute('fill', 'rgba(255, 215, 0, 0.3)');
            this.setAttribute('stroke-width', '0.04');
            showSubdistrictTooltip(props.nama, e);
        });

        path.addEventListener('mouseleave', function() {
            this.setAttribute('fill', 'rgba(255, 215, 0, 0.1)');
            this.setAttribute('stroke-width', '0.02');
            hideTooltip();
        });

        subdistrictGroup.appendChild(path);
    });

    map.svg.appendChild(subdistrictGroup);
}

// Zoom to feature
function zoomToFeature(feature) {
    const bounds = calculateBounds(feature.geometry);
    const width = bounds.maxLng - bounds.minLng;
    const height = bounds.maxLat - bounds.minLat;
    const padding = Math.max(width, height) * 0.2;

    // Negate latitudes for correct orientation
    const viewBox = `${bounds.minLng - padding} ${-bounds.maxLat - padding} ${width + 2 * padding} ${height + 2 * padding}`;
    map.svg.setAttribute('viewBox', viewBox);
    
    // Update zoom state
    map.zoom.currentViewBox = {
        x: bounds.minLng - padding,
        y: -bounds.maxLat - padding,
        width: width + 2 * padding,
        height: height + 2 * padding
    };
}

// Reset to full Indonesia view
function resetView() {
    map.svg.setAttribute('viewBox', '94 -6 54 22');
    map.selectedProvince = null;
    map.selectedDistrict = null;
    map.selectedSubdistrict = null;
    map.breadcrumb = [];
    map.zoom.level = 1;
    map.zoom.currentViewBox = { ...map.zoom.defaultViewBox };
    updateBreadcrumb();

    // Remove district/subdistrict groups
    const districtGroup = document.getElementById('districts-group');
    if (districtGroup) districtGroup.remove();
    
    const subdistrictGroup = document.getElementById('subdistricts-group');
    if (subdistrictGroup) subdistrictGroup.remove();
}

// Update breadcrumb trail
function updateBreadcrumb() {
    const breadcrumbPanel = document.getElementById('breadcrumb-panel');
    const breadcrumbTrail = document.getElementById('breadcrumb-trail');

    if (map.breadcrumb.length === 0) {
        breadcrumbPanel.style.display = 'none';
        return;
    }

    breadcrumbPanel.style.display = 'block';
    breadcrumbTrail.innerHTML = '';

    // Add home button
    const homeBtn = document.createElement('span');
    homeBtn.className = 'breadcrumb-item';
    homeBtn.textContent = '🏠 Indonesia';
    homeBtn.addEventListener('click', resetView);
    breadcrumbTrail.appendChild(homeBtn);

    // Add breadcrumb items
    map.breadcrumb.forEach((item, index) => {
        const separator = document.createElement('span');
        separator.className = 'breadcrumb-separator';
        separator.textContent = '›';
        breadcrumbTrail.appendChild(separator);

        const crumb = document.createElement('span');
        crumb.className = 'breadcrumb-item';
        crumb.textContent = item.name;
        
        if (index < map.breadcrumb.length - 1) {
            crumb.addEventListener('click', () => {
                // Navigate back to this level
                map.breadcrumb = map.breadcrumb.slice(0, index + 1);
                updateBreadcrumb();
                // Reload appropriate level
            });
        }

        breadcrumbTrail.appendChild(crumb);
    });
}

// Show tooltips
function showProvinceTooltip(name, props, event) {
    let tooltip = document.querySelector('.province-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'province-tooltip';
        document.body.appendChild(tooltip);
    }

    tooltip.innerHTML = `
        <h4>${name}</h4>
        <div class="info">
            <strong>Kode:</strong> ${props.kode}
        </div>
    `;

    tooltip.style.display = 'block';
    tooltip.style.left = (event.clientX + 20) + 'px';
    tooltip.style.top = (event.clientY + 20) + 'px';
}

function showDistrictTooltip(name, event) {
    let tooltip = document.querySelector('.province-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'province-tooltip';
        document.body.appendChild(tooltip);
    }

    tooltip.innerHTML = `<h4>${name}</h4>`;
    tooltip.style.display = 'block';
    tooltip.style.left = (event.clientX + 20) + 'px';
    tooltip.style.top = (event.clientY + 20) + 'px';
}

function showSubdistrictTooltip(name, event) {
    let tooltip = document.querySelector('.province-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'province-tooltip';
        document.body.appendChild(tooltip);
    }

    tooltip.innerHTML = `<h4>${name}</h4>`;
    tooltip.style.display = 'block';
    tooltip.style.left = (event.clientX + 20) + 'px';
    tooltip.style.top = (event.clientY + 20) + 'px';
}

function hideTooltip() {
    const tooltip = document.querySelector('.province-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// Add map styles
function addMapStyles() {
    if (document.getElementById('map-styles')) return;

    const style = document.createElement('style');
    style.id = 'map-styles';
    style.textContent = `
        @keyframes pulse {
            0%, 100% {
                opacity: 0.6;
                transform: scale(1);
            }
            50% {
                opacity: 1;
                transform: scale(1.3);
            }
        }

        .province-polygon:hover,
        .district-polygon:hover,
        .subdistrict-polygon:hover {
            filter: drop-shadow(0 0 5px #7AC55A);
        }

        .province-tooltip {
            position: fixed;
            background: rgba(18, 18, 18, 0.95);
            border: 1px solid #7AC55A;
            border-radius: 8px;
            padding: 1rem;
            font-family: 'JetBrains Mono', monospace;
            font-size: 0.85rem;
            color: #ffffff;
            pointer-events: none;
            z-index: 10000;
            box-shadow: 0 0 20px rgba(122, 197, 90, 0.3);
            backdrop-filter: blur(10px);
        }

        .province-tooltip h4 {
            color: #7AC55A;
            margin: 0 0 0.5rem 0;
            font-size: 1rem;
        }

        .province-tooltip .info {
            color: #C3DB65;
        }

        .zoom-controls {
            position: absolute;
            top: 20px;
            left: 20px;
            display: flex;
            flex-direction: column;
            gap: 8px;
            z-index: 1000;
        }

        .zoom-btn {
            width: 40px;
            height: 40px;
            background: rgba(18, 18, 18, 0.95);
            border: 1px solid #7AC55A;
            border-radius: 4px;
            color: #7AC55A;
            font-size: 20px;
            font-weight: bold;
            cursor: pointer;
            transition: all 0.3s ease;
            box-shadow: 0 0 10px rgba(122, 197, 90, 0.2);
            font-family: 'JetBrains Mono', monospace;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .zoom-btn:hover {
            background: rgba(122, 197, 90, 0.2);
            box-shadow: 0 0 20px rgba(122, 197, 90, 0.4);
            transform: scale(1.05);
        }

        .zoom-btn:active {
            transform: scale(0.95);
        }

        .zoom-reset {
            font-size: 18px;
        }

        @media (max-width: 768px) {
            .zoom-controls {
                top: 10px;
                left: 10px;
            }
            
            .zoom-btn {
                width: 35px;
                height: 35px;
                font-size: 18px;
            }
        }
    `;
    document.head.appendChild(style);
}

// Fetch live weather data from open API
async function fetchWeatherData(lat, lon) {
    try {
        const response = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`
        );
        const data = await response.json();
        return data.current_weather;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
}

// Display weather overlay
async function toggleWeatherLayer(enabled) {
    if (!enabled) {
        const weatherGroup = document.getElementById('weather-group');
        if (weatherGroup) weatherGroup.remove();
        return;
    }

    if (!map.geojsonData.provinces) return;

    const weatherGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    weatherGroup.setAttribute('id', 'weather-group');

    for (const feature of map.geojsonData.provinces.features) {
        const props = feature.properties;
        const weather = await fetchWeatherData(props.lat, props.lng);
        if (weather) {
            const weatherIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            weatherIcon.setAttribute('x', props.lng + 0.5);
            weatherIcon.setAttribute('y', props.lat);
            weatherIcon.setAttribute('font-size', '0.5');
            weatherIcon.setAttribute('fill', '#FFD700');
            weatherIcon.textContent = `${Math.round(weather.temperature)}°C`;
            weatherGroup.appendChild(weatherIcon);
        }
    }

    map.svg.appendChild(weatherGroup);
}

// Modal controls
const mapModal = document.getElementById('indonesia-map-modal');
const mapCloseBtn = document.querySelector('.map-close-btn');

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
    // Add click handler for +62 menu item
    document.querySelectorAll('.nav-links a').forEach(link => {
        if (link.getAttribute('href') === '#indonesia-map') {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                openMapModal();
            });
        }
    });

    // Close button handler
    if (mapCloseBtn) {
        mapCloseBtn.addEventListener('click', closeMapModal);
    }

    // Close on outside click
    if (mapModal) {
        mapModal.addEventListener('click', function(e) {
            if (e.target === mapModal) {
                closeMapModal();
            }
        });
    }

    // Layer controls
    const layerControls = {
        provinces: document.getElementById('provinces-layer'),
        districts: document.getElementById('districts-layer'),
        subdistricts: document.getElementById('subdistricts-layer'),
        villages: document.getElementById('villages-layer'),
        basemap: document.getElementById('basemap-layer'),
        streets: document.getElementById('streets-layer'),
        weather: document.getElementById('weather-layer'),
        traffic: document.getElementById('traffic-layer')
    };

    Object.entries(layerControls).forEach(([layer, checkbox]) => {
        if (checkbox) {
            checkbox.addEventListener('change', function() {
                map.layers[layer] = this.checked;
                handleLayerToggle(layer, this.checked);
            });
        }
    });
});

// Handle layer toggle
function handleLayerToggle(layer, enabled) {
    switch(layer) {
        case 'provinces':
            const provincesGroup = document.getElementById('provinces-group');
            if (provincesGroup) {
                provincesGroup.style.display = enabled ? 'block' : 'none';
            }
            break;
        case 'basemap':
            const basemapGroup = document.getElementById('basemap-group');
            if (basemapGroup) {
                basemapGroup.style.display = enabled ? 'block' : 'none';
            }
            break;
        case 'streets':
            toggleStreetsLayer(enabled);
            break;
        case 'weather':
            toggleWeatherLayer(enabled);
            break;
        case 'traffic':
            toggleTrafficLayer(enabled);
            break;
        default:
            console.log(`Layer ${layer} toggled:`, enabled);
    }
}

// Toggle streets layer (OpenStreetMap overlay for traffic context)
function toggleStreetsLayer(enabled) {
    if (!enabled) {
        const streetsGroup = document.getElementById('streets-group');
        if (streetsGroup) streetsGroup.remove();
        return;
    }

    if (!map.geojsonData.provinces) return;

    const streetsGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    streetsGroup.setAttribute('id', 'streets-group');
    streetsGroup.setAttribute('opacity', '0.3');

    // Add sample street lines for visualization
    map.geojsonData.provinces.features.forEach((feature) => {
        const props = feature.properties;
        const center = [props.lng, -props.lat];
        
        // Draw simple road network visualization
        const roadLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        roadLine.setAttribute('x1', center[0] - 0.3);
        roadLine.setAttribute('y1', center[1]);
        roadLine.setAttribute('x2', center[0] + 0.3);
        roadLine.setAttribute('y2', center[1]);
        roadLine.setAttribute('stroke', '#666');
        roadLine.setAttribute('stroke-width', '0.05');
        
        streetsGroup.appendChild(roadLine);
    });

    map.svg.appendChild(streetsGroup);
}

// Toggle traffic layer with real-time data simulation
function toggleTrafficLayer(enabled) {
    if (!enabled) {
        const trafficGroup = document.getElementById('traffic-group');
        if (trafficGroup) trafficGroup.remove();
        return;
    }

    if (!map.geojsonData.provinces) return;

    const trafficGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    trafficGroup.setAttribute('id', 'traffic-group');

    // Simulate traffic data for major cities
    const trafficLevels = ['low', 'medium', 'high'];
    map.geojsonData.provinces.features.forEach((feature) => {
        const props = feature.properties;
        const level = trafficLevels[Math.floor(Math.random() * trafficLevels.length)];
        const colors = { low: '#00ff00', medium: '#ffaa00', high: '#ff0000' };
        
        const trafficIndicator = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        trafficIndicator.setAttribute('cx', props.lng + 0.5);
        trafficIndicator.setAttribute('cy', -props.lat - 0.3);
        trafficIndicator.setAttribute('r', '0.2');
        trafficIndicator.setAttribute('fill', colors[level]);
        trafficIndicator.setAttribute('opacity', '0.7');
        
        // Add traffic label
        const trafficLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        trafficLabel.setAttribute('x', props.lng + 0.8);
        trafficLabel.setAttribute('y', -props.lat - 0.25);
        trafficLabel.setAttribute('font-size', '0.25');
        trafficLabel.setAttribute('fill', colors[level]);
        trafficLabel.textContent = level.toUpperCase();
        
        trafficGroup.appendChild(trafficIndicator);
        trafficGroup.appendChild(trafficLabel);
    });

    map.svg.appendChild(trafficGroup);
}

// Open/close modal functions
function openMapModal() {
    mapModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    if (!map.svg) {
        setTimeout(() => {
            initIndonesiaMap();
        }, 100);
    }
}

function closeMapModal() {
    mapModal.classList.remove('active');
    document.body.style.overflow = '';
    hideTooltip();
}

// Escape key to close modal
document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && mapModal.classList.contains('active')) {
        closeMapModal();
    }
});
