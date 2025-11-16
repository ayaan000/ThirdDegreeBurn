// assets/js/upload.js
// used by upload.html to populate the "pick from library" <select>

(async function () {
    const libSelect = document.getElementById("librarySelect");
    if (!libSelect) return;

    try {
        const prints = await fetchPrintsList();
        prints.forEach((p) => {
            const opt = document.createElement("option");
            opt.value = p.file;
            opt.textContent = p.name;
            libSelect.appendChild(opt);
        });
    } catch (err) {
        console.warn("Could not load STL library:", err);
    }

    // when user picks from dropdown, show message
    const info = document.getElementById("libraryInfo");
    if (libSelect && info) {
        libSelect.addEventListener("change", () => {
            if (libSelect.value) {
                info.textContent = "Selected from library: " + libSelect.options[libSelect.selectedIndex].text;
            } else {
                info.textContent = "";
            }
        });
    }
})();
