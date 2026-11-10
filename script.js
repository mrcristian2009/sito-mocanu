/* ============ MOCANU — interactions ============ */
(() => {
  "use strict";

  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ---------- 1. LAPTOP: rotazione guidata dallo scroll ---------- */
  const stage = document.getElementById("laptopStage");
  const laptop = document.getElementById("laptop");
  const hero = document.querySelector(".hero");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // stato corrente (per il lerp fluido) e target
  const cur = { rx: 78, ry: -10, s: 0.9 };
  let target = { ...cur };

  function onScroll() {
    const rect = hero.getBoundingClientRect();
    const total = rect.height - window.innerHeight;     // spazio di scrub
    const p = clamp(-rect.top / total, 0, 1);           // progress 0..1

    // Fase 1 (0 → .45): il laptop si apre (rotateX 78° → 0)
    // Fase 2 (.45 → 1): si gira elegantemente (rotateY -10° → 360°, si abbassa)
    const open = clamp(p / 0.45, 0, 1);
    const spin = clamp((p - 0.45) / 0.55, 0, 1);

    target.rx = lerp(78, 0, easeOut(open));
    target.ry = lerp(-10, 360, easeInOut(spin));
    target.s  = lerp(0.9, 0.72, easeInOut(spin));
  }

  const easeOut = t => 1 - Math.pow(1 - t, 3);
  const easeInOut = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  let mx = 0, my = 0; // tilt da mouse
  window.addEventListener("mousemove", e => {
    mx = (e.clientX / window.innerWidth - .5) * 6;
    my = (e.clientY / window.innerHeight - .5) * -4;
  }, { passive: true });

  function tick() {
    cur.rx = lerp(cur.rx, target.rx, 0.08);
    cur.ry = lerp(cur.ry, target.ry, 0.08);
    cur.s  = lerp(cur.s,  target.s,  0.08);
    laptop.style.transform =
      `rotateX(${cur.rx + my}deg) rotateY(${cur.ry + mx}deg) scale(${cur.s})`;
    requestAnimationFrame(tick);
  }

  if (!reduceMotion) {
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    onScroll();
    tick();
  } else {
    laptop.style.transform = "none";
  }

  /* ---------- 2. Reveal on scroll ---------- */
  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); }
    });
  }, { threshold: 0.15 });
  document.querySelectorAll(".reveal").forEach(el => io.observe(el));

  /* ---------- 3. Contatori animati ---------- */
  const counters = document.querySelectorAll("[data-count]");
  const cio = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      const el = e.target;
      cio.unobserve(el);
      const end = +el.dataset.count;
      const dur = 1600;
      const t0 = performance.now();
      (function step(now) {
        const p = clamp((now - t0) / dur, 0, 1);
        el.textContent = Math.round(end * easeOut(p));
        if (p < 1) requestAnimationFrame(step);
      })(t0);
    });
  }, { threshold: 0.6 });
  counters.forEach(c => cio.observe(c));

  /* ---------- 4. Navbar: sfondo più scuro dopo lo hero ---------- */
  const nav = document.getElementById("nav");
  window.addEventListener("scroll", () => {
    nav.style.background = window.scrollY > 80
      ? "rgba(0,0,0,.78)" : "rgba(0,0,0,.55)";
  }, { passive: true });

})();
