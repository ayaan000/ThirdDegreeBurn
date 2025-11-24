// Exoplanet Data Visualizer
// Interactive scatter plot with real exoplanet data

(function () {
    'use strict';

    const plotContainer = document.getElementById('exoplanetPlot');
    const planetInfo = document.getElementById('planetInfo');
    const filterMethod = document.getElementById('filterMethod');
    const colorBy = document.getElementById('colorBy');
    const planetCount = document.getElementById('planetCount');

    if (!plotContainer) return;

    let canvas, ctx;
    let width, height;
    let currentFilter = 'all';
    let currentColorMode = 'method';
    let hoveredPlanet = null;

    // Sample exoplanet dataset (real data simplified)
    const exoplanets = [
        { name: 'Kepler-186f', mass: 1.4, radius: 1.11, period: 129.9, distance: 178, year: 2014, method: 'transit' },
        { name: 'Proxima Centauri b', mass: 1.27, radius: 1.1, period: 11.2, distance: 4.2, year: 2016, method: 'radial' },
        { name: 'TRAPPIST-1e', mass: 0.62, radius: 0.92, period: 6.1, distance: 39, year: 2017, method: 'transit' },
        { name: 'HD 209458 b', mass: 220, radius: 1.38, period: 3.5, distance: 159, year: 1999, method: 'transit' },
        { name: '51 Pegasi b', mass: 150, radius: 1.9, period: 4.2, distance: 50, year: 1995, method: 'radial' },
        { name: 'Kepler-452b', mass: 5, radius: 1.6, period: 384.8, distance: 1400, year: 2015, method: 'transit' },
        { name: 'Gliese 581c', mass: 5.5, radius: 1.5, period: 12.9, distance: 20, year: 2007, method: 'radial' },
        { name: 'HD 189733 b', mass: 360, radius: 1.14, period: 2.2, distance: 63, year: 2005, method: 'transit' },
        { name: 'Kepler-22b', mass: 35, radius: 2.4, period: 289.9, distance: 620, year: 2011, method: 'transit' },
        { name: 'HD 40307 g', mass: 7.1, radius: 1.8, period: 197.8, distance: 42, year: 2012, method: 'radial' },
        { name: 'Kepler-62f', mass: 2.8, radius: 1.41, period: 267.3, distance: 1200, year: 2013, method: 'transit' },
        { name: 'Tau Ceti e', mass: 4.3, radius: 1.5, period: 168, distance: 12, year: 2012, method: 'radial' },
        { name: 'Kepler-69c', mass: 9.5, radius: 1.7, period: 242.5, distance: 2700, year: 2013, method: 'transit' },
        { name: '55 Cancri e', mass: 8.6, radius: 2.1, period: 0.7, distance: 40, year: 2004, method: 'radial' },
        { name: 'Kepler-442b', mass: 2.3, radius: 1.34, period: 112.3, distance: 1120, year: 2015, method: 'transit' },
        { name: 'GJ 1214 b', mass: 6.5, radius: 2.68, period: 1.6, distance: 40, year: 2009, method: 'transit' },
        { name: 'Kepler-10b', mass: 4.5, radius: 1.47, period: 0.8, distance: 564, year: 2011, method: 'transit' },
        { name: 'CoRoT-7b', mass: 4.8, radius: 1.58, period: 0.9, distance: 489, year: 2009, method: 'transit' },
        { name: 'Kepler-11 system', mass: 8, radius: 2.0, period: 118, distance: 2000, year: 2011, method: 'transit' },
        { name: 'HD 85512 b', mass: 3.6, radius: 1.4, period: 54.4, distance: 36, year: 2011, method: 'radial' },
        { name: 'Fomalhaut b', mass: 640, radius: 2.5, period: 320000, distance: 25, year: 2008, method: 'imaging' },
        { name: 'Beta Pictoris b', mass: 3700, radius: 1.65, period: 7300, distance: 63, year: 2008, method: 'imaging' },
        { name: 'HR 8799 b', mass: 2100, radius: 1.2, period: 164000, distance: 129, year: 2008, method: 'imaging' },
        { name: 'OGLE-2005-BLG-390L b', mass: 5.5, radius: 1.5, period: 3500, distance: 21500, year: 2006, method: 'microlensing' },
        { name: 'MOA-2007-BLG-192-L b', mass: 3.3, radius: 1.3, period: 600, distance: 3000, year: 2008, method: 'microlensing' },
        { name: 'Kepler-16b', mass: 105, radius: 0.75, period: 228.8, distance: 200, year: 2011, method: 'transit' },
        { name: 'Kepler-90h', mass: 200, radius: 1.32, period: 331.6, distance: 2545, year: 2013, method: 'transit' },
        { name: 'WASP-12b', mass: 445, radius: 1.79, period: 1.1, distance: 1410, year: 2008, method: 'transit' },
        { name: 'HAT-P-7b', mass: 537, radius: 1.4, period: 2.2, distance: 1040, year: 2008, method: 'transit' },
        { name: 'Kepler-1649c', mass: 1.3, radius: 1.06, period: 19.5, distance: 300, year: 2020, method: 'transit' }
    ];

    const methodColors = {
        transit: '#4A90E2',
        radial: '#E27B58',
        imaging: '#50C878',
        microlensing: '#9B59B6',
        all: '#888888'
    };

    function init() {
        canvas = document.createElement('canvas');
        plotContainer.appendChild(canvas);
        ctx = canvas.getContext('2d');

        resize();
        window.addEventListener('resize', resize);

        // Event listeners
        if (filterMethod) {
            filterMethod.addEventListener('change', (e) => {
                currentFilter = e.target.value;
                draw();
            });
        }

        if (colorBy) {
            colorBy.addEventListener('change', (e) => {
                currentColorMode = e.target.value;
                draw();
            });
        }

        canvas.addEventListener('mousemove', onMouseMove);
        canvas.addEventListener('mouseout', onMouseOut);

        draw();
    }

    function resize() {
        const rect = plotContainer.getBoundingClientRect();
        width = rect.width;
        height = rect.height;
        canvas.width = width * window.devicePixelRatio;
        canvas.height = height * window.devicePixelRatio;
        canvas.style.width = width + 'px';
        canvas.style.height = height + 'px';
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        draw();
    }

    function getFilteredPlanets() {
        if (currentFilter === 'all') return exoplanets;
        return exoplanets.filter(p => p.method === currentFilter);
    }

    function getPlanetColor(planet) {
        if (currentColorMode === 'method') {
            return methodColors[planet.method] || '#888';
        } else if (currentColorMode === 'year') {
            const t = (planet.year - 1995) / (2020 - 1995);
            return `hsl(${200 + t * 160}, 70%, 60%)`;
        } else if (currentColorMode === 'distance') {
            const t = Math.min(planet.distance / 1000, 1);
            return `hsl(${30 + t * 200}, 70%, 60%)`;
        }
        return '#888';
    }

    function draw() {
        const filtered = getFilteredPlanets();

        if (planetCount) {
            planetCount.textContent = filtered.length;
        }

        // Clear
        ctx.fillStyle = '#0a0a0a';
        ctx.fillRect(0, 0, width, height);

        // Margins
        const margin = { top: 40, right: 40, bottom: 60, left: 70 };
        const plotWidth = width - margin.left - margin.right;
        const plotHeight = height - margin.top - margin.bottom;

        // Scales
        const maxMass = Math.max(...filtered.map(p => p.mass));
        const maxRadius = Math.max(...filtered.map(p => p.radius));
        const maxPeriod = Math.max(...filtered.map(p => Math.log10(p.period + 1)));

        function scaleX(period) {
            return margin.left + (Math.log10(period + 1) / maxPeriod) * plotWidth;
        }

        function scaleY(mass) {
            return margin.top + plotHeight - (Math.log10(mass + 1) / Math.log10(maxMass + 1)) * plotHeight;
        }

        function scaleRadius(radius) {
            return Math.max(3, Math.min(15, (radius / maxRadius) * 12));
        }

        // Draw axes
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(margin.left, margin.top);
        ctx.lineTo(margin.left, height - margin.bottom);
        ctx.lineTo(width - margin.right, height - margin.bottom);
        ctx.stroke();

        // Axis labels
        ctx.fillStyle = '#aaa';
        ctx.font = '14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Orbital Period (days, log scale)', width / 2, height - margin.bottom + 40);

        ctx.save();
        ctx.translate(margin.left - 50, height / 2);
        ctx.rotate(-Math.PI / 2);
        ctx.fillText('Planet Mass (Earth masses, log scale)', 0, 0);
        ctx.restore();

        // Grid lines
        ctx.strokeStyle = '#222';
        ctx.lineWidth = 1;
        ctx.setLineDash([2, 4]);
        for (let i = 0; i <= 5; i++) {
            const x = margin.left + (i / 5) * plotWidth;
            ctx.beginPath();
            ctx.moveTo(x, margin.top);
            ctx.lineTo(x, height - margin.bottom);
            ctx.stroke();

            const y = margin.top + (i / 5) * plotHeight;
            ctx.beginPath();
            ctx.moveTo(margin.left, y);
            ctx.lineTo(width - margin.right, y);
            ctx.stroke();
        }
        ctx.setLineDash([]);

        // Draw planets
        filtered.forEach(planet => {
            const x = scaleX(planet.period);
            const y = scaleY(planet.mass);
            const r = scaleRadius(planet.radius);

            ctx.fillStyle = getPlanetColor(planet);
            ctx.globalAlpha = planet === hoveredPlanet ? 1 : 0.7;

            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();

            if (planet === hoveredPlanet) {
                ctx.strokeStyle = '#fff';
                ctx.lineWidth = 2;
                ctx.stroke();
            }

            // Store coordinates for hit detection
            planet._x = x;
            planet._y = y;
            planet._r = r;
        });

        ctx.globalAlpha = 1;

        // Legend
        if (currentColorMode === 'method') {
            const legendX = width - margin.right - 120;
            let legendY = margin.top + 20;

            ctx.font = 'bold 12px Arial';
            ctx.fillStyle = '#aaa';
            ctx.textAlign = 'left';
            ctx.fillText('Discovery Method:', legendX, legendY);

            legendY += 20;
            Object.entries(methodColors).forEach(([method, color]) => {
                if (method === 'all') return;
                ctx.fillStyle = color;
                ctx.beginPath();
                ctx.arc(legendX + 10, legendY, 5, 0, Math.PI * 2);
                ctx.fill();

                ctx.fillStyle = '#ccc';
                ctx.font = '11px Arial';
                ctx.fillText(method.charAt(0).toUpperCase() + method.slice(1), legendX + 25, legendY + 4);
                legendY += 18;
            });
        }
    }

    function onMouseMove(e) {
        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const filtered = getFilteredPlanets();
        let found = null;

        for (const planet of filtered) {
            if (!planet._x) continue;
            const dx = x - planet._x;
            const dy = y - planet._y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < planet._r + 3) {
                found = planet;
                break;
            }
        }

        if (found !== hoveredPlanet) {
            hoveredPlanet = found;
            draw();
            updateInfoPanel(found);
        }

        canvas.style.cursor = found ? 'pointer' : 'default';
    }

    function onMouseOut() {
        if (hoveredPlanet) {
            hoveredPlanet = null;
            draw();
            updateInfoPanel(null);
        }
    }

    function updateInfoPanel(planet) {
        if (!planetInfo) return;

        if (!planet) {
            planetInfo.innerHTML = '<div class="info-placeholder">Hover over a planet to see details</div>';
            return;
        }

        planetInfo.innerHTML = `
      <h3 style="margin: 0 0 0.75rem 0; color: var(--accent);">${planet.name}</h3>
      <div class="planet-detail">
        <div class="planet-detail-item">
          <span class="planet-detail-label">Mass:</span>
          <span class="planet-detail-value">${planet.mass} M⊕</span>
        </div>
        <div class="planet-detail-item">
          <span class="planet-detail-label">Radius:</span>
          <span class="planet-detail-value">${planet.radius} R⊕</span>
        </div>
        <div class="planet-detail-item">
          <span class="planet-detail-label">Period:</span>
          <span class="planet-detail-value">${planet.period} days</span>
        </div>
        <div class="planet-detail-item">
          <span class="planet-detail-label">Distance:</span>
          <span class="planet-detail-value">${planet.distance} ly</span>
        </div>
        <div class="planet-detail-item">
          <span class="planet-detail-label">Discovered:</span>
          <span class="planet-detail-value">${planet.year}</span>
        </div>
        <div class="planet-detail-item">
          <span class="planet-detail-label">Method:</span>
          <span class="planet-detail-value">${planet.method.charAt(0).toUpperCase() + planet.method.slice(1)}</span>
        </div>
      </div>
    `;
    }

    // Initialize
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

})();
