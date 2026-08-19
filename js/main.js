document.addEventListener('DOMContentLoaded', () => {

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isFinePointer = window.matchMedia('(pointer: fine)').matches;

  // cinematic letter-split reveal: any element with class
  // .split-reveal gets its text broken into individual character
  // spans, each flipping up out of a 3D well with a stagger, once
  // scrolled into view. A different mechanism from the block-level
  // .reveal fade used elsewhere, reserved for headline moments.
  document.querySelectorAll('.split-reveal').forEach(el => {
    const words = el.textContent.split(/(\s+)/);
    el.textContent = '';
    let charIndex = 0;
    words.forEach(word => {
      if (word.trim() === '') { el.appendChild(document.createTextNode(word)); return; }
      const wordSpan = document.createElement('span');
      wordSpan.style.display = 'inline-block';
      [...word].forEach(ch => {
        const span = document.createElement('span');
        span.className = 'split-char';
        span.textContent = ch;
        span.style.transitionDelay = (charIndex * 0.028) + 's';
        wordSpan.appendChild(span);
        charIndex++;
      });
      el.appendChild(wordSpan);
    });
    if (prefersReducedMotion) {
      el.querySelectorAll('.split-char').forEach(c => c.classList.add('in'));
    } else {
      const splitIO = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.querySelectorAll('.split-char').forEach(c => c.classList.add('in'));
          splitIO.unobserve(entry.target);
        });
      }, { threshold: 0.3 });
      splitIO.observe(el);
    }
  });

  // persistent film grain over the whole site, injected once so it
  // does not need to be hand-placed on every page
  if (!document.getElementById('siteGrain')) {
    const grain = document.createElement('div');
    grain.id = 'siteGrain';
    document.body.appendChild(grain);
  }

  // cinema letterbox bars on the homepage hero, easing open once
  // the page has settled in, like a film reel starting to roll
  const letterboxHero = document.querySelector('.hero-cinematic');
  if (letterboxHero && !prefersReducedMotion) {
    const topBar = document.createElement('div'); topBar.className = 'letterbox-bar top';
    const bottomBar = document.createElement('div'); bottomBar.className = 'letterbox-bar bottom';
    letterboxHero.append(topBar, bottomBar);
    setTimeout(() => letterboxHero.classList.add('letterbox-open'), 500);
  }

  // liquid nav indicator, a single glowing pill that glides beneath
  // whichever item is hovered, and rests under the active page link
  // when the mouse isn't over the nav at all
  const navLiquid = document.getElementById('navLiquid');
  const navList = navLiquid?.parentElement;
  if (navLiquid && navList && isFinePointer) {
    const moveLiquidTo = (el) => {
      if (!el) { navLiquid.classList.remove('is-visible'); return; }
      const listRect = navList.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      navLiquid.style.left = (elRect.left - listRect.left) + 'px';
      navLiquid.style.width = elRect.width + 'px';
      navLiquid.classList.add('is-visible');
    };
    const restToActive = () => {
      const activeEl = navList.querySelector('.nav-link.active, .nav-dropdown-toggle.active');
      moveLiquidTo(activeEl ? activeEl.closest('li') || activeEl : null);
    };
    navList.querySelectorAll(':scope > li').forEach(li => {
      li.addEventListener('mouseenter', () => moveLiquidTo(li));
    });
    navList.addEventListener('mouseleave', restToActive);
    setTimeout(restToActive, 900); // wait out the entrance animation before resting
    window.addEventListener('resize', restToActive);
  }

  // highlight the current page everywhere it is linked: the top
  // nav, the mobile menu, and the footer, all driven off the
  // data-page attribute set on <body> and matched against links
  const currentPage = document.body.dataset.page;
  if (currentPage) {
    document.querySelectorAll(`[data-page="${currentPage}"]`).forEach(el => {
      if (el !== document.body) el.classList.add('active');
    });
    // if the current page lives inside the Resources dropdown, light
    // up the Resources trigger button itself too, not just the link
    // buried inside the panel. Covers both the desktop top-bar
    // dropdown and the sidebar's own Resources group.
    const resPanel = document.getElementById('turResourcesPanel');
    const resBtn = document.getElementById('turResourcesBtn');
    if (resPanel && resBtn && resPanel.querySelector('.active')) {
      resBtn.classList.add('active');
    }
    const sbResPanel = document.getElementById('sidebarResourcesPanel');
    const sbResBtn = document.getElementById('sidebarResourcesBtn');
    if (sbResPanel && sbResBtn && sbResPanel.querySelector('.active')) {
      sbResBtn.classList.add('active');
      sbResPanel.classList.add('is-open');
      sbResBtn.classList.add('is-open');
      sbResBtn.setAttribute('aria-expanded', 'true');
    }
  }

  // Every nav dropdown (Practice Areas, Industries, Resources), CSS
  // handles mouse hover, this adds a click toggle for touch devices
  // and keyboard users where hover is not reliable. Generalized so
  // any element with class nav-dropdown-toggle works the same way.
  document.querySelectorAll('.nav-dropdown-toggle').forEach(btn => {
    const dropdown = btn.closest('.nav-dropdown');
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !dropdown.classList.contains('force-open');
      document.querySelectorAll('.nav-dropdown').forEach(d => d.classList.remove('force-open'));
      if (willOpen) dropdown.classList.add('force-open');
    });
  });
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.nav-dropdown').forEach(d => {
      if (!d.contains(e.target)) d.classList.remove('force-open');
    });
  });

  // cinematic parallax, hero photo drifts slower than the page scrolls
  if (isFinePointer && !prefersReducedMotion) {
    const parallaxLayers = document.querySelectorAll('.parallax-layer');
    if (parallaxLayers.length) {
      window.addEventListener('scroll', () => {
        const y = window.scrollY;
        parallaxLayers.forEach((layer, i) => {
          layer.style.transform = `translateY(${y * (0.08 + i * 0.03)}px)`;
        });
      });
    }
  }

  // site search, filters the SEARCH_INDEX (from search-index.js)
  // against the query, supports arrow key navigation and enter to go
  const searchTrigger = document.getElementById('searchTrigger');
  const searchOverlay = document.getElementById('searchOverlay');
  if (searchTrigger && searchOverlay && typeof SEARCH_INDEX !== 'undefined') {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    const searchCloseBtn = document.getElementById('searchCloseBtn');
    let activeIndex = -1;

    const renderResults = (query) => {
      const q = query.trim().toLowerCase();
      let matches;
      if (!q) {
        matches = SEARCH_INDEX.slice(0, 8);
      } else {
        matches = SEARCH_INDEX.filter(item => {
          const haystack = (item.title + ' ' + item.category + ' ' + (item.keywords || '')).toLowerCase();
          return haystack.includes(q);
        }).slice(0, 10);
      }
      activeIndex = -1;
      if (!matches.length) {
        searchResults.innerHTML = '<div id="searchEmpty">No results, try a different practice, attorney, or office name.</div>';
        return;
      }
      searchResults.innerHTML = matches.map((item, i) => `
        <a href="${item.url}" class="search-result" data-index="${i}">
          <span class="search-result-icon"><i class="fa-solid ${item.icon}"></i></span>
          <span><span class="search-result-title">${item.title}</span><br><span class="search-result-cat">${item.category}</span></span>
        </a>
      `).join('');
    };

    const openSearch = () => {
      searchOverlay.classList.add('open');
      renderResults('');
      setTimeout(() => searchInput?.focus(), 50);
      document.documentElement.style.overflow = 'hidden';
    };
    const closeSearch = () => {
      searchOverlay.classList.remove('open');
      if (searchInput) searchInput.value = '';
      document.documentElement.style.overflow = '';
    };

    searchTrigger.addEventListener('click', openSearch);
    searchCloseBtn?.addEventListener('click', closeSearch);
    searchOverlay.addEventListener('click', (e) => { if (e.target === searchOverlay) closeSearch(); });
    searchInput?.addEventListener('input', (e) => renderResults(e.target.value));
    document.querySelectorAll('#searchQuickChips button').forEach(chip => {
      chip.addEventListener('click', () => {
        if (searchInput) { searchInput.value = chip.dataset.query; searchInput.focus(); }
        renderResults(chip.dataset.query);
      });
    });

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openSearch(); return; }
      if (!searchOverlay.classList.contains('open')) return;
      const items = Array.from(searchResults.querySelectorAll('.search-result'));
      if (e.key === 'Escape') { closeSearch(); }
      else if (e.key === 'ArrowDown') { e.preventDefault(); activeIndex = Math.min(activeIndex + 1, items.length - 1); items.forEach((el, i) => el.classList.toggle('is-active', i === activeIndex)); items[activeIndex]?.scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); activeIndex = Math.max(activeIndex - 1, 0); items.forEach((el, i) => el.classList.toggle('is-active', i === activeIndex)); items[activeIndex]?.scrollIntoView({ block: 'nearest' }); }
      else if (e.key === 'Enter' && activeIndex >= 0 && items[activeIndex]) { items[activeIndex].click(); }
    });
  }

  // the page-transition curtain doubles as the loading screen: it
  // starts already covering the page (set in the HTML via the
  // pt-initial class, no flash), then wipes away once ready. This
  // is the ONLY loading surface on the site, so there is never a
  // second navy screen stacked underneath it.
  //
  // "ready" means: the window load event has fired (all eager
  // images, scripts, and stylesheets are in) AND any custom fonts
  // have finished loading (so there's no visible font-swap jump
  // right after the curtain lifts). Both are wrapped in a generous
  // fallback timer — not to race against them, but purely so a
  // single broken/stalled resource can never leave the curtain
  // stuck up forever; in normal conditions the real-ready check
  // should always win first.
  const pageTransitionEl = document.getElementById('pageTransition');
  if (pageTransitionEl) {
    const reveal = () => {
      if (!pageTransitionEl.classList.contains('pt-initial')) return;
      pageTransitionEl.classList.remove('pt-initial');
      pageTransitionEl.classList.add('pt-reveal');
      setTimeout(() => pageTransitionEl.classList.remove('pt-reveal'), 850);
    };
    const windowLoaded = new Promise((resolve) => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', resolve, { once: true });
    });
    const fontsReady = (document.fonts && document.fonts.ready) ? document.fonts.ready : Promise.resolve();
    Promise.all([windowLoaded, fontsReady]).then(() => setTimeout(reveal, 300));
    setTimeout(reveal, 3200);
  }

  // scroll progress bar across the very top of the page
  const progressBar = document.getElementById('scrollProgress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
      progressBar.style.width = scrolled + '%';
    });
  }

  // ambient cursor glow, desktop only, respects reduced motion
  const glow = document.getElementById('cursorGlow');
  if (glow) {
    if (!prefersReducedMotion && isFinePointer) {
      window.addEventListener('mousemove', (e) => {
        glow.style.transform = `translate(${e.clientX}px, ${e.clientY}px) translate(-50%,-50%)`;
      });
    } else {
      glow.style.display = 'none';
    }
  }

  // floating call button, appears after scrolling
  const callFab = document.getElementById('callFab');
  if (callFab) {
    window.addEventListener('scroll', () => callFab.classList.toggle('show', window.scrollY > 500));
  }

  // open or closed indicator in the top bar, based on the visitor's own clock
  // Monday to Friday, 9am to 6pm counts as open, everything else closed
  const openIndicator = document.getElementById('openIndicator');
  if (openIndicator) {
    const now = new Date();
    const day = now.getDay(); // 0 Sunday, 6 Saturday
    const hour = now.getHours();
    const isOpen = day >= 1 && day <= 5 && hour >= 9 && hour < 18;
    openIndicator.classList.toggle('closed', !isOpen);
    const label = openIndicator.querySelector('.open-label');
    if (label) label.textContent = isOpen ? 'Open Now' : 'Currently Closed';
  }

  // footer year
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // mobile menu, a side drawer with a dark backdrop you can tap to close
  const menuBtn = document.getElementById('menuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const mobileMenuOverlay = document.getElementById('mobileMenuOverlay');
  const menuCloseBtn = document.getElementById('menuCloseBtn');
  const menuIconOpen = document.getElementById('menuIconOpen');
  const menuIconClose = document.getElementById('menuIconClose');
  function openMenu() {
    mobileMenu.classList.add('open');
    if (mobileMenuOverlay) mobileMenuOverlay.classList.add('open');
    if (menuIconOpen) menuIconOpen.classList.add('hidden');
    if (menuIconClose) menuIconClose.classList.remove('hidden');
    document.documentElement.style.overflow = 'hidden';
  }
  function closeMenu() {
    mobileMenu.classList.remove('open');
    if (mobileMenuOverlay) mobileMenuOverlay.classList.remove('open');
    if (menuIconOpen) menuIconOpen.classList.remove('hidden');
    if (menuIconClose) menuIconClose.classList.add('hidden');
    document.documentElement.style.overflow = '';
  }
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => mobileMenu.classList.contains('open') ? closeMenu() : openMenu());
    if (menuCloseBtn) menuCloseBtn.addEventListener('click', closeMenu);
    if (mobileMenuOverlay) mobileMenuOverlay.addEventListener('click', closeMenu);
    mobileMenu.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
  }

  // nav lock: adds a firmer "locked" look once scrolled past the hero,
  // and hides the bar on scroll-down / reveals it on scroll-up, like a
  // premium app chrome rather than a bar that just sits there
  const nav = document.getElementById('siteNav');
  if (nav) {
    let lastY = window.scrollY;
    const lockAt = 90;
    const onScroll = () => {
      const y = window.scrollY;
      nav.classList.toggle('nav-locked', y > lockAt);
      if (y > lockAt && y > lastY + 4) {
        nav.classList.add('nav-hidden');
      } else if (y < lastY - 4 || y <= lockAt) {
        nav.classList.remove('nav-hidden');
      }
      lastY = y;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // active page highlighting, works across desktop nav, the dropdown,
  // nav CTA buttons, mobile menu, and footer
  const here = document.body.dataset.page;
  if (here) {
    document.querySelectorAll('.nav-link, .nav-cta, .nav-dropdown-item, .mm-link, .footer-link').forEach(l => {
      if (l.dataset.page === here) l.classList.add('active');
    });
    // if the active page lives inside the Resources dropdown, highlight
    // the Resources button itself too, so the section stays legible
    const dropdownPages = ['testimonials', 'blog', 'faq', 'locations', 'careers', 'make-payment'];
    if (dropdownPages.includes(here)) {
      document.getElementById('resourcesBtn')?.classList.add('active');
    }
  }

  // scroll reveal, with a safety net so content can never stay stuck invisible
  const revealEls = document.querySelectorAll('.reveal');
  if (revealEls.length) {
    function revealAll() { revealEls.forEach(el => el.classList.add('in')); }
    if ('IntersectionObserver' in window) {
      const io = new IntersectionObserver((entries) => {
        entries.forEach((e, i) => { if (e.isIntersecting) { setTimeout(() => e.target.classList.add('in'), i * 40); io.unobserve(e.target); } });
      }, { threshold: 0.15 });
      revealEls.forEach(el => io.observe(el));
    } else { revealAll(); }
    setTimeout(revealAll, 2500);
  }

  // animated counters synced with a ring
  const counters = document.querySelectorAll('.counter');
  if (counters.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.count, 10);
        const suffix = el.dataset.suffix || '';
        const ringFill = el.closest('.stat-ring')?.querySelector('.stat-ring-fill');
        const ringMax = ringFill ? parseFloat(ringFill.dataset.circumference) : null;
        let cur = 0;
        const step = Math.max(1, Math.round(target / 40));
        const tick = () => {
          cur += step;
          if (cur >= target) { el.textContent = target + suffix; if (ringFill) ringFill.style.strokeDashoffset = '0'; return; }
          el.textContent = cur + suffix;
          if (ringFill && ringMax) ringFill.style.strokeDashoffset = String(ringMax * (1 - cur / target));
          requestAnimationFrame(tick);
        };
        tick();
        io.unobserve(el);
      });
    }, { threshold: 0.5 });
    counters.forEach(el => io.observe(el));
  }

  // Flat world map (locations.html): clicking a pin scrolls to and
  // highlights the matching office card; hovering a card pins the
  // matching label open on the map
  document.querySelectorAll('.map-pin-group').forEach((pin) => {
    const key = pin.dataset.office;
    const card = key ? document.querySelector(`.office-card[data-office="${key}"]`) : null;
    pin.addEventListener('click', () => {
      if (!card) return;
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('active-office');
      setTimeout(() => card.classList.remove('active-office'), 1800);
    });
  });
  document.querySelectorAll('.office-card').forEach((card) => {
    const key = card.dataset.office;
    const pin = key ? document.querySelector(`.map-pin-group[data-office="${key}"]`) : null;
    if (!pin) return;
    card.addEventListener('mouseenter', () => pin.classList.add('pinned'));
    card.addEventListener('mouseleave', () => pin.classList.remove('pinned'));
  });

  // Proven Track Record cards: click any card to make it the navy
  // 'active' one (with its description revealing), deactivating
  // whichever card held that state before
  const trackCards = document.querySelectorAll('[data-track-card]');
  if (trackCards.length) {
    trackCards.forEach(card => {
      card.addEventListener('click', () => {
        if (card.classList.contains('track-record-dark')) return;
        trackCards.forEach(c => c.classList.remove('track-record-dark'));
        card.classList.add('track-record-dark');
      });
    });
  }

  // magnetic buttons
  if (isFinePointer && !prefersReducedMotion) {
    document.querySelectorAll('.btn-magnetic').forEach(btn => {
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const x = (e.clientX - r.left - r.width / 2) * 0.25;
        const y = (e.clientY - r.top - r.height / 2) * 0.25;
        btn.style.transform = `translate(${x}px, ${y}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });
  }

  // tilt and spotlight for cards, a slightly deeper 3D feel with a
  // shadow that shifts opposite the tilt for a real sense of depth
  if (isFinePointer && !prefersReducedMotion) {
    document.querySelectorAll('.tilt-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${py * -7}deg) rotateY(${px * 7}deg) translateY(-6px) scale(1.015)`;
        card.style.boxShadow = `${px * -18}px ${py * -18 + 22}px 44px -20px rgba(22,20,16,0.28)`;
        card.style.setProperty('--x', `${e.clientX - r.left}px`);
        card.style.setProperty('--y', `${e.clientY - r.top}px`);
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; card.style.boxShadow = ''; });
    });
  }

  // hero depth parallax, the cinematic slideshow drifts a few px
  // opposite the cursor while the text content drifts gently with
  // it, two independent depth layers for a subtle "4D" feel
  const heroCinematic = document.querySelector('.hero-cinematic');
  if (heroCinematic && isFinePointer && !prefersReducedMotion) {
    const heroLayer = heroCinematic.querySelector('.parallax-layer');
    const heroContent = heroCinematic.querySelector('.relative.z-10');
    heroCinematic.addEventListener('mousemove', (e) => {
      const r = heroCinematic.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      if (heroLayer) heroLayer.style.transform = `translate(${px * -14}px, ${py * -10}px) scale(1.03)`;
      if (heroContent) heroContent.style.transform = `translate(${px * 8}px, ${py * 6}px)`;
    });
    heroCinematic.addEventListener('mouseleave', () => {
      if (heroLayer) heroLayer.style.transform = '';
      if (heroContent) heroContent.style.transform = '';
    });
  }

  // back to top button
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', () => backToTop.classList.toggle('show', window.scrollY > 700));
    backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  // FAQ accordion, one open at a time
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-question')?.addEventListener('click', () => {
      const wasOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // testimonial carousel
  const testiTrack = document.getElementById('testiTrack');
  const testiDots = document.querySelectorAll('.testi-dot');
  if (testiTrack && testiDots.length) {
    let idx = 0;
    const goTo = (i) => {
      idx = (i + testiDots.length) % testiDots.length;
      testiTrack.style.transform = `translateX(-${idx * 100}%)`;
      testiDots.forEach((d, di) => d.classList.toggle('bg-gold', di === idx));
      testiDots.forEach((d, di) => d.classList.toggle('bg-ink/15', di !== idx));
    };
    testiDots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
    setInterval(() => goTo(idx + 1), 5500);
    goTo(0);
  }

  // ---- multi step consultation booking, now includes the full intake
  // questionnaire and a final confirm & submit step ----------
  // ---- date of birth, three plain <select> dropdowns (month/day/year).
  // Simpler and more reliable than a calendar-grid widget for a
  // birthdate specifically, no JS population needed, options are
  // static in the HTML, and it's the standard pattern for this kind
  // of field since nobody wants to click "previous month" 400 times
  // to get back to 1990. ----
  const dobMonth = document.querySelector('[data-dob-month]');
  const dobDay = document.querySelector('[data-dob-day]');
  const dobYear = document.querySelector('[data-dob-year]');
  if (dobMonth && dobDay && dobYear) {
    function clampDobDay() {
      const month = parseInt(dobMonth.value, 10);
      const year = parseInt(dobYear.value, 10) || 2000;
      const daysInMonth = month ? new Date(year, month, 0).getDate() : 31;
      Array.from(dobDay.options).forEach(opt => {
        if (!opt.value) return;
        opt.hidden = parseInt(opt.value, 10) > daysInMonth;
      });
      if (parseInt(dobDay.value, 10) > daysInMonth) dobDay.value = '';
    }
    dobMonth.addEventListener('change', clampDobDay);
    dobYear.addEventListener('change', clampDobDay);
  }


  const appForm = document.getElementById('applicationForm');

  // Cosmetic input formatting for the payment-step card preview.
  // These fields have no "name" attribute and are never read by the
  // submit handler below, this is visual formatting only so the demo
  // feels real to a client walkthrough, no card data is stored, read,
  // or sent anywhere by this code.
  const cardNumberInput = document.querySelector('[data-card-number]');
  const cardBrandIcons = document.querySelectorAll('[data-card-brand-icons] [data-brand]');
  function detectCardBrand(digits) {
    if (/^4/.test(digits)) return 'visa';
    if (/^(5[1-5]|2[2-7])/.test(digits)) return 'mastercard';
    if (/^3[47]/.test(digits)) return 'amex';
    if (/^6(011|5)/.test(digits)) return 'discover';
    if (/^3(0[0-5]|[68])/.test(digits)) return 'diners';
    return null;
  }
  if (cardNumberInput) {
    cardNumberInput.addEventListener('input', () => {
      const digits = cardNumberInput.value.replace(/\D/g, '').slice(0, 16);
      cardNumberInput.value = digits.replace(/(.{4})/g, '$1 ').trim();
      const brand = detectCardBrand(digits);
      cardBrandIcons.forEach(icon => {
        const isMatch = icon.dataset.brand === brand;
        const noBrandYet = !brand;
        icon.style.opacity = noBrandYet ? '0.3' : (isMatch ? '1' : '0');
        icon.style.display = noBrandYet || isMatch ? '' : 'none';
      });
    });
  }
  const cardExpiryInput = document.querySelector('[data-card-expiry]');
  if (cardExpiryInput) {
    cardExpiryInput.addEventListener('input', () => {
      let digits = cardExpiryInput.value.replace(/\D/g, '').slice(0, 4);
      if (digits.length > 2) digits = digits.slice(0, 2) + ' / ' + digits.slice(2);
      cardExpiryInput.value = digits;
    });
  }
  const cardCvcInput = document.querySelector('[data-card-cvc]');
  if (cardCvcInput) {
    cardCvcInput.addEventListener('input', () => {
      cardCvcInput.value = cardCvcInput.value.replace(/\D/g, '').slice(0, 4);
    });
  }
  if (appForm) {
    // Photo upload dropzones: flip Pending -> Uploaded and show the filename
    appForm.querySelectorAll('.upload-input-hidden').forEach((input) => {
      input.addEventListener('change', () => {
        const card = input.closest('.upload-card');
        const pill = card.querySelector('.upload-status-pill');
        const label = card.querySelector('.upload-dropzone-label');
        const dropzoneOriginalLabel = label.dataset.originalLabel || (label.dataset.originalLabel = label.textContent);
        if (input.files && input.files[0]) {
          const file = input.files[0];
          if (file.size > 10 * 1024 * 1024) {
            pill.textContent = 'Too Large';
            pill.dataset.status = 'pending';
            card.classList.remove('has-file');
            input.value = '';
            label.textContent = dropzoneOriginalLabel;
            return;
          }
          pill.textContent = 'Uploaded';
          pill.dataset.status = 'uploaded';
          card.classList.add('has-file');
          label.textContent = file.name.length > 18 ? file.name.slice(0, 15) + '…' : file.name;
        } else {
          pill.textContent = 'Pending';
          pill.dataset.status = 'pending';
          card.classList.remove('has-file');
          label.textContent = dropzoneOriginalLabel;
        }
      });
    });

    const stepNames = ['plan', 'details', 'matter', 'background', 'references', 'additional', 'confirm', 'payment'];
    let current = 0;
    const dots = stepNames.map(s => document.getElementById(`dot-${s}`));
    const lines = document.querySelectorAll('.step-line');
    const panels = stepNames.map(s => document.getElementById(`panel-${s}`));
    const successPanel = document.getElementById('panel-success');

    function render() {
      panels.forEach((p, i) => p.classList.toggle('active', i === current));
      dots.forEach((d, i) => {
        d.classList.remove('active', 'done');
        if (i === current) d.classList.add('active');
        else if (i < current) d.classList.add('done');
      });
      lines.forEach((l, i) => l.classList.toggle('done', i < current));
    }
    render();

    document.querySelectorAll('[data-blocks-next]').forEach(blocker => {
      const warningEl = document.getElementById(blocker.dataset.warningTarget);
      blocker.addEventListener('change', () => {
        if (!blocker.checked) warningEl?.classList.add('hidden');
      });
    });

    // as soon as a field that was flagged invalid gets fixed, clear its
    // error state immediately rather than making someone hit Next again
    appForm.querySelectorAll('[required]').forEach(field => {
      if (field.type === 'radio') {
        field.addEventListener('change', () => {
          if (field.checked) field.closest('.flex')?.classList.remove('field-invalid-group');
        });
        return;
      }
      const evt = field.type === 'checkbox' ? 'change' : 'input';
      const visibleTarget = field;
      field.addEventListener(evt, () => {
        const isValid = field.type === 'checkbox' ? field.checked : field.value.trim();
        if (isValid) visibleTarget?.classList.remove('field-invalid');
      });
    });

    document.querySelectorAll('[data-next]').forEach(btn => {
      btn.addEventListener('click', () => {
        const activePanel = panels[current];
        const required = activePanel.querySelectorAll('[required]');
        let firstInvalid = null;
        const seenRadioGroups = new Set();
        for (const field of required) {
          // radio buttons work like checkboxes but as a group: every radio
          // in a required group shares the same .value truthiness, so they
          // have to be validated once per group name (is ANY of them
          // checked), not once per individual radio input
          if (field.type === 'radio') {
            if (seenRadioGroups.has(field.name)) continue;
            seenRadioGroups.add(field.name);
            const group = activePanel.querySelectorAll(`input[type="radio"][name="${field.name}"]`);
            const isEmpty = ![...group].some(r => r.checked);
            const wrap = field.closest('.flex') || field.closest('div');
            wrap?.classList.toggle('field-invalid-group', isEmpty);
            if (isEmpty && !firstInvalid) firstInvalid = field;
            continue;
          }
          // checkboxes report a truthy .value ("on") even when unchecked,
          // so they need their own check, everything else (text, select,
          // textarea) is validated by whether it has a non-empty value
          const isEmpty = field.type === 'checkbox' ? !field.checked : !field.value.trim();
          const visibleTarget = field;
          visibleTarget?.classList.toggle('field-invalid', isEmpty);
          if (isEmpty && !firstInvalid) firstInvalid = visibleTarget || field;
        }
        if (firstInvalid) {
          firstInvalid.focus();
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          let msg = activePanel.querySelector('.step-validation-msg');
          if (!msg) {
            msg = document.createElement('p');
            msg.className = 'step-validation-msg';
            activePanel.appendChild(msg);
          }
          msg.textContent = 'Please complete every required field before continuing.';
          return;
        } else {
          activePanel.querySelector('.step-validation-msg')?.remove();
        }
        // some checkboxes (like a conflict-of-interest flag) should
        // stop the form here rather than let someone continue as if
        // nothing came up, shows a warning instead of advancing
        const blockers = activePanel.querySelectorAll('[data-blocks-next]');
        for (const blocker of blockers) {
          const warningEl = document.getElementById(blocker.dataset.warningTarget);
          if (blocker.checked) {
            warningEl?.classList.remove('hidden');
            warningEl?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
          } else {
            warningEl?.classList.add('hidden');
          }
        }
        if (current < stepNames.length - 1) {
          current++;
          // filling the review summary happens the moment we arrive at
          // the confirm step, not on the last step, since payment now
          // comes after confirm
          if (stepNames[current] === 'confirm') {
            const summaryFields = ['fullName', 'email', 'phone', 'matterType', 'matterDetails'];
            summaryFields.forEach(id => {
              const input = document.getElementById(id);
              const target = document.getElementById(`summary-${id}`);
              if (input && target) target.textContent = input.value || 'Not provided';
            });
            const planRadio = appForm.querySelector('input[name="selected_plan"]:checked');
            const planTarget = document.getElementById('summary-selectedPlan');
            if (planTarget) planTarget.textContent = planRadio ? planRadio.value : 'Not selected';
          }
          if (stepNames[current] === 'payment') {
            const planRadio = appForm.querySelector('input[name="selected_plan"]:checked');
            const priceMatch = planRadio && planRadio.value.match(/\$[\d.]+(\/mo| one-time)?/);
            const amountEl = document.getElementById('paymentAmountDisplay');
            const labelEl = document.getElementById('paymentAmountLabel');
            if (amountEl && priceMatch) {
              const isOneTime = /one-time/.test(planRadio.value);
              amountEl.textContent = priceMatch[0].replace('/mo', '').replace(' one-time', '') + '.00';
              if (labelEl) labelEl.textContent = isOneTime ? 'One-Time Guidance Fee (USD)' : 'First Payment Due Today (USD)';
            }
          }
          render();
        }
      });
    });
    document.querySelectorAll('[data-back]').forEach(btn => {
      btn.addEventListener('click', () => { if (current > 0) { current--; render(); } });
    });

    appForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const statusBox = document.getElementById('applicationStatus');
      if (!appForm.action || appForm.action.includes('YOUR_BASIN_FORM_ID')) {
        statusBox.textContent = 'This form needs a free Basin form endpoint before it can send. Create one at usebasin.com and paste it into the form action.';
        statusBox.className = 'mt-4 text-sm font-bold text-red-600';
        return;
      }
      const submitBtn = appForm.querySelector('[type="submit"]');
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Processing…'; }
      try {
        const res = await fetch(appForm.action, {
          method: 'POST',
          // Do NOT set Content-Type here: the browser needs to add its own
          // multipart/form-data boundary. Sending FormData directly (instead
          // of JSON.stringify-ing it) is what lets the uploaded files above
          // actually reach the form backend instead of being silently dropped.
          headers: { Accept: 'application/json' },
          body: new FormData(appForm),
        });
        if (res.ok) {
          // hide every step panel and show the success panel instead,
          // no payment is charged here, the actual value of this step
          // is that the full questionnaire (including any uploaded photos)
          // has just been sent to our team
          panels.forEach(p => p.classList.remove('active'));
          document.getElementById('stepIndicator')?.classList.add('hidden');
          if (successPanel) successPanel.classList.add('active');
          fireConfetti();
        } else {
          statusBox.textContent = 'Something went wrong sending that. Please email us directly instead.';
          statusBox.className = 'mt-4 text-sm font-bold text-red-600';
          if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Make Payment'; }
        }
      } catch (err) {
        statusBox.textContent = "Could not reach the server. Please email us directly instead.";
        statusBox.className = 'mt-4 text-sm font-bold text-red-600';
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Make Payment'; }
      }
    });
  }

  // confetti burst, used on the consultation success panel
  function fireConfetti() {
    if (prefersReducedMotion) return;
    const canvas = document.createElement('canvas');
    canvas.style.cssText = 'position:fixed;inset:0;z-index:999;pointer-events:none;';
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const colors = ['#B8873B', '#1F4A3A', '#F8F5EF'];
    const pieces = Array.from({ length: 120 }, () => ({
      x: canvas.width / 2, y: canvas.height / 3,
      vx: (Math.random() - 0.5) * 14, vy: Math.random() * -10 - 4,
      size: Math.random() * 6 + 4, color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360, spin: (Math.random() - 0.5) * 12, gravity: 0.35,
    }));
    let frame = 0;
    function draw() {
      frame++;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.vy += p.gravity; p.x += p.vx; p.y += p.vy; p.rotation += p.spin;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color; ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
        ctx.restore();
      });
      if (frame < 130) requestAnimationFrame(draw); else canvas.remove();
    }
    draw();
  }

  // ---- standalone Make a Payment request form (existing clients) ----------
  const paymentForm = document.getElementById('paymentRequestForm');
  if (paymentForm) {
    paymentForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const accessKey = paymentForm.querySelector('[name="access_key"]').value;
      const statusBox = document.getElementById('paymentRequestStatus');
      const submitBtn = document.getElementById('paymentSubmitBtn');
      const successPanel = document.getElementById('paymentSuccessPanel');
      if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
        statusBox.textContent = 'This form needs a free Web3Forms access key before it can send. See the README.';
        statusBox.className = 'mt-4 text-sm text-center font-bold text-red-600';
        return;
      }
      if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Processing…'; }
      try {
        const res = await fetch(paymentForm.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(paymentForm))),
        });
        const data = await res.json();
        if (data.success) {
          document.getElementById('paymentFormFields')?.classList.add('hidden');
          if (successPanel) successPanel.classList.remove('hidden');
          fireConfetti();
        } else {
          statusBox.textContent = 'Something went wrong sending that. Please email us directly instead.';
          statusBox.className = 'mt-4 text-sm text-center font-bold text-red-600';
          if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Submit Payment Request'; }
        }
      } catch (err) {
        statusBox.textContent = "Could not reach the server. Please email us directly instead.";
        statusBox.className = 'mt-4 text-sm text-center font-bold text-red-600';
        if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = '<i class="fa-solid fa-lock"></i> Submit Payment Request'; }
      }
    });
  }

  // ---- cinematic hero slideshow (homepage), crossfades between
  // several full-bleed images instead of a single static photo ----------
  const heroSlides = document.querySelectorAll('.hero-slide');
  const heroDots = document.querySelectorAll('.hero-slide-dot');
  if (heroSlides.length > 1) {
    let heroIdx = 0;
    const showHero = (i) => {
      heroIdx = (i + heroSlides.length) % heroSlides.length;
      heroSlides.forEach((s, si) => s.classList.toggle('active', si === heroIdx));
      heroDots.forEach((d, di) => d.classList.toggle('active', di === heroIdx));
    };
    heroDots.forEach((d, i) => d.addEventListener('click', () => showHero(i)));
    if (!prefersReducedMotion) setInterval(() => showHero(heroIdx + 1), 5000);
  }

  // ---- video showcase modal, opens a muted looping clip full screen ----------
  const videoModal = document.getElementById('videoModal');
  if (videoModal) {
    const modalVideo = videoModal.querySelector('video');
    document.querySelectorAll('.video-trigger').forEach(trigger => {
      trigger.addEventListener('click', () => {
        videoModal.classList.add('open');
        if (modalVideo) { modalVideo.currentTime = 0; modalVideo.play().catch(() => {}); }
        document.documentElement.style.overflow = 'hidden';
      });
    });
    const closeVideo = () => {
      videoModal.classList.remove('open');
      if (modalVideo) modalVideo.pause();
      document.documentElement.style.overflow = '';
    };
    document.getElementById('videoModalClose')?.addEventListener('click', closeVideo);
    videoModal.addEventListener('click', (e) => { if (e.target === videoModal) closeVideo(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeVideo(); });
  }

  // ---- animated data bars, fill in once scrolled into view, and
  // count the percentage label up alongside the bar rather than
  // just snapping it to the final number ----------
  const dataBars = document.querySelectorAll('.data-bar-fill');
  if (dataBars.length) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseFloat(el.dataset.value) || 0;
        el.style.width = target + '%';
        const labelRow = el.closest('.data-bar-track')?.previousElementSibling;
        const valueLabel = labelRow?.querySelector('span:last-child');
        if (valueLabel && !prefersReducedMotion) {
          const raw = valueLabel.textContent.trim();
          const numMatch = raw.match(/^\$?([\d,]+(?:\.\d+)?)/);
          const labelTarget = numMatch ? parseFloat(numMatch[1].replace(/,/g, '')) : null;
          const prefix = raw.match(/^\$/) ? '$' : '';
          const suffix = raw.replace(/^\$?[\d,.]+/, '');
          if (labelTarget !== null) {
            valueLabel.classList.add('data-stat-value');
            let cur = 0;
            const step = Math.max(labelTarget / 40, 0.1);
            const tick = () => {
              cur += step;
              if (cur >= labelTarget) { valueLabel.textContent = prefix + labelTarget.toLocaleString() + suffix; return; }
              valueLabel.textContent = prefix + Math.round(cur).toLocaleString() + suffix;
              requestAnimationFrame(tick);
            };
            tick();
          }
        }
        io.unobserve(el);
      });
    }, { threshold: 0.4 });
    dataBars.forEach(el => io.observe(el));
  }

  // generic Web3Forms wired contact/newsletter forms elsewhere on the site
  document.querySelectorAll('.web3-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const accessKey = form.querySelector('[name="access_key"]').value;
      const statusBox = form.querySelector('.form-status-msg');
      if (!accessKey || accessKey === 'YOUR_ACCESS_KEY_HERE') {
        if (statusBox) { statusBox.textContent = 'This form needs a free Web3Forms access key. See the README.'; statusBox.className = 'form-status-msg mt-3 text-sm font-bold text-red-600'; }
        return;
      }
      try {
        const res = await fetch(form.action, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        const data = await res.json();
        if (statusBox) {
          if (data.success) { statusBox.textContent = 'Thank you, your message has been sent.'; statusBox.className = 'form-status-msg mt-3 text-sm font-bold text-emerald'; form.reset(); }
          else { statusBox.textContent = 'Something went wrong, please try again.'; statusBox.className = 'form-status-msg mt-3 text-sm font-bold text-red-600'; }
        }
      } catch (err) {
        if (statusBox) { statusBox.textContent = 'Could not reach the server.'; statusBox.className = 'form-status-msg mt-3 text-sm font-bold text-red-600'; }
      }
    });
  });

  // consultation prep checklist, swaps items by practice tab and
  // tracks completion with a live progress bar
  const checklistItems = document.getElementById('checklistItems');
  if (checklistItems) {
    const CHECKLISTS = {
      corporate: ['Recent financial statements or tax returns', 'Existing contracts or agreements related to the matter', 'Corporate formation documents (articles, bylaws)', 'Names of other parties involved', 'A rough timeline of key dates', 'Your goals for the outcome'],
      family: ['Marriage certificate, if applicable', 'Financial statements or recent pay stubs', 'Any existing custody or support agreements', 'A list of shared assets and debts', 'Names and ages of children involved', 'Any relevant prior court filings'],
      estate: ['A list of your major assets', 'Names of intended beneficiaries', 'Any existing will or trust documents', 'Names of potential executors or trustees', 'Information on any business you own', 'Your goals for wealth transfer'],
      criminal: ['Any documents you have received from law enforcement', 'A timeline of events as you recall them', 'Names of any witnesses', 'Contact information for anyone else involved', 'Court dates, if any have been set', 'Questions you want answered first'],
      realestate: ['The property address and parcel information', 'Any purchase agreement or offer already made', 'Title or survey documents, if available', 'Loan or financing details', 'Names of other parties (buyer, seller, lender)', 'Your intended timeline for closing'],
      benefits: ['Your denial letter, if you have one', 'Social Security number and date of birth', 'A list of medical providers and treatment dates', 'Recent medical records, if available', 'Work history for the past 15 years, for SSDI', 'VA discharge papers (DD-214), if applicable'],
      probate: ['The original will, if one exists', 'Death certificate', 'A list of the estate\'s major assets', 'Names and contact information for all heirs', 'Any existing trust documents', 'Outstanding debts or creditor notices'],
      injury: ['Any accident or police report', 'Photos of the accident scene or injury', 'Medical records and bills related to the injury', 'Insurance information for all parties involved', 'A record of missed work or lost income', 'Any correspondence from an insurance company'],
      wrongfuldeath: ['Death certificate', 'Any police or incident report', 'Insurance information for all parties involved', 'Documentation of the deceased\'s income and dependents', 'Funeral and related expense records', 'Names of all surviving family members'],
    };
    const titleEl = document.getElementById('checklistTitle');
    const countEl = document.getElementById('checklistCount');
    const barEl = document.getElementById('checklistBar');
    const labels = { corporate: 'Corporate & M&A', family: 'Family Law', estate: 'Estate Planning', criminal: 'Criminal Defense', realestate: 'Real Estate', benefits: 'Government Benefits & Disability', probate: 'Probate & Estate Administration', injury: 'Personal Injury', wrongfuldeath: 'Wrongful Death' };

    const renderChecklist = (key) => {
      const items = CHECKLISTS[key];
      checklistItems.innerHTML = items.map((text, i) => `
        <div class="checklist-item" data-index="${i}">
          <input type="checkbox" id="cl-${i}">
          <label for="cl-${i}">${text}</label>
        </div>
      `).join('');
      titleEl.textContent = labels[key] + ' Checklist';
      updateProgress();
    };
    const updateProgress = () => {
      const boxes = checklistItems.querySelectorAll('input[type="checkbox"]');
      const checked = [...boxes].filter(b => b.checked).length;
      countEl.textContent = `${checked} / ${boxes.length}`;
      const pct = boxes.length ? Math.round((checked / boxes.length) * 100) : 0;
      barEl.style.width = pct + '%';
    };
    checklistItems.addEventListener('change', (e) => {
      if (e.target.type !== 'checkbox') return;
      e.target.closest('.checklist-item')?.classList.toggle('checked', e.target.checked);
      updateProgress();
    });
    document.getElementById('checklistTabs')?.querySelectorAll('button').forEach(btn => {
      btn.addEventListener('click', () => {
        document.getElementById('checklistTabs').querySelectorAll('button').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        renderChecklist(btn.dataset.checklist);
      });
    });
    renderChecklist('corporate');
  }

  // practice finder quiz, branches on business/personal then maps
  // answers to a suggested practice area
  const quizCard = document.getElementById('quizCard');
  if (quizCard) {
    const RESULTS = {
      deal: ['Corporate & M&A', 'fa-building', 'Buying, selling, or raising money for a business is core to our Corporate & M&A team.', 'practice-areas.html#corporate'],
      dispute: ['Litigation & Arbitration', 'fa-gavel', 'Business disputes and lawsuits are handled by our Litigation & Arbitration team.', 'practice-areas.html#litigation'],
      distress: ['Restructuring', 'fa-arrows-rotate', 'Financial distress and debt situations are exactly what our Restructuring team handles daily.', 'practice-areas.html#restructuring'],
      team: ['Employment', 'fa-people-group', 'Workplace and HR matters go to our Employment practice.', 'practice-areas.html#employment'],
      divorce: ['Family Law', 'fa-people-roof', 'Divorce, custody, and separation are handled by our Family Law team.', 'practice-areas.html#family'],
      estate: ['Estate Planning', 'fa-file-signature', 'Planning ahead is exactly what our Estate Planning team is for.', 'practice-areas.html#estate'],
      criminal: ['Criminal Defense & White Collar', 'fa-gavel', 'Facing charges calls for our Criminal Defense & White Collar team right away.', 'practice-areas.html#criminal'],
      property: ['Real Estate', 'fa-city', 'Property matters are handled by our Real Estate practice.', 'practice-areas.html#real-estate'],
      benefits: ['Government Benefits & Disability', 'fa-hand-holding-heart', 'Social Security, SSI, VA disability, and public benefit appeals go to our Government Benefits & Disability team.', 'practice-areas.html#benefits'],
      probate: ['Probate & Estate Administration', 'fa-scroll', 'Settling an estate after a death is handled by our Probate & Estate Administration team.', 'practice-areas.html#probate'],
      injury: ['Personal Injury', 'fa-user-injured', 'Injuries and losses caused by someone else\'s negligence go to our Personal Injury and Wrongful Death team.', 'practice-areas.html#personal-injury'],
    };
    const answers = {};
    let step = 0;
    const dots = quizCard.querySelectorAll('.quiz-progress-dot');
    const showStep = (n) => {
      quizCard.querySelectorAll('.quiz-step').forEach(s => s.classList.add('hidden'));
      let target;
      if (n === 1) target = quizCard.querySelector(`.quiz-step[data-step="1"][data-branch="${answers.q0}"]`);
      else target = quizCard.querySelector(`.quiz-step[data-step="${n}"]`);
      target?.classList.remove('hidden');
      dots.forEach((d, i) => d.classList.toggle('done', i < n));
      step = n;
    };
    quizCard.addEventListener('click', (e) => {
      const btn = e.target.closest('.quiz-option');
      if (!btn) return;
      answers['q' + step] = btn.dataset.quizAnswer;
      if (step === 0) showStep(1);
      else if (step === 1) showStep(2);
      else if (step === 2) showStep(3);
      else if (step === 3) {
        const key = answers.q1;
        const [title, icon, desc, link] = RESULTS[key] || RESULTS.deal;
        document.getElementById('quizResultTitle').textContent = title;
        document.getElementById('quizResultDesc').textContent = desc;
        document.getElementById('quizResultLink').href = link;
        document.getElementById('quizResultIcon').innerHTML = `<i class="fa-solid ${icon} text-gold"></i>`;
        showStep(4);
      }
    });
    document.getElementById('quizRestartBtn')?.addEventListener('click', () => {
      Object.keys(answers).forEach(k => delete answers[k]);
      showStep(0);
    });
  }

  // Notable Matters and Recognition filter bars, toggle which cards
  // are visible based on the selected practice/industry tag
  [
    { bar: 'mattersFilterBar', cardSelector: '.matter-card', emptyId: 'mattersEmptyState' },
    { bar: 'recognitionFilterBar', cardSelector: '.ranking-badge', emptyId: null },
    { bar: 'insightsFilterBar', cardSelector: '#insightsGrid > [data-tags]', emptyId: 'insightsEmptyState' },
    { bar: 'pubsFilterBar', cardSelector: '#pubsGrid > [data-tags]', emptyId: 'pubsEmptyState' },
    { bar: 'attorneyFilterBar', cardSelector: '#attorneyGrid > [data-tags]', emptyId: null },
  ].forEach(({ bar, cardSelector, emptyId }) => {
    const filterBar = document.getElementById(bar);
    if (!filterBar) return;
    const cards = document.querySelectorAll(cardSelector);
    const emptyState = emptyId ? document.getElementById(emptyId) : null;
    filterBar.querySelectorAll('.matter-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterBar.querySelectorAll('.matter-filter-btn').forEach(b => b.classList.remove('is-active'));
        btn.classList.add('is-active');
        const filter = btn.dataset.filter;
        let visible = 0;
        cards.forEach(card => {
          const match = filter === 'all' || (card.dataset.tags || '').split(' ').includes(filter);
          card.classList.toggle('filtered-out', !match);
          if (match) visible++;
        });
        if (emptyState) emptyState.style.display = visible ? 'none' : 'block';
      });
    });
  });

  // arriving at the Global Offices page via a direct link to a
  // specific office (e.g. from the homepage globe), scroll to that
  // office's card and highlight it briefly
  if (window.location.hash.startsWith('#office-')) {
    const officeKey = window.location.hash.replace('#office-', '');
    const targetCard = document.getElementById('office-' + officeKey);
    if (targetCard) {
      setTimeout(() => {
        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        targetCard.classList.add('active-office');
        document.querySelector(`.map-pin-group[data-office="${officeKey}"] .map-pin-label`)?.classList.add('pinned');
        setTimeout(() => targetCard.classList.remove('active-office'), 3200);
      }, 700);
    }
  }

  // attorney flip cards, hover flips on desktop automatically via CSS;
  // on touch devices the first tap flips the card to reveal the bio,
  // and a second tap on the same card follows the link through
  document.querySelectorAll('.attorney-flip-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (isFinePointer) return;
      if (!card.classList.contains('is-flipped')) {
        e.preventDefault();
        document.querySelectorAll('.attorney-flip-card.is-flipped').forEach(c => { if (c !== card) c.classList.remove('is-flipped'); });
        card.classList.add('is-flipped');
      }
    });
  });

  // industry cards on the Industries page reveal a one-line
  // description on hover, but touch devices have no hover, only a
  // fleeting :active state that fades before a tap even completes,
  // so the description never actually gets read. Same fix as the
  // attorney cards above: first tap opens it, a second tap on the
  // same (already open) card follows the link through as normal.
  document.querySelectorAll('.industry-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (isFinePointer) return;
      if (!card.classList.contains('is-open')) {
        e.preventDefault();
        document.querySelectorAll('.industry-card.is-open').forEach(c => { if (c !== card) c.classList.remove('is-open'); });
        card.classList.add('is-open');
      }
    });
  });
  document.addEventListener('click', (e) => {
    if (isFinePointer) return;
    document.querySelectorAll('.industry-card.is-open').forEach(c => { if (!c.contains(e.target)) c.classList.remove('is-open'); });
  });

  // same touch-tap-to-reveal pattern as the industry cards above, applied
  // to the practice-area cards on the practice-areas page
  document.querySelectorAll('.practice-card').forEach(card => {
    card.addEventListener('click', (e) => {
      if (isFinePointer) return;
      if (!card.classList.contains('is-open')) {
        e.preventDefault();
        document.querySelectorAll('.practice-card.is-open').forEach(c => { if (c !== card) c.classList.remove('is-open'); });
        card.classList.add('is-open');
      }
    });
  });
  document.addEventListener('click', (e) => {
    if (isFinePointer) return;
    document.querySelectorAll('.practice-card.is-open').forEach(c => { if (!c.contains(e.target)) c.classList.remove('is-open'); });
  });

  // cookie consent banner, shown once per browser via localStorage,
  // dismissible either way, never blocks the page itself
  const cookieBanner = document.getElementById('cookieBanner');
  if (cookieBanner) {
    let consent = null;
    try { consent = localStorage.getItem('sc_cookie_consent'); } catch (e) {}
    if (!consent) {
      setTimeout(() => {
        cookieBanner.classList.add('show');
        document.body.classList.add('cookie-banner-visible');
      }, 1400);
    }
    const setConsent = (value) => {
      try { localStorage.setItem('sc_cookie_consent', value); } catch (e) {}
      cookieBanner.classList.remove('show');
      document.body.classList.remove('cookie-banner-visible');
    };
    document.getElementById('cookieAccept')?.addEventListener('click', () => setConsent('all'));
    document.getElementById('cookieDecline')?.addEventListener('click', () => setConsent('essential'));
  }

  // language switcher in the top bar, cosmetic for now since this
  // site currently offers English only, but wired up like a real one
  // so it is ready to connect to actual translations later
  const langSwitcher = document.getElementById('langSwitcher');
  if (langSwitcher) {
    const langBtn = document.getElementById('langBtn');
    const langCurrent = document.getElementById('langCurrent');
    langBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      langSwitcher.classList.toggle('lang-open');
    });
    langSwitcher.querySelectorAll('.lang-option').forEach(opt => {
      opt.addEventListener('click', () => {
        langSwitcher.querySelectorAll('.lang-option').forEach(o => o.classList.remove('active'));
        opt.classList.add('active');
        if (langCurrent) langCurrent.textContent = opt.dataset.lang;
        langSwitcher.classList.remove('lang-open');
      });
    });
    document.addEventListener('click', (e) => {
      if (!langSwitcher.contains(e.target)) langSwitcher.classList.remove('lang-open');
    });
  }

  // cinematic page transition, a brief curtain wipe between internal
  // pages instead of an abrupt browser cut, skips external links,
  // hashes, mailto/tel, new tabs, and downloads
  // article page: Download PDF / Share toolbar. The Download PDF
  // link already has a `download` attribute, which the page-curtain
  // handler above already skips, so it behaves like a normal file
  // download with no page-transition animation firing on top of it.
  document.querySelectorAll('.article-share-btn').forEach(btn => {
    const menu = btn.nextElementSibling;
    if (!menu || !menu.classList.contains('article-share-menu')) return;
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const willOpen = !menu.classList.contains('is-open');
      document.querySelectorAll('.article-share-menu.is-open').forEach(m => m.classList.remove('is-open'));
      menu.classList.toggle('is-open', willOpen);
      btn.setAttribute('aria-expanded', String(willOpen));
    });
    const copyBtn = menu.querySelector('.article-copy-link');
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(window.location.href);
          const original = copyBtn.innerHTML;
          copyBtn.innerHTML = '<i class="fa-solid fa-check"></i> Link copied';
          copyBtn.classList.add('is-copied');
          setTimeout(() => { copyBtn.innerHTML = original; copyBtn.classList.remove('is-copied'); }, 2000);
        } catch (err) { /* clipboard unavailable, link is still visible in the browser bar */ }
      });
    }
  });
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.article-share-menu.is-open').forEach(m => {
      if (!m.contains(e.target) && e.target !== m.previousElementSibling && !m.previousElementSibling?.contains(e.target)) {
        m.classList.remove('is-open');
        m.previousElementSibling?.setAttribute('aria-expanded', 'false');
      }
    });
  });

});

