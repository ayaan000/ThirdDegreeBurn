// assets/js/universe.js
// simple orbit / particle sim

document.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("universeCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = canvas.clientWidth;
        canvas.height = canvas.clientHeight;
    }
    resize();
    window.addEventListener("resize", resize);

    const center = () => ({ x: canvas.width / 2, y: canvas.height / 2 });

    const planets = [
        { r: 18, dist: 60, speed: 0.01, angle: 0, color: "#ff8c00" },
        { r: 9, dist: 105, speed: 0.018, angle: 1.5, color: "#2ec4ff" },
        { r: 5, dist: 145, speed: 0.03, angle: 2.7, color: "#fff" }
    ];
    const stars = Array.from({ length: 90 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 1.3,
        alpha: Math.random() * .5 + .2
    }));

    function tick() {
        const c = center();
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // stars
        stars.forEach((s) => {
            ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
            ctx.fillRect(s.x, s.y, s.size, s.size);
        });

        // sun
        ctx.beginPath();
        ctx.fillStyle = "#ffb347";
        ctx.arc(c.x, c.y, 26, 0, Math.PI * 2);
        ctx.fill();

        // orbits + planets
        planets.forEach((p) => {
            // orbit
            ctx.strokeStyle = "rgba(255,255,255,.08)";
            ctx.beginPath();
            ctx.arc(c.x, c.y, p.dist, 0, Math.PI * 2);
            ctx.stroke();

            // pos
            p.angle += p.speed;
            const x = c.x + Math.cos(p.angle) * p.dist;
            const y = c.y + Math.sin(p.angle) * p.dist;
            ctx.beginPath();
            ctx.fillStyle = p.color;
            ctx.arc(x, y, p.r, 0, Math.PI * 2);
            ctx.fill();
        });

        requestAnimationFrame(tick);
    }
    tick();
});
