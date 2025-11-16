// Indonesia Interactive Map with Cyberpunk Theme
// Simplified version without external dependencies

let map;
let provincesLayer;
let districtsLayer;

// Indonesia provinces data with coordinates
const indonesiaProvinces = [
    { name: "Aceh", lat: 5.5483, lng: 95.3238, population: "5.3M", capital: "Banda Aceh" },
    { name: "Sumatera Utara", lat: 2.1154, lng: 98.6722, population: "14.8M", capital: "Medan" },
    { name: "Sumatera Barat", lat: -0.9471, lng: 100.3543, population: "5.5M", capital: "Padang" },
    { name: "Riau", lat: 0.5071, lng: 101.4478, population: "6.9M", capital: "Pekanbaru" },
    { name: "Jambi", lat: -1.6101, lng: 103.6131, population: "3.5M", capital: "Jambi" },
    { name: "Sumatera Selatan", lat: -2.9761, lng: 104.7754, population: "8.5M", capital: "Palembang" },
    { name: "Bengkulu", lat: -3.7928, lng: 102.2656, population: "2.0M", capital: "Bengkulu" },
    { name: "Lampung", lat: -5.45, lng: 105.2667, population: "9.0M", capital: "Bandar Lampung" },
    { name: "Kepulauan Bangka Belitung", lat: -2.1184, lng: 106.1139, population: "1.5M", capital: "Pangkal Pinang" },
    { name: "Kepulauan Riau", lat: 0.9186, lng: 104.5361, population: "2.1M", capital: "Tanjung Pinang" },
    { name: "DKI Jakarta", lat: -6.2088, lng: 106.8272, population: "10.6M", capital: "Jakarta" },
    { name: "Jawa Barat", lat: -6.9175, lng: 107.6191, population: "49.3M", capital: "Bandung" },
    { name: "Jawa Tengah", lat: -6.9667, lng: 110.4203, population: "36.5M", capital: "Semarang" },
    { name: "DI Yogyakarta", lat: -7.7972, lng: 110.3644, population: "3.8M", capital: "Yogyakarta" },
    { name: "Jawa Timur", lat: -7.2575, lng: 112.7521, population: "40.7M", capital: "Surabaya" },
    { name: "Banten", lat: -6.1204, lng: 106.1503, population: "13.0M", capital: "Serang" },
    { name: "Bali", lat: -8.6705, lng: 115.2126, population: "4.3M", capital: "Denpasar" },
    { name: "Nusa Tenggara Barat", lat: -8.5833, lng: 116.1167, population: "5.3M", capital: "Mataram" },
    { name: "Nusa Tenggara Timur", lat: -10.1772, lng: 123.6074, population: "5.5M", capital: "Kupang" },
    { name: "Kalimantan Barat", lat: -0.0263, lng: 109.3333, population: "5.4M", capital: "Pontianak" },
    { name: "Kalimantan Tengah", lat: -2.2135, lng: 113.9213, population: "2.7M", capital: "Palangka Raya" },
    { name: "Kalimantan Selatan", lat: -3.3194, lng: 114.5908, population: "4.1M", capital: "Banjarmasin" },
    { name: "Kalimantan Timur", lat: -0.5022, lng: 117.1382, population: "3.7M", capital: "Samarinda" },
    { name: "Kalimantan Utara", lat: 2.8441, lng: 117.3622, population: "0.7M", capital: "Tanjung Selor" },
    { name: "Sulawesi Utara", lat: 1.4748, lng: 124.8421, population: "2.6M", capital: "Manado" },
    { name: "Sulawesi Tengah", lat: -0.8999, lng: 119.8707, population: "3.0M", capital: "Palu" },
    { name: "Sulawesi Selatan", lat: -5.1477, lng: 119.4327, population: "9.0M", capital: "Makassar" },
    { name: "Sulawesi Tenggara", lat: -3.9689, lng: 122.5989, population: "2.6M", capital: "Kendari" },
    { name: "Gorontalo", lat: 0.5412, lng: 123.0595, population: "1.2M", capital: "Gorontalo" },
    { name: "Sulawesi Barat", lat: -2.6768, lng: 119.3254, population: "1.4M", capital: "Mamuju" },
    { name: "Maluku", lat: -3.6954, lng: 128.1819, population: "1.8M", capital: "Ambon" },
    { name: "Maluku Utara", lat: 0.7186, lng: 127.5669, population: "1.3M", capital: "Sofifi" },
    { name: "Papua", lat: -2.5333, lng: 140.7183, population: "4.3M", capital: "Jayapura" },
    { name: "Papua Barat", lat: -0.8618, lng: 134.0840, population: "1.1M", capital: "Manokwari" }
];

// Simple SVG-based map
function initIndonesiaMap() {
    const mapContainer = document.getElementById('indonesia-map');
    if (!mapContainer) return;

    // Clear existing content
    mapContainer.innerHTML = '';

    // Create SVG container
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('width', '100%');
    svg.setAttribute('height', '100%');
    svg.setAttribute('viewBox', '90 -15 60 25');
    svg.style.background = '#0a0a0a';

    // Add grid pattern
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
    svg.appendChild(defs);

    // Add grid background
    const gridRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    gridRect.setAttribute('width', '100%');
    gridRect.setAttribute('height', '100%');
    gridRect.setAttribute('fill', 'url(#grid)');
    svg.appendChild(gridRect);

    // Add province markers
    indonesiaProvinces.forEach((province, index) => {
        // Create marker group
        const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
        group.setAttribute('class', 'province-marker');
        group.setAttribute('data-province', province.name);

        // Outer glow circle
        const glowCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        glowCircle.setAttribute('cx', province.lng);
        glowCircle.setAttribute('cy', province.lat);
        glowCircle.setAttribute('r', '0.3');
        glowCircle.setAttribute('fill', 'rgba(122, 197, 90, 0.2)');
        glowCircle.setAttribute('class', 'marker-glow');

        // Main marker circle
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', province.lng);
        circle.setAttribute('cy', province.lat);
        circle.setAttribute('r', '0.15');
        circle.setAttribute('fill', '#7AC55A');
        circle.setAttribute('stroke', '#C3DB65');
        circle.setAttribute('stroke-width', '0.03');
        circle.setAttribute('class', 'marker-circle');

        group.appendChild(glowCircle);
        group.appendChild(circle);

        // Add interactivity
        group.style.cursor = 'pointer';
        group.addEventListener('mouseenter', function(e) {
            circle.setAttribute('r', '0.25');
            glowCircle.setAttribute('r', '0.5');
            showTooltip(province, e);
        });

        group.addEventListener('mouseleave', function() {
            circle.setAttribute('r', '0.15');
            glowCircle.setAttribute('r', '0.3');
            hideTooltip();
        });

        group.addEventListener('click', function(e) {
            showProvinceInfo(province, e);
        });

        svg.appendChild(group);

        // Add pulsing animation with delay
        setTimeout(() => {
            glowCircle.style.animation = `pulse 2s ease-in-out infinite`;
        }, index * 50);
    });

    mapContainer.appendChild(svg);

    // Add CSS for animations
    addMapStyles();
}

// Add styles for map animations
function addMapStyles() {
    if (document.getElementById('map-styles')) return;

    const style = document.createElement('style');
    style.id = 'map-styles';
    style.textContent = `
        @keyframes pulse {
            0%, 100% {
                opacity: 0.2;
                transform: scale(1);
            }
            50% {
                opacity: 0.6;
                transform: scale(1.5);
            }
        }

        .province-marker:hover .marker-circle {
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

// Show tooltip on hover
function showTooltip(province, event) {
    let tooltip = document.querySelector('.province-tooltip');
    if (!tooltip) {
        tooltip = document.createElement('div');
        tooltip.className = 'province-tooltip';
        document.body.appendChild(tooltip);
    }

    tooltip.innerHTML = `
        <h4>${province.name}</h4>
        <div class="info">
            <strong>Capital:</strong> ${province.capital}<br>
            <strong>Population:</strong> ${province.population}
        </div>
    `;

    tooltip.style.display = 'block';
    tooltip.style.left = (event.clientX + 20) + 'px';
    tooltip.style.top = (event.clientY + 20) + 'px';
}

// Hide tooltip
function hideTooltip() {
    const tooltip = document.querySelector('.province-tooltip');
    if (tooltip) {
        tooltip.style.display = 'none';
    }
}

// Show province information in popup
function showProvinceInfo(province, event) {
    const info = `
        <div style="text-align: center;">
            <h3 style="color: #7AC55A; margin-bottom: 0.5rem;">${province.name}</h3>
            <p style="color: #C3DB65; margin: 0.3rem 0;">
                <strong>Capital:</strong> ${province.capital}
            </p>
            <p style="color: #C3DB65; margin: 0.3rem 0;">
                <strong>Population:</strong> ${province.population}
            </p>
        </div>
    `;

    // You could add a modal or alert here
    console.log(`Selected: ${province.name}`);
}

// Modal controls
const mapModal = document.getElementById('indonesia-map-modal');
const mapCloseBtn = document.querySelector('.map-close-btn');

// Open modal when clicking +62 menu
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
    const provincesCheckbox = document.getElementById('provinces-layer');
    const districtsCheckbox = document.getElementById('districts-layer');

    if (provincesCheckbox) {
        provincesCheckbox.addEventListener('change', function() {
            const markers = document.querySelectorAll('.province-marker');
            markers.forEach(marker => {
                marker.style.display = this.checked ? 'block' : 'none';
            });
        });
    }

    if (districtsCheckbox) {
        districtsCheckbox.addEventListener('change', function() {
            if (this.checked) {
                // Placeholder for districts layer
                console.log('Districts layer - coming soon');
                alert('Districts layer coming soon!');
                this.checked = false;
            }
        });
    }
});

// Open map modal
function openMapModal() {
    mapModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Initialize map if not already done
    if (!map) {
        setTimeout(function() {
            initIndonesiaMap();
            map = true; // Mark as initialized
        }, 100);
    }
}

// Close map modal
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

