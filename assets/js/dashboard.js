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

    // Wildlife
    const wildlifeData = [
        { id: 'fox29', name: "Arctic Fox #29", type: "Mammal", emoji: "🦊", lat: 70, lng: -40, color: "#ff8c00", dLat: -0.05, dLng: 0.1 },
        { id: 'whale01', name: "Blue Whale Pod", type: "Marine", emoji: "🐋", lat: -10, lng: -100, color: "#4ee6b5", dLat: 0.02, dLng: -0.08 },
        { id: 'leo04', name: "Snow Leopard", type: "Mammal", emoji: "🐆", lat: 35, lng: 80, color: "#ff8c00", dLat: 0.01, dLng: 0.01 },
        { id: 'bird88', name: "Wandering Albatross", type: "Bird", emoji: "🦅", lat: -45, lng: 20, color: "#d96bff", dLat: 0.1, dLng: 0.2 },
        { id: 'turt07', name: "Sea Turtle", type: "Marine", emoji: "🐢", lat: 0, lng: 120, color: "#4ee6b5", dLat: 0.03, dLng: -0.03 },
        { id: 'ele12', name: "Elephant Herd", type: "Mammal", emoji: "🐘", lat: -15, lng: 25, color: "#ff8c00", dLat: 0.005, dLng: 0.01 },
        { id: 'wolf02', name: "Grey Wolf Pack", type: "Mammal", emoji: "🐺", lat: 55, lng: -110, color: "#ff8c00", dLat: -0.02, dLng: 0.02 },
        { id: 'shark99', name: "Great White", type: "Marine", emoji: "🦈", lat: -34, lng: 18, color: "#ff4444", dLat: 0.05, dLng: -0.05 },
        { id: 'eagle01', name: "Bald Eagle", type: "Bird", emoji: "🦅", lat: 50, lng: -125, color: "#d96bff", dLat: -0.05, dLng: 0.05 },
        { id: 'bear03', name: "Polar Bear", type: "Mammal", emoji: "🐻‍❄️", lat: 78, lng: -15, color: "#ffffff", dLat: -0.01, dLng: -0.02 },
        { id: 'orca01', name: "Orca Pod A", type: "Marine", emoji: "🐋", lat: 48, lng: -123, color: "#ffffff", dLat: 0.04, dLng: -0.02 },
        { id: 'orca02', name: "Orca Pod B", type: "Marine", emoji: "🐋", lat: -60, lng: -60, color: "#ffffff", dLat: -0.03, dLng: 0.04 },
        { id: 'dolph01', name: "Bottlenose Dolphins", type: "Marine", emoji: "🐬", lat: 25, lng: -80, color: "#4ee6b5", dLat: 0.06, dLng: 0.06 },
        { id: 'dolph02', name: "Spinner Dolphins", type: "Marine", emoji: "🐬", lat: -15, lng: 150, color: "#4ee6b5", dLat: 0.05, dLng: -0.05 },
        { id: 'shark02', name: "Hammerhead Shark", type: "Marine", emoji: "🦈", lat: 0, lng: -90, color: "#ff4444", dLat: 0.02, dLng: 0.08 },
        { id: 'shark03', name: "Tiger Shark", type: "Marine", emoji: "🦈", lat: 20, lng: -155, color: "#ff4444", dLat: 0.04, dLng: -0.04 },
        { id: 'hump01', name: "Humpback Whale", type: "Marine", emoji: "🐋", lat: 20, lng: -156, color: "#4ee6b5", dLat: 0.01, dLng: -0.01 },
        { id: 'narwhal', name: "Narwhal", type: "Marine", emoji: "🦄", lat: 75, lng: -80, color: "#d96bff", dLat: -0.02, dLng: 0.01 },
    ];

    // Resources
    const resourceData = [
        { name: "Lithium Deposit", type: "Mineral", emoji: "🔋", lat: -22, lng: -68, color: "#6366f1" },
        { name: "Rare Earths", type: "Mineral", emoji: "💎", lat: 35, lng: 105, color: "#6366f1" },
        { name: "Cobalt Reserve", type: "Mineral", emoji: "⚙️", lat: -5, lng: 25, color: "#6366f1" },
        { name: "Gold Vein", type: "Metal", emoji: "⚱️", lat: 64, lng: -140, color: "#ffd700" },
        { name: "Offshore Oil", type: "Energy", emoji: "🛢️", lat: 25, lng: 55, color: "#333333" },
        { name: "Oil Field", type: "Energy", emoji: "🛢️", lat: 31, lng: -102, color: "#333333" },
        { name: "Natural Gas", type: "Energy", emoji: "🔥", lat: 60, lng: 75, color: "#ff4444" },
        { name: "Uranium Mine", type: "Energy", emoji: "☢️", lat: -12, lng: 132, color: "#4ee6b5" },
    ];

    // Natural Phenomena
    const phenomenaData = [
        { name: "Hurricane 'Atlas'", type: "Storm", emoji: "🌪️", lat: 15, lng: -45, color: "#ffffff", dLat: 0.1, dLng: -0.2, class: "storm-marker" },
        { name: "Typhoon 'Kira'", type: "Storm", emoji: "🌀", lat: 10, lng: 130, color: "#ffffff", dLat: 0.15, dLng: -0.1, class: "storm-marker" },
        { name: "Mt. Etna", type: "Volcano", emoji: "🌋", lat: 37.7, lng: 15, color: "#ff4444", class: "volcano-marker" },
        { name: "Kilauea", type: "Volcano", emoji: "🌋", lat: 19.4, lng: -155.3, color: "#ff4444", class: "volcano-marker" },
        { name: "Sakurajima", type: "Volcano", emoji: "🌋", lat: 31.6, lng: 130.6, color: "#ff4444", class: "volcano-marker" },
    ];

    // Space Station (Special)
    const issData = { name: "ISS (Zarya)", type: "Space Station", emoji: "🛰️", lat: 0, lng: 0, color: "#4ee6b5", dLat: 0.5, dLng: 2.5 };

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
});
