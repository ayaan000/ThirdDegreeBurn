// Solar System 3D Simulator
// Realistic orbital mechanics with Three.js

(function() {
  'use strict';

  const container = document.getElementById('solarSystemViewer');
  if (!container) return;

  let scene, camera, renderer, controls;
  let sun, planets = [];
  let timeSpeed = 20;
  let showOrbits = true;
  let showLabels = true;
  let orbits = [];
  let labels = [];

  // Planetary data (simplified but realistic ratios)
  const planetData = [
    { name: 'Mercury', radius: 0.38, distance: 5,   period: 88,   color: 0x8C7853, orbitSpeed: 0 },
    { name: 'Venus',   radius: 0.95, distance: 7,   period: 225,  color: 0xFFC649, orbitSpeed: 0 },
    { name: 'Earth',   radius: 1,    distance: 10,  period: 365,  color: 0x4A90E2, orbitSpeed: 0 },
    { name: 'Mars',    radius: 0.53, distance: 13,  period: 687,  color: 0xE27B58, orbitSpeed: 0 },
    { name: 'Jupiter', radius: 2.5,  distance: 20,  period: 4333, color: 0xC88B3A, orbitSpeed: 0 },
    { name: 'Saturn',  radius: 2.1,  distance: 27,  period: 10759,color: 0xFAD5A5, orbitSpeed: 0 },
    { name: 'Uranus',  radius: 1.4,  distance: 34,  period: 30687,color: 0x4FD0E0, orbitSpeed: 0 },
    { name: 'Neptune', radius: 1.4,  distance: 40,  period: 60190,color: 0x4166F5, orbitSpeed: 0 }
  ];

  // Calculate orbital speeds (radians per frame at 1x speed)
  planetData.forEach(p => {
    p.orbitSpeed = (2 * Math.PI) / (p.period * 2); // Scaled for visual appeal
  });

  function init() {
    // Scene
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);

    // Camera
    camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 50, 70);
    camera.lookAt(0, 0, 0);

    // Renderer
    renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);

    // Controls
    controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 15;
    controls.maxDistance = 150;

    // Lighting
    const ambient = new THREE.AmbientLight(0x222222);
    scene.add(ambient);

    const pointLight = new THREE.PointLight(0xffffff, 2, 200);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // Stars background
    createStars();

    // Sun
    const sunGeometry = new THREE.SphereGeometry(3, 32, 32);
    const sunMaterial = new THREE.MeshBasicMaterial({ 
      color: 0xFDB813,
      emissive: 0xFDB813,
      emissiveIntensity: 1
    });
    sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Add sun glow
    const glowGeometry = new THREE.SphereGeometry(3.5, 32, 32);
    const glowMaterial = new THREE.MeshBasicMaterial({
      color: 0xFFA500,
      transparent: true,
      opacity: 0.3
    });
    const glow = new THREE.Mesh(glowGeometry, glowMaterial);
    sun.add(glow);

    // Create planets and orbits
    planetData.forEach((data, index) => {
      createPlanet(data);
    });

    // Event listeners
    setupControls();

    // Resize handler
    window.addEventListener('resize', onWindowResize, false);

    // Start animation
    animate();
  }

  function createStars() {
    const starsGeometry = new THREE.BufferGeometry();
    const starsMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 0.3 });

    const starsVertices = [];
    for (let i = 0; i < 2000; i++) {
      const x = (Math.random() - 0.5) * 400;
      const y = (Math.random() - 0.5) * 400;
      const z = (Math.random() - 0.5) * 400;
      starsVertices.push(x, y, z);
    }

    starsGeometry.setAttribute('position', 
      new THREE.Float32BufferAttribute(starsVertices, 3)
    );

    const stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
  }

  function createPlanet(data) {
    // Planet mesh
    const geometry = new THREE.SphereGeometry(data.radius * 0.6, 24, 24);
    const material = new THREE.MeshPhongMaterial({ 
      color: data.color,
      shininess: 30
    });
    const planet = new THREE.Mesh(geometry, material);
    
    // Position planet
    planet.position.x = data.distance;
    planet.userData = {
      name: data.name,
      distance: data.distance,
      orbitSpeed: data.orbitSpeed,
      angle: Math.random() * Math.PI * 2 // Random starting position
    };

    scene.add(planet);
    planets.push(planet);

    // Create orbit path
    const orbitGeometry = new THREE.BufferGeometry();
    const orbitPoints = [];
    const segments = 128;
    for (let i = 0; i <= segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      orbitPoints.push(
        Math.cos(angle) * data.distance,
        0,
        Math.sin(angle) * data.distance
      );
    }
    orbitGeometry.setAttribute('position', 
      new THREE.Float32BufferAttribute(orbitPoints, 3)
    );

    const orbitMaterial = new THREE.LineBasicMaterial({ 
      color: 0x444444,
      transparent: true,
      opacity: 0.4
    });
    const orbit = new THREE.Line(orbitGeometry, orbitMaterial);
    orbit.visible = showOrbits;
    scene.add(orbit);
    orbits.push(orbit);

    // Create label (using CSS2DRenderer would be better, but keeping it simple)
    // We'll create a simple sprite-based label
    createLabel(data.name, planet);
  }

  function createLabel(text, planet) {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = 256;
    canvas.height = 64;
    
    context.fillStyle = 'rgba(0, 0, 0, 0.6)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    context.font = 'Bold 24px Arial';
    context.fillStyle = 'white';
    context.textAlign = 'center';
    context.fillText(text, 128, 40);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({ 
      map: texture,
      transparent: true,
      opacity: 0.9
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(4, 1, 1);
    sprite.position.y = 2;
    sprite.visible = showLabels;
    
    planet.add(sprite);
    labels.push(sprite);
  }

  function setupControls() {
    const speedSlider = document.getElementById('timeSpeed');
    const speedDisplay = document.getElementById('speedDisplay');
    const orbitsCheckbox = document.getElementById('showOrbits');
    const labelsCheckbox = document.getElementById('showLabels');
    const resetBtn = document.getElementById('resetCamera');

    if (speedSlider) {
      speedSlider.addEventListener('input', (e) => {
        timeSpeed = parseFloat(e.target.value);
        speedDisplay.textContent = timeSpeed + 'x';
      });
    }

    if (orbitsCheckbox) {
      orbitsCheckbox.addEventListener('change', (e) => {
        showOrbits = e.target.checked;
        orbits.forEach(orbit => orbit.visible = showOrbits);
      });
    }

    if (labelsCheckbox) {
      labelsCheckbox.addEventListener('change', (e) => {
        showLabels = e.target.checked;
        planets.forEach(planet => {
          if (planet.children[0]) {
            planet.children[0].visible = showLabels;
          }
        });
      });
    }

    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        camera.position.set(0, 50, 70);
        camera.lookAt(0, 0, 0);
        controls.reset();
      });
    }
  }

  function animate() {
    requestAnimationFrame(animate);

    // Rotate sun
    sun.rotation.y += 0.002;

    // Update planet positions
    planets.forEach(planet => {
      const data = planet.userData;
      data.angle += data.orbitSpeed * (timeSpeed / 60);
      
      planet.position.x = Math.cos(data.angle) * data.distance;
      planet.position.z = Math.sin(data.angle) * data.distance;
      
      // Rotate planet on its axis
      planet.rotation.y += 0.01;
    });

    controls.update();
    renderer.render(scene, camera);
  }

  function onWindowResize() {
    if (!container) return;
    camera.aspect = container.clientWidth / container.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(container.clientWidth, container.clientHeight);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
