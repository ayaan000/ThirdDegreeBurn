// assets/js/portfolio.js
// shared helpers to load STL list from assets/prints/prints.json

async function fetchPrintsList() {
    const res = await fetch("assets/prints/prints.json", { cache: "no-store" });
    if (!res.ok) throw new Error("Failed to load prints.json");
    const data = await res.json();
    return data.prints || [];
}

// encode spaces in URL part
function encodeSTLPath(rawPath) {
    const parts = rawPath.split("/");
    const last = parts.pop();
    return [...parts, encodeURIComponent(last)].join("/");
}
