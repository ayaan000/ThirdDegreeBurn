// assets/js/convert.js
document.addEventListener("DOMContentLoaded", () => {
    if (!document.body.matches('[data-page="convert"]')) return;

    const imageInput = document.getElementById("imageInput");
    const imagePreview = document.getElementById("imagePreview");
    const previewContainer = document.getElementById("imagePreviewContainer");
    const imageError = document.getElementById("imageError");
    const convertBtn = document.getElementById("convertBtn");
    const downloadLink = document.getElementById("downloadLink");
    const convertMsg = document.getElementById("convertMsg");
    const extrudeHeightInput = document.getElementById("extrudeHeight");
    const scalePercentInput = document.getElementById("scalePercent");

    let loadedImage = null;

    imageInput.addEventListener("change", (event) => {
        const file = event.target.files[0];
        imageError.textContent = "";
        imagePreview.style.display = "none";
        convertBtn.disabled = true;
        downloadLink.style.display = "none";
        convertMsg.textContent = "";

        if (!file) {
            previewContainer.innerHTML = '<span class="empty-text">No image selected</span>';
            return;
        }

        const valid = ["image/png", "image/jpeg"];
        if (!valid.includes(file.type)) {
            imageError.textContent = "Only PNG or JPEG allowed.";
            imageInput.value = "";
            previewContainer.innerHTML = '<span class="empty-text">No image selected</span>';
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            loadedImage = new Image();
            loadedImage.onload = () => {
                // show preview
                imagePreview.src = loadedImage.src;
                imagePreview.style.display = "block";
                const span = previewContainer.querySelector("span");
                if (span) span.remove();
                convertBtn.disabled = false;
                convertMsg.textContent = "Image loaded. Adjust settings, then convert.";
            };
            loadedImage.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    convertBtn.addEventListener("click", () => {
        if (!loadedImage) return;

        const h = parseFloat(extrudeHeightInput.value) || 5;
        const s = (parseFloat(scalePercentInput.value) || 100) / 100;

        // draw image to canvas
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.width = loadedImage.width;
        canvas.height = loadedImage.height;
        ctx.drawImage(loadedImage, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imgData.data;

        convertMsg.textContent = "Converting… this runs in the browser.";

        // generate STL
        const stlText = imageToSTL(pixels, canvas.width, canvas.height, h, s);

        const blob = new Blob([stlText], { type: "application/sla" });
        const url = URL.createObjectURL(blob);
        downloadLink.href = url;
        downloadLink.style.display = "inline-flex";
        downloadLink.download = "image_heightmap.stl";
        convertMsg.textContent = "STL ready. Click Download.";
    });

    function imageToSTL(pixels, width, height, maxHeightMM, scale) {
        // grayscale helper
        function gray(x, y) {
            const idx = (y * width + x) * 4;
            const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2];
            return (r + g + b) / 3; // 0..255
        }

        let stl = "solid image_heightmap\n";

        const dx = scale; // grid size in "mm"
        const dy = scale;
        const maxH = maxHeightMM;

        for (let y = 0; y < height - 1; y++) {
            for (let x = 0; x < width - 1; x++) {
                const z00 = (gray(x, y) / 255) * maxH;
                const z10 = (gray(x + 1, y) / 255) * maxH;
                const z01 = (gray(x, y + 1) / 255) * maxH;
                const z11 = (gray(x + 1, y + 1) / 255) * maxH;

                const v00 = [x * dx, y * dy, z00];
                const v10 = [(x + 1) * dx, y * dy, z10];
                const v01 = [x * dx, (y + 1) * dy, z01];
                const v11 = [(x + 1) * dx, (y + 1) * dy, z11];

                // top surface
                stl += facet(v00, v10, v11);
                stl += facet(v00, v11, v01);

                // bottom base (z=0) so it's printable
                const b00 = [x * dx, y * dy, 0];
                const b10 = [(x + 1) * dx, y * dy, 0];
                const b01 = [x * dx, (y + 1) * dy, 0];
                const b11 = [(x + 1) * dx, (y + 1) * dy, 0];

                stl += facet(b11, b10, b00);
                stl += facet(b01, b11, b00);
            }
        }

        stl += "endsolid image_heightmap\n";
        return stl;

        function facet(a, b, c) {
            const n = normal(a, b, c);
            return `facet normal ${n[0]} ${n[1]} ${n[2]}
outer loop
vertex ${a[0]} ${a[1]} ${a[2]}
vertex ${b[0]} ${b[1]} ${b[2]}
vertex ${c[0]} ${c[1]} ${c[2]}
endloop
endfacet
`;
        }

        function normal(a, b, c) {
            const u = [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
            const v = [c[0] - a[0], c[1] - a[1], c[2] - a[2]];
            const nx = u[1] * v[2] - u[2] * v[1];
            const ny = u[2] * v[0] - u[0] * v[2];
            const nz = u[0] * v[1] - u[1] * v[0];
            const len = Math.sqrt(nx * nx + ny * ny + nz * nz) || 1;
            return [nx / len, ny / len, nz / len];
        }
    }
});
