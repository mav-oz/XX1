document.addEventListener('DOMContentLoaded', () => {

  /* ---------- 1. PRELOADER ---------- */
  const preloader = document.getElementById('preloader');
  const preloaderBar = document.getElementById('preloaderBar');
  let progress = 0;
  const loadTimer = setInterval(() => {
    progress += Math.random() * 18 + 6;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loadTimer);
      preloaderBar.style.width = progress + '%';
      setTimeout(() => {
        preloader.classList.add('done');
        startHeroReveal();
      }, 380);
    } else {
      preloaderBar.style.width = progress + '%';
    }
  }, 220);

  /* ---------- 2. HERO REVEAL + TYPEWRITER ---------- */
  function startHeroReveal(){
    document.querySelectorAll('.hero .reveal, .hero .reveal-scale').forEach((el, i) => {
      setTimeout(() => el.classList.add('in-view'), i * 160);
    });
    typeWriter(document.getElementById('heroTagline'), 'رحلتك نحو جسدٍ أقوى، وعقلٍ أكثر انضباطًا، تبدأ من هنا.', 32);
  }
  function typeWriter(el, text, speed){
    if(!el) return;
    let i = 0;
    const cursor = document.createElement('span');
    cursor.className = 'cursor-blink';
    function step(){
      el.textContent = text.slice(0, i);
      el.appendChild(cursor);
      i++;
      if (i <= text.length) setTimeout(step, speed);
    }
    step();
  }

  /* ---------- 3. CUSTOM CURSOR ---------- */
  const cursorDot = document.getElementById('cursorDot');
  const cursorRing = document.getElementById('cursorRing');
  if (window.matchMedia('(pointer: fine)').matches) {
    let ringX = 0, ringY = 0, mouseX = 0, mouseY = 0;
    window.addEventListener('mousemove', e => {
      mouseX = e.clientX; mouseY = e.clientY;
      cursorDot.style.transform = `translate(${mouseX}px,${mouseY}px) translate(-50%,-50%)`;
    });
    (function animateRing(){
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      cursorRing.style.transform = `translate(${ringX}px,${ringY}px) translate(-50%,-50%)`;
      requestAnimationFrame(animateRing);
    })();
    document.querySelectorAll('a, button, .tilt').forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovering'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovering'));
    });
  } else {
    cursorDot.style.display = 'none';
    cursorRing.style.display = 'none';
  }

  /* ---------- 4. SCROLL PROGRESS + NAVBAR + PARALLAX + TO-TOP ---------- */
  const scrollProgress = document.getElementById('scrollProgress');
  const navbar = document.getElementById('navbar');
  const toTopBtn = document.getElementById('toTop');
  const orbits = document.querySelectorAll('.hero-orbit');
  let ticking = false;

  function onScroll(){
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    scrollProgress.style.width = pct + '%';

    navbar.classList.toggle('scrolled', scrollTop > 40);
    toTopBtn.classList.toggle('show', scrollTop > 500);

    orbits.forEach((o, i) => { o.style.transform = `translateX(-50%) translateY(${scrollTop * (0.06 + i*0.03)}px)`; });

    ticking = false;
  }
  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  toTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- 5. MOBILE NAV ---------- */
  const navToggle = document.getElementById('navToggle');
  const mobileMenu = document.getElementById('mobileMenu');
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    mobileMenu.classList.toggle('open');
  });
  mobileMenu.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => { navToggle.classList.remove('active'); mobileMenu.classList.remove('open'); });
  });

  /* ---------- 6. SCROLL-SPY ---------- */
  const sections = document.querySelectorAll('section[id]');
  const navAnchors = document.querySelectorAll('.nav-link[href^="#"]');
  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navAnchors.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });
  sections.forEach(s => spyObserver.observe(s));

  /* ---------- 7. REVEAL ON SCROLL (with stagger per container) ---------- */
  const revealSelectors = '.reveal, .reveal-3d, .reveal-left, .reveal-right, .reveal-scale, .pulse-divider';
  // hero elements are revealed explicitly by the preloader sequence above, skip them here
  const revealEls = Array.from(document.querySelectorAll(revealSelectors)).filter(el => !el.closest('.hero'));
  // group elements by parent so siblings stagger in sequence
  const parentMap = new Map();
  revealEls.forEach(el => {
    const p = el.parentElement;
    if (!parentMap.has(p)) parentMap.set(p, []);
    parentMap.get(p).push(el);
  });
  parentMap.forEach(list => {
    list.forEach((el, idx) => { el.dataset.staggerIndex = idx; });
  });

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = +(entry.target.dataset.staggerIndex || 0);
        const el = entry.target;
        setTimeout(() => {
          el.classList.add('in-view');
          // once the slow 3D reveal transition has finished, switch tiltable
          // cards to a fast inline transition so hover-tilt tracks the mouse
          // instantly instead of inheriting the 1s reveal easing.
          if (el.classList.contains('tilt')) {
            setTimeout(() => { el.style.transition = 'transform .1s linear, border-color .4s, background .4s'; }, 1050);
          }
        }, Math.min(idx, 8) * 90);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------- 8. ANIMATED COUNTERS ---------- */
  const counters = document.querySelectorAll('.count');
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  counters.forEach(c => counterObserver.observe(c));

  function animateCounter(el){
    const target = +el.dataset.target;
    const duration = 1700;
    const start = performance.now();
    function step(now){
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.floor(eased * target);
      if (p < 1) requestAnimationFrame(step); else el.textContent = target;
    }
    requestAnimationFrame(step);
  }

  /* ---------- 9. 3D TILT ON CARDS ---------- */
  document.querySelectorAll('.tilt').forEach(card => {
    card.style.transformStyle = 'preserve-3d';
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-6px)`;
    });
    card.addEventListener('mouseleave', () => { card.style.transform = ''; });
  });

  /* ---------- 11. FLIP CARDS (certificate front/back) ---------- */
  document.querySelectorAll('.flip-card').forEach(card => {
    card.addEventListener('click', () => card.classList.toggle('flipped'));
  });

  /* ---------- 10. FOOTER YEAR ---------- */
  const footerYear = document.getElementById('footerYear');
  if (footerYear) footerYear.textContent = `© ${new Date().getFullYear()} الكابتن أحمد سالم. جميع الحقوق محفوظة.`;

});
