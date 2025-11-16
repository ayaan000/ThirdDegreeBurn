// assets/js/jobs.js

document.addEventListener("DOMContentLoaded", () => {
    const jobs = [
        {
            title: "AI / LLM Data Annotation",
            org: "Data Annotation Tech",
            city: "Toronto",
            lat: 43.6532,
            lng: -79.3832,
            url: "https://www.dataannotation.tech/"
        },
        {
            title: "Unity / Gameplay Temp Contract",
            org: "Indie Lab",
            city: "Kolkata",
            lat: 22.5726,
            lng: 88.3639,
            url: "#"
        },
        {
            title: "3D / CAD Print Technician",
            org: "Local Fab House",
            city: "Mississauga",
            lat: 43.5890,
            lng: -79.6441,
            url: "#"
        }
    ];

    // list
    const listEl = document.getElementById("jobsList");
    jobs.forEach((job) => {
        const li = document.createElement("li");
        li.innerHTML = `<strong>${job.title}</strong><br/>
      <span style="color:#aaa;">${job.org} — ${job.city}</span>`;
        li.addEventListener("click", () => {
            if (window._jobs_map) {
                window._jobs_map.setView([job.lat, job.lng], 11);
            }
        });
        listEl.appendChild(li);
    });

    // map
    const map = L.map("jobsMap").setView([43.6532, -79.3832], 4);
    window._jobs_map = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "&copy; OpenStreetMap contributors"
    }).addTo(map);

    jobs.forEach((j) => {
        L.marker([j.lat, j.lng]).addTo(map).bindPopup(`<b>${j.title}</b><br/>${j.org}`);
    });
});
