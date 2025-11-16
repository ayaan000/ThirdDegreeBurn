// tools/build-prints-manifest.js
//
// Usage (run this locally on your project root):
//    node tools/build-prints-manifest.js
//
// It will scan assets/prints/*.stl and write assets/js/prints-manifest.js

const fs = require("fs");
const path = require("path");

const printsDir = path.join(__dirname, "..", "assets", "prints");
const outFile = path.join(__dirname, "..", "assets", "js", "prints-manifest.js");

function isSTL(name) {
    return name.toLowerCase().endsWith(".stl");
}

const all = fs.readdirSync(printsDir)
    .filter(isSTL)
    .map(fname => `assets/prints/${fname}`);

const fileContents = `// AUTO-GENERATED. Do not edit by hand.
// Run "node tools/build-prints-manifest.js" after adding/removing STL files.
window.PORTFOLIO_PRINTS = ${JSON.stringify(all, null, 2)};
`;

fs.writeFileSync(outFile, fileContents, "utf8");
console.log(`Wrote ${outFile} with ${all.length} entries.`);
