// assets/js/dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    // Initialize Map
    const map = L.map('map', {
        center: [20, 0],
        zoom: 3,
        zoomControl: false,
        attributionControl: false
    });

    // Add Zoom Control to top-right
    L.control.zoom({
        position: 'topright'
    }).addTo(map);

    // Dark Theme Tiles (CartoDB Dark Matter)
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap &copy; CARTO',
        subdomains: 'abcd',
        maxZoom: 19
    }).addTo(map);

    // Layer Groups
    const wildlifeLayer = L.layerGroup().addTo(map);
    const resourceLayer = L.layerGroup().addTo(map);
    const satelliteLayer = L.layerGroup();
    const phenomenaLayer = L.layerGroup().addTo(map); // New layer for storms/volcanoes
    const trailsLayer = L.layerGroup().addTo(map);

    // Custom Icons
    const createIcon = (emoji, color, size = 30, className = 'custom-map-marker') => L.divIcon({
        className: className,
        html: `<div style="
            background-color: ${color};
            width: ${size}px;
            height: ${size}px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: ${size * 0.55}px;
            box-shadow: 0 0 15px ${color};
            border: 2px solid rgba(255,255,255,0.9);
            transition: all 0.5s ease;
        ">${emoji}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
    });

    // --- DATASETS ---

    // --- DATASETS (REAL WORLD REGIONS) ---

    // Wildlife: Accurate habitats
    const wildlifeData = [
        // Arctic / Antarctic
        { id: 'bear01', name: "Polar Bear", type: "Mammal", emoji: "🐻‍❄️", lat: 78.22, lng: 15.6, color: "#ffffff", dLat: -0.01, dLng: -0.02, location: "Svalbard, Norway" },
        { id: 'peng01', name: "Emperor Penguin Colony", type: "Bird", emoji: "🐧", lat: -77.5, lng: 167.0, color: "#ffffff", dLat: 0.01, dLng: 0.01, location: "Ross Sea, Antarctica" },

        // Africa
        { id: 'lion01', name: "Lion Pride", type: "Mammal", emoji: "🦁", lat: -2.33, lng: 34.83, color: "#ff8c00", dLat: 0.01, dLng: 0.01, location: "Serengeti, Tanzania" },
        { id: 'ele01', name: "African Elephant Herd", type: "Mammal", emoji: "🐘", lat: -19.0, lng: 23.0, color: "#ff8c00", dLat: 0.005, dLng: 0.01, location: "Okavango Delta, Botswana" },
        { id: 'gori01', name: "Mountain Gorilla", type: "Mammal", emoji: "🦍", lat: -1.4, lng: 29.5, color: "#ff8c00", dLat: 0.002, dLng: 0.002, location: "Virunga Mts, Rwanda" },

        // Americas
        { id: 'jag01', name: "Jaguar", type: "Mammal", emoji: "🐆", lat: -3.46, lng: -62.21, color: "#ff8c00", dLat: 0.01, dLng: -0.01, location: "Amazon Rainforest, Brazil" },
        { id: 'tort01', name: "Galápagos Tortoise", type: "Reptile", emoji: "🐢", lat: -0.7, lng: -90.5, color: "#4ee6b5", dLat: 0.001, dLng: 0.001, location: "Galápagos Islands" },
        { id: 'bison01', name: "American Bison", type: "Mammal", emoji: "🐂", lat: 44.6, lng: -110.5, color: "#ff8c00", dLat: 0.02, dLng: 0.02, location: "Yellowstone, USA" },
        { id: 'condor01', name: "Andean Condor", type: "Bird", emoji: "🦅", lat: -15.8, lng: -71.5, color: "#d96bff", dLat: 0.1, dLng: 0.1, location: "Colca Canyon, Peru" },

        // Asia / Oceania
        { id: 'panda01', name: "Giant Panda", type: "Mammal", emoji: "🐼", lat: 30.8, lng: 103.0, color: "#ffffff", dLat: 0.005, dLng: 0.005, location: "Sichuan, China" },
        { id: 'tiger01', name: "Bengal Tiger", type: "Mammal", emoji: "🐅", lat: 21.8, lng: 88.8, color: "#ff8c00", dLat: 0.01, dLng: 0.01, location: "Sundarbans, India" },
        { id: 'kang01', name: "Red Kangaroo Mob", type: "Mammal", emoji: "🦘", lat: -25.3, lng: 131.0, color: "#ff8c00", dLat: 0.03, dLng: 0.03, location: "Outback, Australia" },
        { id: 'orang01', name: "Orangutan", type: "Mammal", emoji: "🦧", lat: -0.5, lng: 114.0, color: "#ff8c00", dLat: 0.01, dLng: 0.01, location: "Borneo, Indonesia" },

        // Oceans
        { id: 'whale01', name: "Blue Whale", type: "Marine", emoji: "🐋", lat: 34.0, lng: -120.0, color: "#4ee6b5", dLat: 0.02, dLng: -0.05, location: "California Coast" },
        { id: 'shark01', name: "Great White Shark", type: "Marine", emoji: "🦈", lat: -34.5, lng: 19.5, color: "#ff4444", dLat: 0.05, dLng: -0.05, location: "South Africa Coast" },
        { id: 'reef01', name: "Coral Reef Life", type: "Marine", emoji: "🐠", lat: -18.0, lng: 147.0, color: "#4ee6b5", dLat: 0, dLng: 0, location: "Great Barrier Reef" }
    ];

    // Resources: Major global deposits
    const resourceData = [
        // Minerals
        { name: "Lithium Triangle", type: "Mineral", emoji: "🔋", lat: -22.0, lng: -68.0, color: "#6366f1", location: "Chile/Bolivia/Argentina", desc: "Largest global lithium reserves" },
        { name: "Cobalt Belt", type: "Mineral", emoji: "⚙️", lat: -11.0, lng: 26.5, color: "#6366f1", location: "DRC", desc: "Primary global cobalt source" },
        { name: "Rare Earths", type: "Mineral", emoji: "💎", lat: 40.0, lng: 109.8, color: "#6366f1", location: "Bayan Obo, China", desc: "World's largest REE mine" },
        { name: "Gold Strike", type: "Metal", emoji: "⚱️", lat: 40.8, lng: -116.0, color: "#ffd700", location: "Nevada, USA", desc: "Major gold mining hub" },
        { name: "Iron Ore", type: "Metal", emoji: "🏗️", lat: -23.0, lng: 119.0, color: "#b0b0b0", location: "Pilbara, Australia", desc: "Massive iron formations" },

        // Energy
        { name: "Ghawar Field", type: "Energy", emoji: "🛢️", lat: 25.0, lng: 49.5, color: "#333333", location: "Saudi Arabia", desc: "World's largest oil field" },
        { name: "Permian Basin", type: "Energy", emoji: "🛢️", lat: 31.5, lng: -102.5, color: "#333333", location: "Texas/NM, USA", desc: "Major oil & gas basin" },
        { name: "Athabasca Sands", type: "Energy", emoji: "🛢️", lat: 57.0, lng: -111.5, color: "#333333", location: "Canada", desc: "Oil sands deposits" },
        { name: "North Field", type: "Energy", emoji: "🔥", lat: 26.5, lng: 52.0, color: "#ff4444", location: "Qatar/Iran", desc: "Largest natural gas field" },
        { name: "Cigar Lake", type: "Energy", emoji: "☢️", lat: 58.0, lng: -104.5, color: "#4ee6b5", location: "Saskatchewan, Canada", desc: "High-grade Uranium" },
    ];

    // Phenomena: Active/Famous locations
    const phenomenaData = [
        { name: "Ring of Fire", type: "Tectonic", emoji: "🌋", lat: 0, lng: 160, color: "#ff4444", class: "volcano-marker", desc: "Active tectonic belt" }, // Symbolic center
        { name: "Mt. Fuji", type: "Volcano", emoji: "🌋", lat: 35.36, lng: 138.72, color: "#ff4444", class: "volcano-marker" },
        { name: "Mauna Loa", type: "Volcano", emoji: "🌋", lat: 19.47, lng: -155.6, color: "#ff4444", class: "volcano-marker" },
        { name: "Eyjafjallajökull", type: "Volcano", emoji: "🌋", lat: 63.63, lng: -19.62, color: "#ff4444", class: "volcano-marker" },
        { name: "Typhoon Track", type: "Storm", emoji: "🌀", lat: 15.0, lng: 135.0, color: "#ffffff", dLat: 0.1, dLng: -0.2, class: "storm-marker", desc: "Pacific storm system" },
        { name: "Hurricane Alley", type: "Storm", emoji: "🌪️", lat: 15.0, lng: -40.0, color: "#ffffff", dLat: 0.1, dLng: -0.1, class: "storm-marker", desc: "Atlantic storm formation" },
    ];

    // Space Station (Approx Live Orbit)
    const issData = { name: "ISS (Zarya)", type: "Space Station", emoji: "🛰️", lat: 0, lng: 0, color: "#4ee6b5", dLat: 0.5, dLng: 2.5, desc: "Low Earth Orbit Laboratory" };

    // --- INITIALIZATION ---

    const wildlifeMarkers = {};
    const wildlifeTrails = {};
    const phenomenaMarkers = {};
    let issMarker = null;

    // 1. Wildlife
    wildlifeData.forEach(item => {
        const marker = L.marker([item.lat, item.lng], { icon: createIcon(item.emoji, item.color) });
        marker.bindPopup(`<b>${item.name}</b><br>ID: ${item.id.toUpperCase()}<br>Status: LIVE`);
        wildlifeLayer.addLayer(marker);
        wildlifeMarkers[item.id] = marker;

        const trail = L.polyline([], { color: item.color, weight: 2, opacity: 0.5 }).addTo(trailsLayer);
        wildlifeTrails[item.id] = trail;
        marker.data = item;
    });

    // 2. Resources
    resourceData.forEach(item => {
        const marker = L.marker([item.lat, item.lng], { icon: createIcon(item.emoji, item.color, 24) });
        marker.bindPopup(`<b>${item.name}</b><br>Type: ${item.type}<br>Value: High`);
        resourceLayer.addLayer(marker);
    });

    // 3. Phenomena
    phenomenaData.forEach(item => {
        const marker = L.marker([item.lat, item.lng], {
            icon: createIcon(item.emoji, item.color, 35, `custom-map-marker ${item.class || ''}`)
        });
        marker.bindPopup(`<b>${item.name}</b><br>Type: ${item.type}<br>Status: ACTIVE`);
        phenomenaLayer.addLayer(marker);
        if (item.dLat) { // If it moves (storms)
            phenomenaMarkers[item.name] = marker;
            marker.data = item;
        }
    });

    // Update Stats
    document.getElementById('stat-count').textContent = wildlifeData.length + resourceData.length + phenomenaData.length + 1;

    // --- LIVE SIMULATION ---

    const feed = document.getElementById('activity-feed');
    const addFeedItem = (text, type = 'normal') => {
        const li = document.createElement('li');
        li.className = 'feed-item';
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        let color = 'var(--text-main)';
        if (type === 'alert') color = '#ff4444';
        if (type === 'success') color = '#4ee6b5';
        li.innerHTML = `<span class="feed-time">${time}</span><span class="feed-text" style="color:${color}">${text}</span>`;
        feed.prepend(li);
        if (feed.children.length > 15) feed.lastChild.remove();
    };

    // Movement Loop (1s)
    setInterval(() => {
        // Wildlife
        Object.keys(wildlifeMarkers).forEach(id => {
            const marker = wildlifeMarkers[id];
            const data = marker.data;
            let newLat = marker.getLatLng().lat + data.dLat + (Math.random() - 0.5) * 0.05;
            let newLng = marker.getLatLng().lng + data.dLng + (Math.random() - 0.5) * 0.05;

            if (newLat > 85 || newLat < -85) data.dLat *= -1;
            if (newLng > 180) newLng = -180;
            if (newLng < -180) newLng = 180;

            const newPos = [newLat, newLng];
            marker.setLatLng(newPos);

            const trail = wildlifeTrails[id];
            trail.addLatLng(newPos);
            if (trail.getLatLngs().length > 20) {
                const points = trail.getLatLngs();
                points.shift();
                trail.setLatLngs(points);
            }
        });

        // Phenomena (Storms)
        Object.keys(phenomenaMarkers).forEach(key => {
            const marker = phenomenaMarkers[key];
            const data = marker.data;
            let newLat = marker.getLatLng().lat + data.dLat;
            let newLng = marker.getLatLng().lng + data.dLng;
            marker.setLatLng([newLat, newLng]);
        });

        // ISS (Fast Orbit)
        if (issMarker) {
            let newLat = issMarker.getLatLng().lat + issData.dLat;
            let newLng = issMarker.getLatLng().lng + issData.dLng;
            // Simple sine wave orbit approx
            issData.dLat = Math.cos(newLng * 0.05) * 2;

            if (newLng > 180) newLng = -180;
            issMarker.setLatLng([newLat, newLng]);
        }

    }, 1000);

    // Random Events
    setInterval(() => {
        const events = [
            { text: "Signal received from Arctic Fox #29", type: "success" },
            { text: "Whale Pod depth: 400m", type: "normal" },
            { text: "Satellite link stable", type: "success" },
            { text: "Oil pressure normal in Sector 4", type: "normal" },
            { text: "New deposit candidate detected", type: "alert" },
            { text: "Telemetry updated for Sea Turtle", type: "normal" },
            { text: "Migration pattern deviation: Wolf Pack", type: "alert" },
            { text: "Gold vein density analysis complete", type: "success" },
            { text: "Orca Pod A vocalization detected", type: "normal" },
            { text: "Hammerhead Shark crossing equator", type: "normal" },
            { text: "Dolphin pod surfing bow wave", type: "success" },
            { text: "Hurricane Atlas: Wind speed increasing", type: "alert" },
            { text: "Seismic activity near Kilauea", type: "alert" },
            { text: "ISS passing over Pacific Ocean", type: "success" }
        ];
        const event = events[Math.floor(Math.random() * events.length)];
        addFeedItem(event.text, event.type);
    }, 3500);

    addFeedItem("System initialized.", "success");
    addFeedItem("Live tracking active.", "success");

    // --- CONTROLS ---

    document.getElementById('layer-wildlife').addEventListener('change', (e) => {
        if (e.target.checked) {
            map.addLayer(wildlifeLayer);
            map.addLayer(trailsLayer);
        } else {
            map.removeLayer(wildlifeLayer);
            map.removeLayer(trailsLayer);
        }
    });

    document.getElementById('layer-resources').addEventListener('change', (e) => {
        if (e.target.checked) map.addLayer(resourceLayer);
        else map.removeLayer(resourceLayer);
    });

    document.getElementById('layer-phenomena').addEventListener('change', (e) => {
        if (e.target.checked) map.addLayer(phenomenaLayer);
        else map.removeLayer(phenomenaLayer);
    });

    document.getElementById('layer-space').addEventListener('change', (e) => {
        if (e.target.checked) {
            addFeedItem("Connecting to Space Network...", "alert");
            map.addLayer(satelliteLayer);

            // Create ISS if not exists
            if (!issMarker) {
                issMarker = L.marker([0, 0], {
                    icon: createIcon(issData.emoji, issData.color, 40, 'custom-map-marker iss-marker')
                }).addTo(satelliteLayer);
                issMarker.bindPopup(`<b>ISS (Zarya)</b><br>Altitude: 408km<br>Speed: 27,600 km/h`);
            }
        } else {
            map.removeLayer(satelliteLayer);
        }
    });

    // --- DIRECTORY LOGIC ---

    // 1. Tab Switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            // Add active
            btn.classList.add('active');
            const targetId = `tab-${btn.dataset.tab}`;
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 2. Render Directory
    const dirListEl = document.getElementById('directory-list');

    const renderDirectory = (filterText = '') => {
        dirListEl.innerHTML = '';
        const filter = filterText.toLowerCase();

        const createGroup = (title, items, typeStr) => {
            const filtered = items.filter(item =>
                item.name.toLowerCase().includes(filter) ||
                (item.location && item.location.toLowerCase().includes(filter))
            );

            if (filtered.length === 0) return;

            const titleEl = document.createElement('div');
            titleEl.className = 'directory-group-title';
            titleEl.textContent = title;
            dirListEl.appendChild(titleEl);

            filtered.forEach(item => {
                const div = document.createElement('div');
                div.className = 'directory-item';
                div.innerHTML = `
                    <span class="dir-icon">${item.emoji}</span>
                    <div class="dir-info">
                        <span class="dir-name">${item.name}</span>
                        <span class="dir-sub">${item.location || item.type}</span>
                    </div>
                    <span class="dir-locate">📍</span>
                `;

                div.addEventListener('click', () => {
                    // Zoom to location
                    map.flyTo([item.lat, item.lng], 6, {
                        animate: true,
                        duration: 1.5
                    });

                    // Open popup if marker exists active
                    // (Simplification: just fly to point for now)
                });

                dirListEl.appendChild(div);
            });
        };

        createGroup('Wildlife', wildlifeData);
        createGroup('Resources', resourceData);
        createGroup('Phenomena', phenomenaData);
        if (issData.name.toLowerCase().includes(filter)) {
            createGroup('Satellites', [issData]);
        }
    };

    renderDirectory();

    // 3. Search
    document.getElementById('dir-search').addEventListener('input', (e) => {
        renderDirectory(e.target.value);
    });

});
