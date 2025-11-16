// assets/js/main.js

// mobile nav toggle
(function () {
    const burger = document.querySelector(".nav-burger");
    const menu = document.querySelector(".nav-right");
    if (burger && menu) {
        burger.addEventListener("click", () => {
            menu.classList.toggle("open");
        });
    }
})();

// highlight active page
(function () {
    const page = document.body.getAttribute("data-page");
    if (!page) return;
    document.querySelectorAll(".nav-link").forEach((link) => {
        if (link.dataset.page === page) {
            link.classList.add("active");
        }
    });
})();

// floating background cards for home
(function () {
    const container = document.querySelector(".floating-bg");
    if (!container) return;

    // you can add more images — just drop in assets/img/
    const images = [
        "assets/img/balloons.jpg",
        "assets/img/moon1.jpg",
        "assets/img/moon2.jpg",
        "assets/img/moon3.jpg",
        "assets/img/sky1.jpg",
        "assets/img/eclipse.jpg"
    ];

    const W = window.innerWidth;
    const H = window.innerHeight;

    for (let i = 0; i < 8; i++) {
        const card = document.createElement("div");
        card.className = "float-card";
        const x = Math.random() * (W - 200);
        const y = Math.random() * (H - 120) + 120;
        card.style.left = x + "px";
        card.style.top = y + "px";
        card.style.animationDelay = (Math.random() * 20).toFixed(2) + "s";

        // background image (if present)
        const img = document.createElement("img");
        img.src = images[i % images.length];
        img.alt = "ThirdDegreeBurn asset";
        img.style.width = "100%";
        img.style.height = "100%";
        img.style.objectFit = "cover";
        img.style.opacity = "0.7";
        card.appendChild(img);

        container.appendChild(card);
    }

    window.addEventListener("resize", () => {
        // not re-laying — for now keep it simple
    });
})();
