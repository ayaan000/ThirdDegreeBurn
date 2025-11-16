// assets/js/build-prints.js
// Run from project root:
//    node assets/js/build-prints.js
// This will scan assets/prints/*.stl and write assets/prints/prints.json

const fs = require("fs");
const path = require("path");

const PRINTS_DIR = path.join(__dirname, "..", "prints");
const OUT_FILE = path.join(PRINTS_DIR, "prints.json");

// make sure folder exists
if (!fs.existsSync(PRINTS_DIR)) {
    fs.mkdirSync(PRINTS_DIR, { recursive: true });
}

function isSTL(name) {
    return name.toLowerCase().endsWith(".stl");
}

function main() {
    const files = fs.readdirSync(PRINTS_DIR)
        .filter(isSTL)
        .map((f) => ({
            name: f.replace(/\.stl$/i, ""),
            file: `assets/prints/${f}`
        }))
        .sort((a, b) => a.name.localeCompare(b.name));

    fs.writeFileSync(OUT_FILE, JSON.stringify({ prints: files }, null, 2));
    console.log(`✅ wrote ${files.length} STL(s) to ${OUT_FILE}`);
}

main();
