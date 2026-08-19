(function () {
  const sidebar = document.getElementById('siteSidebar');
  const toggle = document.getElementById('sidebarMobileToggle');
  const backdrop = document.getElementById('sidebarBackdrop');
  if (!sidebar || !toggle || !backdrop) return;

  function close() {
    sidebar.classList.remove('open');
    backdrop.classList.remove('show');
    document.body.classList.remove('sidebar-drawer-open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.innerHTML = '<i class="fa-solid fa-bars"></i>';
  }
  function open() {
    sidebar.classList.add('open');
    backdrop.classList.add('show');
    document.body.classList.add('sidebar-drawer-open');
    toggle.setAttribute('aria-expanded', 'true');
    toggle.innerHTML = '<i class="fa-solid fa-xmark"></i>';
  }
  toggle.addEventListener('click', () => {
    sidebar.classList.contains('open') ? close() : open();
  });
  backdrop.addEventListener('click', close);
  sidebar.querySelectorAll('a').forEach((a) => a.addEventListener('click', close));
  window.addEventListener('resize', () => { if (window.innerWidth >= 1024) close(); });

  // Resources group inside the sidebar itself (so mobile users, who
  // never see the desktop-only top-bar dropdown, can still reach
  // Blog, FAQ, Careers, and the rest of that list)
  const sbResBtn = document.getElementById('sidebarResourcesBtn');
  const sbResPanel = document.getElementById('sidebarResourcesPanel');
  if (sbResBtn && sbResPanel) {
    sbResBtn.addEventListener('click', () => {
      const isOpen = sbResPanel.classList.toggle('is-open');
      sbResBtn.classList.toggle('is-open', isOpen);
      sbResBtn.setAttribute('aria-expanded', String(isOpen));
    });
  }

  // Resources dropdown in the top utility row: hover-open on desktop
  // (devices with real hover), click-to-toggle as a fallback on touch
  const resDropdown = document.querySelector('.tur-dropdown');
  const resBtn = document.getElementById('turResourcesBtn');
  const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (resDropdown && resBtn) {
    let closeTimer = null;
    const openPanel = () => {
      clearTimeout(closeTimer);
      resDropdown.classList.add('open');
      resBtn.setAttribute('aria-expanded', 'true');
    };
    const closePanel = () => {
      resDropdown.classList.remove('open');
      resBtn.setAttribute('aria-expanded', 'false');
    };
    if (hasHover) {
      resDropdown.addEventListener('mouseenter', openPanel);
      resDropdown.addEventListener('mouseleave', () => {
        closeTimer = setTimeout(closePanel, 180);
      });
    }
    resBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      resDropdown.classList.contains('open') ? closePanel() : openPanel();
    });
    document.addEventListener('click', (e) => {
      if (!resDropdown.contains(e.target)) closePanel();
    });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closePanel(); });
  }

  // Top utility row: transparent floating over the hero image on
  // pages that have one, solidifying into the dark glass bar once
  // the visitor scrolls past it, then staying stuck at the top.
  // Pages without a hero keep the bar solid from the start, but still
  // pick up a bit more shadow/lift on scroll so the header doesn't
  // feel static compared to the hero pages.
  const topRow = document.getElementById('topUtilityRow');
  const hero = document.querySelector('.hero-cinematic, .page-hero-photo');
  if (topRow) {
    if (hero) topRow.classList.add('tur-overlay-mode');
    const onScroll = () => {
      topRow.classList.toggle('scrolled', window.scrollY > 40);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }
})();
