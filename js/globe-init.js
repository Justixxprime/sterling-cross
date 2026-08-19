/*
  Real 3D office globe, built with Globe.gl (a thin, friendly wrapper
  around Three.js + three-globe). This replaces the old CSS/div "fake
  3D" globe with an actual WebGL sphere you can drag, zoom, and click.

  How this file is organized:
  1. Office data - the 14 real-world coordinates for every office
  2. Build the globe - texture, atmosphere, arcs, pins
  3. Camera choreography - GSAP ScrollTrigger gently rotates the globe
     into view as the section scrolls in, instead of a plain fade
*/
(function () {
  const mount = document.getElementById('officeGlobe');
  if (!mount || typeof Globe === 'undefined') return;

  // ---- 1. Office data ----------------------------------------------
  const offices = [
    { name: 'Chicago (HQ)', lat: 41.8781, lng: -87.6298, url: 'locations.html#office-chicago' },
    { name: 'New York', lat: 40.7128, lng: -74.0060, url: 'locations.html#office-newyork' },
    { name: 'Washington DC', lat: 38.9072, lng: -77.0369, url: 'locations.html#office-dc' },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, url: 'locations.html#office-la' },
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333, url: 'locations.html#office-saopaulo' },
    { name: 'London', lat: 51.5074, lng: -0.1278, url: 'locations.html#office-london' },
    { name: 'Paris', lat: 48.8566, lng: 2.3522, url: 'locations.html#office-paris' },
    { name: 'Frankfurt', lat: 50.1109, lng: 8.6821, url: 'locations.html#office-frankfurt' },
    { name: 'Johannesburg', lat: -26.2041, lng: 28.0473, url: 'locations.html#office-johannesburg' },
    { name: 'Dubai', lat: 25.2048, lng: 55.2708, url: 'locations.html#office-dubai' },
    { name: 'Singapore', lat: 1.3521, lng: 103.8198, url: 'locations.html#office-singapore' },
    { name: 'Hong Kong', lat: 22.3193, lng: 114.1694, url: 'locations.html#office-hongkong' },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, url: 'locations.html#office-tokyo' },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093, url: 'locations.html#office-sydney' },
  ];
  const hq = offices[0];
  const arcs = offices.slice(1).map((o) => ({
    startLat: hq.lat, startLng: hq.lng, endLat: o.lat, endLng: o.lng,
  }));

  // ---- 2. Build the globe --------------------------------------------
  // .backgroundColor('rgba(0,0,0,0)') below only works if the WebGL
  // context itself was created with alpha support in the first place —
  // without rendererConfig here, Three.js still creates an opaque
  // context and a zero-alpha clear color just paints solid black
  // instead of showing the page through it. This is what actually
  // makes the space around the globe transparent.
  const world = Globe({ rendererConfig: { antialias: true, alpha: true } })(mount)
    .backgroundColor('rgba(0,0,0,0)')
    // real city-lights texture instead of the flat dark map — every
    // populated coastline and city glows a warm amber, which reads as
    // "a global firm, lit up around the world" and brings real color
    // into the globe while staying entirely inside the gold palette
    .globeImageUrl('https://unpkg.com/three-globe/example/img/earth-night.jpg')
    .bumpImageUrl('https://unpkg.com/three-globe/example/img/earth-topology.png')
    .showAtmosphere(true)
    .atmosphereColor('#B8873B')
    .atmosphereAltitude(0.22)
    .arcsData(arcs)
    .arcColor(() => ['rgba(228,177,93,0.95)', 'rgba(184,135,59,0)'])
    .arcDashLength(0.5)
    .arcDashGap(2)
    .arcDashInitialGap(() => Math.random() * 5)
    .arcDashAnimateTime(3200)
    .arcStroke(0.45)
    .arcAltitude(0.28)
    .htmlElementsData(offices)
    .htmlLat('lat')
    .htmlLng('lng')
    .htmlAltitude(0.02)
    .htmlElement((d) => {
      const a = document.createElement('a');
      a.href = d.url;
      a.className = 'globe-pin';
      a.style.pointerEvents = 'auto';
      a.setAttribute('aria-label', d.name + ' office');
      a.innerHTML = '<span class="globe-pin-hit"></span><span class="globe-pin-dot"></span><span class="globe-pin-tooltip">' + d.name + '</span>';
      return a;
    });

  // Resize to fit its container, and stay in sync if the container resizes
  function fit() {
    const w = mount.clientWidth, h = mount.clientHeight || w;
    world.width(w).height(h);
  }
  fit();
  window.addEventListener('resize', fit);

  // gentle auto-rotate, pauses while the visitor is dragging
  const controls = world.controls();
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.55;
  controls.enableZoom = false;
  controls.minDistance = 130;
  controls.maxDistance = 320;
  mount.addEventListener('mouseenter', () => { controls.autoRotate = false; });
  mount.addEventListener('mouseleave', () => { controls.autoRotate = true; });

  // start facing the Atlantic, roughly midway between HQ and Europe
  world.pointOfView({ lat: 22, lng: -25, altitude: 1.35 }, 0);

  // the drag-gesture hint plays itself out and fades on a timer via
  // CSS, but the moment someone actually touches/drags the globe,
  // dismiss it immediately rather than leaving it swiping away over
  // their real interaction
  const dragHint = document.getElementById('globeDragHint');
  if (dragHint) {
    const dismissHint = () => { dragHint.classList.add('is-dismissed'); };
    mount.addEventListener('mousedown', dismissHint, { once: true });
    mount.addEventListener('touchstart', dismissHint, { once: true, passive: true });
  }

  // fade out the loading ring once the globe has rendered a frame
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const loading = document.getElementById('globeLoading');
    if (loading) loading.classList.add('is-hidden');
  }));

  // ---- 3. Camera choreography with GSAP ScrollTrigger -----------------
  // A single, deliberate signature moment: as the globe scrolls into
  // view, the camera glides in from a wider, higher angle instead of
  // just appearing, then hands control back to the visitor.
  if (window.gsap && window.ScrollTrigger) {
    gsap.registerPlugin(ScrollTrigger);
    const stage = document.getElementById('globeStage');
    if (stage) {
      const state = { lat: 55, lng: -60, altitude: 2.2 };
      gsap.fromTo(state,
        { lat: 55, lng: -60, altitude: 2.2 },
        {
          lat: 22, lng: -25, altitude: 1.35,
          scrollTrigger: { trigger: stage, start: 'top 85%', end: 'top 40%', scrub: 1 },
          onUpdate: () => world.pointOfView({ lat: state.lat, lng: state.lng, altitude: state.altitude }, 0),
        }
      );
    }
  }
})();
