// assets/js/weather.js
// simple Leaflet map centered on Toronto with a couple of layers

document.addEventListener("DOMContentLoaded", () => {
    const mapEl = document.getElementById("weatherMap");
    if (!mapEl) return;

    const map = L.map("weatherMap").setView([43.6532, -79.3832], 9);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    // sample “stations”
    const stations = [
        { name: "Downtown Sensor", lat: 43.65, lng: -79.38, temp: "6°C" },
        { name: "Mississauga Sensor", lat: 43.59, lng: -79.65, temp: "5°C" },
        { name: "York U Sensor", lat: 43.77, lng: -79.50, temp: "4°C" }
    ];

    stations.forEach((s) => {
        L.marker([s.lat, s.lng])
            .addTo(map)
            .bindPopup(`<strong>${s.name}</strong><br/>Temp: ${s.temp}`);
    });
});
