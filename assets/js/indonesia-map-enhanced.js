// Indonesia Interactive Map with Cyberpunk Theme - Enhanced Version
// Features: Polygon boundaries, drilldown navigation, live API integration

// State management
let map = {
    svg: null,
    currentLevel: 'provinces', // provinces, districts, subdistricts, villages
    selectedProvince: null,
    selectedDistrict: null,
    selectedSubdistrict: null,
    breadcrumb: [],
    layers: {
        provinces: true,
        districts: false,
        subdistricts: false,
        villages: false,
        weather: false,
        traffic: false
    }
};

// Simplified polygon data for Indonesia provinces (sample GeoJSON-like structure)
// In production, this would load from external GeoJSON files
const provincePolygons = {
    "Aceh": {
        id: "11",
        coordinates: [[95.0, 6.0], [96.5, 6.0], [96.5, 4.5], [95.0, 4.5], [95.0, 6.0]],
        center: [95.3238, 5.5483],
        population: "5.3M",
        capital: "Banda Aceh"
    },
    "Sumatera Utara": {
        id: "12",
        coordinates: [[98.0, 3.5], [100.0, 3.5], [100.0, 1.0], [98.0, 1.0], [98.0, 3.5]],
        center: [98.6722, 2.1154],
        population: "14.8M",
        capital: "Medan"
    },
    "Sumatera Barat": {
        id: "13",
        coordinates: [[99.5, 0.5], [101.5, 0.5], [101.5, -2.0], [99.5, -2.0], [99.5, 0.5]],
        center: [100.3543, -0.9471],
        population: "5.5M",
        capital: "Padang"
    },
    "Riau": {
        id: "14",
        coordinates: [[100.5, 1.5], [102.5, 1.5], [102.5, -0.5], [100.5, -0.5], [100.5, 1.5]],
        center: [101.4478, 0.5071],
        population: "6.9M",
        capital: "Pekanbaru"
    },
    "Jambi": {
        id: "15",
        coordinates: [[102.0, -0.5], [104.5, -0.5], [104.5, -2.5], [102.0, -2.5], [102.0, -0.5]],
        center: [103.6131, -1.6101],
        population: "3.5M",
        capital: "Jambi"
    },
    "Sumatera Selatan": {
        id: "16",
        coordinates: [[103.0, -1.5], [105.5, -1.5], [105.5, -4.0], [103.0, -4.0], [103.0, -1.5]],
        center: [104.7754, -2.9761],
        population: "8.5M",
        capital: "Palembang"
    },
    "Bengkulu": {
        id: "17",
        coordinates: [[101.5, -2.5], [103.0, -2.5], [103.0, -5.0], [101.5, -5.0], [101.5, -2.5]],
        center: [102.2656, -3.7928],
        population: "2.0M",
        capital: "Bengkulu"
    },
    "Lampung": {
        id: "18",
        coordinates: [[104.0, -4.0], [105.8, -4.0], [105.8, -6.0], [104.0, -6.0], [104.0, -4.0]],
        center: [105.2667, -5.45],
        population: "9.0M",
        capital: "Bandar Lampung"
    },
    "Kepulauan Bangka Belitung": {
        id: "19",
        coordinates: [[105.5, -1.5], [107.0, -1.5], [107.0, -3.0], [105.5, -3.0], [105.5, -1.5]],
        center: [106.1139, -2.1184],
        population: "1.5M",
        capital: "Pangkal Pinang"
    },
    "Kepulauan Riau": {
        id: "21",
        coordinates: [[103.5, 1.5], [105.5, 1.5], [105.5, 0.0], [103.5, 0.0], [103.5, 1.5]],
        center: [104.5361, 0.9186],
        population: "2.1M",
        capital: "Tanjung Pinang"
    },
    "DKI Jakarta": {
        id: "31",
        coordinates: [[106.6, -6.0], [107.0, -6.0], [107.0, -6.4], [106.6, -6.4], [106.6, -6.0]],
        center: [106.8272, -6.2088],
        population: "10.6M",
        capital: "Jakarta"
    },
    "Jawa Barat": {
        id: "32",
        coordinates: [[106.5, -6.0], [108.5, -6.0], [108.5, -7.8], [106.5, -7.8], [106.5, -6.0]],
        center: [107.6191, -6.9175],
        population: "49.3M",
        capital: "Bandung"
    },
    "Jawa Tengah": {
        id: "33",
        coordinates: [[108.5, -6.0], [111.5, -6.0], [111.5, -8.0], [108.5, -8.0], [108.5, -6.0]],
        center: [110.4203, -6.9667],
        population: "36.5M",
        capital: "Semarang"
    },
    "DI Yogyakarta": {
        id: "34",
        coordinates: [[110.0, -7.5], [110.8, -7.5], [110.8, -8.2], [110.0, -8.2], [110.0, -7.5]],
        center: [110.3644, -7.7972],
        population: "3.8M",
        capital: "Yogyakarta"
    },
    "Jawa Timur": {
        id: "35",
        coordinates: [[111.0, -6.5], [114.5, -6.5], [114.5, -8.5], [111.0, -8.5], [111.0, -6.5]],
        center: [112.7521, -7.2575],
        population: "40.7M",
        capital: "Surabaya"
    },
    "Banten": {
        id: "36",
        coordinates: [[105.5, -5.5], [106.5, -5.5], [106.5, -7.0], [105.5, -7.0], [105.5, -5.5]],
        center: [106.1503, -6.1204],
        population: "13.0M",
        capital: "Serang"
    },
    "Bali": {
        id: "51",
        coordinates: [[114.5, -8.0], [115.8, -8.0], [115.8, -9.0], [114.5, -9.0], [114.5, -8.0]],
        center: [115.2126, -8.6705],
        population: "4.3M",
        capital: "Denpasar"
    },
    "Nusa Tenggara Barat": {
        id: "52",
        coordinates: [[115.5, -8.0], [117.0, -8.0], [117.0, -9.5], [115.5, -9.5], [115.5, -8.0]],
        center: [116.1167, -8.5833],
        population: "5.3M",
        capital: "Mataram"
    },
    "Nusa Tenggara Timur": {
        id: "53",
        coordinates: [[118.0, -8.5], [125.0, -8.5], [125.0, -10.5], [118.0, -10.5], [118.0, -8.5]],
        center: [123.6074, -10.1772],
        population: "5.5M",
        capital: "Kupang"
    },
    "Kalimantan Barat": {
        id: "61",
        coordinates: [[108.5, 2.0], [111.0, 2.0], [111.0, -3.0], [108.5, -3.0], [108.5, 2.0]],
        center: [109.3333, -0.0263],
        population: "5.4M",
        capital: "Pontianak"
    },
    "Kalimantan Tengah": {
        id: "62",
        coordinates: [[111.0, 0.5], [115.5, 0.5], [115.5, -4.0], [111.0, -4.0], [111.0, 0.5]],
        center: [113.9213, -2.2135],
        population: "2.7M",
        capital: "Palangka Raya"
    },
    "Kalimantan Selatan": {
        id: "63",
        coordinates: [[114.0, -1.5], [116.5, -1.5], [116.5, -4.5], [114.0, -4.5], [114.0, -1.5]],
        center: [114.5908, -3.3194],
        population: "4.1M",
        capital: "Banjarmasin"
    },
    "Kalimantan Timur": {
        id: "64",
        coordinates: [[115.5, 3.5], [119.0, 3.5], [119.0, -2.5], [115.5, -2.5], [115.5, 3.5]],
        center: [117.1382, -0.5022],
        population: "3.7M",
        capital: "Samarinda"
    },
    "Kalimantan Utara": {
        id: "65",
        coordinates: [[116.0, 4.5], [118.5, 4.5], [118.5, 1.5], [116.0, 1.5], [116.0, 4.5]],
        center: [117.3622, 2.8441],
        population: "0.7M",
        capital: "Tanjung Selor"
    },
    "Sulawesi Utara": {
        id: "71",
        coordinates: [[123.5, 2.0], [125.5, 2.0], [125.5, 0.5], [123.5, 0.5], [123.5, 2.0]],
        center: [124.8421, 1.4748],
        population: "2.6M",
        capital: "Manado"
    },
    "Sulawesi Tengah": {
        id: "72",
        coordinates: [[119.0, 1.0], [123.5, 1.0], [123.5, -3.5], [119.0, -3.5], [119.0, 1.0]],
        center: [119.8707, -0.8999],
        population: "3.0M",
        capital: "Palu"
    },
    "Sulawesi Selatan": {
        id: "73",
        coordinates: [[118.5, -3.0], [121.5, -3.0], [121.5, -6.5], [118.5, -6.5], [118.5, -3.0]],
        center: [119.4327, -5.1477],
        population: "9.0M",
        capital: "Makassar"
    },
    "Sulawesi Tenggara": {
        id: "74",
        coordinates: [[121.0, -2.5], [124.0, -2.5], [124.0, -5.5], [121.0, -5.5], [121.0, -2.5]],
        center: [122.5989, -3.9689],
        population: "2.6M",
        capital: "Kendari"
    },
    "Gorontalo": {
        id: "75",
        coordinates: [[122.0, 1.0], [123.5, 1.0], [123.5, 0.0], [122.0, 0.0], [122.0, 1.0]],
        center: [123.0595, 0.5412],
        population: "1.2M",
        capital: "Gorontalo"
    },
    "Sulawesi Barat": {
        id: "76",
        coordinates: [[118.5, -1.5], [119.5, -1.5], [119.5, -3.5], [118.5, -3.5], [118.5, -1.5]],
        center: [119.3254, -2.6768],
        population: "1.4M",
        capital: "Mamuju"
    },
    "Maluku": {
        id: "81",
        coordinates: [[127.0, -2.0], [130.0, -2.0], [130.0, -5.5], [127.0, -5.5], [127.0, -2.0]],
        center: [128.1819, -3.6954],
        population: "1.8M",
        capital: "Ambon"
    },
    "Maluku Utara": {
        id: "82",
        coordinates: [[126.5, 2.0], [129.0, 2.0], [129.0, -1.0], [126.5, -1.0], [126.5, 2.0]],
        center: [127.5669, 0.7186],
        population: "1.3M",
        capital: "Sofifi"
    },
    "Papua": {
        id: "94",
        coordinates: [[135.0, -1.0], [141.0, -1.0], [141.0, -9.0], [135.0, -9.0], [135.0, -1.0]],
        center: [140.7183, -2.5333],
        population: "4.3M",
        capital: "Jayapura"
    },
    "Papua Barat": {
        id: "91",
        coordinates: [[ 130.0, 1.0], [135.0, 1.0], [135.0, -3.0], [130.0, -3.0], [130.0, 1.0]],
        center: [134.0840, -0.8618],
        population: "1.1M",
        capital: "Manokwari"
    }
};

// Sample districts data (would be loaded dynamically based on selected province)
const districtData = {
    "11": [ // Aceh
        { name: "Aceh Besar", center: [95.5, 5.5] },
        { name: "Aceh Timur", center: [96.0, 5.0] },
        { name: "Pidie", center: [95.8, 5.2] }
    ],
    "31": [ // DKI Jakarta
        { name: "Jakarta Pusat", center: [106.83, -6.18] },
        { name: "Jakarta Utara", center: [106.88, -6.14] },
        { name: "Jakarta Barat", center: [106.77, -6.17] },
        { name: "Jakarta Selatan", center: [106.82, -6.26] },
        { name: "Jakarta Timur", center: [106.90, -6.22] }
    ]
};

// Initialize map
function initIndonesiaMap() {
    const mapContainer = document.getElementById('indonesia-map');
    if (!mapContainer) return;

    // Clear existing content
    mapContainer.innerHTML = '';

    // Create SVG container
    map.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    map.svg.setAttribute('width', '100%');
    map.svg.setAttribute('height', '100%');
    map.svg.setAttribute('viewBox', '90 -15 60 25');
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

    // Render provinces
    renderProvinces();

    mapContainer.appendChild(map.svg);

    // Add map styles
    addMapStyles();
    
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

// Render provinces as polygons
function renderProvinces() {
    const provinceGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    provinceGroup.setAttribute('id', 'provinces-group');

    Object.entries(provincePolygons).forEach(([name, data]) => {
        // Create polygon for province boundary
        const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
        const points = data.coordinates.map(coord => coord.join(',')).join(' ');
        polygon.setAttribute('points', points);
        polygon.setAttribute('fill', 'rgba(122, 197, 90, 0.1)');
        polygon.setAttribute('stroke', '#7AC55A');
        polygon.setAttribute('stroke-width', '0.05');
        polygon.setAttribute('class', 'province-polygon');
        polygon.setAttribute('data-province', name);
        polygon.setAttribute('data-id', data.id);

        // Add interactivity
        polygon.style.cursor = 'pointer';
        polygon.addEventListener('mouseenter', function() {
            this.setAttribute('fill', 'rgba(122, 197, 90, 0.3)');
            this.setAttribute('stroke-width', '0.1');
            showProvinceTooltip(name, data, event);
        });

        polygon.addEventListener('mouseleave', function() {
            this.setAttribute('fill', 'rgba(122, 197, 90, 0.1)');
            this.setAttribute('stroke-width', '0.05');
            hideTooltip();
        });

        polygon.addEventListener('click', function(e) {
            e.stopPropagation();
            handleProvinceClick(name, data);
        });

        provinceGroup.appendChild(polygon);

        // Add label
        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', data.center[0]);
        text.setAttribute('y', data.center[1]);
        text.setAttribute('text-anchor', 'middle');
        text.setAttribute('fill', '#C3DB65');
        text.setAttribute('font-size', '0.4');
        text.setAttribute('font-family', 'JetBrains Mono, monospace');
        text.setAttribute('class', 'province-label');
        text.setAttribute('pointer-events', 'none');
        text.textContent = name;

        provinceGroup.appendChild(text);
    });

    map.svg.appendChild(provinceGroup);
}

// Handle province click - drilldown to districts
function handleProvinceClick(provinceName, provinceData) {
    if (!map.layers.districts) {
        alert('Aktifkan layer Kabupaten/Kota terlebih dahulu');
        return;
    }

    map.selectedProvince = provinceName;
    map.breadcrumb = [{ type: 'province', name: provinceName }];
    updateBreadcrumb();

    // Zoom to province
    zoomToProvince(provinceData);

    // Load and render districts
    renderDistricts(provinceData.id, provinceData);
}

// Render districts for selected province
function renderDistricts(provinceId, provinceData) {
    // Remove existing district group
    const existingGroup = document.getElementById('districts-group');
    if (existingGroup) existingGroup.remove();

    const districts = districtData[provinceId] || [];
    if (districts.length === 0) {
        console.log('No district data available for', provinceId);
        return;
    }

    const districtGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    districtGroup.setAttribute('id', 'districts-group');

    districts.forEach((district, index) => {
        // Create marker for district
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', district.center[0]);
        circle.setAttribute('cy', district.center[1]);
        circle.setAttribute('r', '0.2');
        circle.setAttribute('fill', '#C3DB65');
        circle.setAttribute('stroke', '#7AC55A');
        circle.setAttribute('stroke-width', '0.05');
        circle.setAttribute('class', 'district-marker');
        circle.setAttribute('data-district', district.name);

        circle.style.cursor = 'pointer';
        circle.addEventListener('mouseenter', function() {
            this.setAttribute('r', '0.3');
            showDistrictTooltip(district.name, event);
        });

        circle.addEventListener('mouseleave', function() {
            this.setAttribute('r', '0.2');
            hideTooltip();
        });

        circle.addEventListener('click', function(e) {
            e.stopPropagation();
            handleDistrictClick(district.name);
        });

        districtGroup.appendChild(circle);

        // Add pulsing animation
        setTimeout(() => {
            circle.style.animation = `pulse 2s ease-in-out infinite`;
        }, index * 50);
    });

    map.svg.appendChild(districtGroup);
}

// Handle district click
function handleDistrictClick(districtName) {
    if (!map.layers.subdistricts) {
        alert('Aktifkan layer Kecamatan terlebih dahulu');
        return;
    }

    map.selectedDistrict = districtName;
    map.breadcrumb.push({ type: 'district', name: districtName });
    updateBreadcrumb();

    console.log('Clicked district:', districtName);
    // Would load sub-districts here
}

// Zoom to province
function zoomToProvince(provinceData) {
    const coords = provinceData.coordinates;
    const minX = Math.min(...coords.map(c => c[0]));
    const maxX = Math.max(...coords.map(c => c[0]));
    const minY = Math.min(...coords.map(c => c[1]));
    const maxY = Math.max(...coords.map(c => c[1]));

    const width = maxX - minX;
    const height = maxY - minY;
    const padding = Math.max(width, height) * 0.2;

    const viewBox = `${minX - padding} ${minY - padding} ${width + 2 * padding} ${height + 2 * padding}`;
    map.svg.setAttribute('viewBox', viewBox);
}

// Reset to full Indonesia view
function resetView() {
    map.svg.setAttribute('viewBox', '90 -15 60 25');
    map.selectedProvince = null;
    map.selectedDistrict = null;
    map.selectedSubdistrict = null;
    map.breadcrumb = [];
    updateBreadcrumb();

    // Remove district/subdistrict groups
    const districtGroup = document.getElementById('districts-group');
    if (districtGroup) districtGroup.remove();
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
function showProvinceTooltip(name, data, event) {
    let tooltip = document.querySelector('.province-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'province-tooltip';
        document.body.appendChild(tooltip);
    }

    tooltip.innerHTML = `
        <h4>${name}</h4>
        <div class="info">
            <strong>Ibu Kota:</strong> ${data.capital}<br>
            <strong>Populasi:</strong> ${data.population}
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

        .province-polygon:hover {
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
    `;
    document.head.appendChild(style);
}

// Fetch live weather data from open API
async function fetchWeatherData(lat, lon) {
    try {
        // Using Open-Meteo API (free, no API key required)
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

    // Create weather overlay for visible provinces
    const weatherGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    weatherGroup.setAttribute('id', 'weather-group');

    for (const [name, data] of Object.entries(provincePolygons)) {
        const weather = await fetchWeatherData(data.center[1], data.center[0]);
        if (weather) {
            const weatherIcon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            weatherIcon.setAttribute('x', data.center[0] + 0.5);
            weatherIcon.setAttribute('y', data.center[1]);
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
        case 'weather':
            toggleWeatherLayer(enabled);
            break;
        case 'traffic':
            console.log('Traffic layer coming soon');
            break;
        default:
            console.log(`Layer ${layer} toggled:`, enabled);
    }
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
