/* ==========================================================================
   Sito Mocanu — comportamento
   ========================================================================== */

// Servizio che riceve il modulo di contatto (es. Formspree o Web3Forms).
// Finché è vuoto, il modulo mostra un messaggio e non invia nulla.
const CONFIG = {
  formEndpoint: ''
};

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/* ---------- Menu mobile ---------- */
(function initMenu() {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('menu');
  if (!toggle || !nav) return;

  const setOpen = (open) => {
    toggle.setAttribute('aria-expanded', String(open));
    nav.classList.toggle('is-open', open);
  };

  toggle.addEventListener('click', () => {
    setOpen(toggle.getAttribute('aria-expanded') !== 'true');
  });
  nav.addEventListener('click', (event) => {
    if (event.target.closest('a')) setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && toggle.getAttribute('aria-expanded') === 'true') {
      setOpen(false);
      toggle.focus();
    }
  });
})();

/* ---------- Barra di avanzamento ---------- */
(function initProgress() {
  const bar = document.querySelector('.progress');
  if (!bar) return;

  let ticking = false;
  const update = () => {
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const p = max > 0 ? Math.min(window.scrollY / max, 1) : 0;
    bar.style.setProperty('--p', p.toFixed(4));
    ticking = false;
  };

  window.addEventListener('scroll', () => {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(update);
    }
  }, { passive: true });
  window.addEventListener('resize', update);
  update();
})();

/* ---------- Voce di menu attiva ---------- */
(function initActiveLink() {
  const links = [...document.querySelectorAll('.nav a[href^="#"]')];
  const sections = links
    .map((link) => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  if (!sections.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      links.forEach((link) => {
        const active = link.getAttribute('href') === '#' + entry.target.id;
        link.classList.toggle('is-active', active);
        if (active) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach((section) => observer.observe(section));
})();

/* ---------- Elenco progetti ---------- */
(function initProjects() {
  document.querySelectorAll('.dir__head').forEach((button) => {
    button.addEventListener('click', () => {
      const item = button.closest('.dir__item');
      const open = button.getAttribute('aria-expanded') !== 'true';
      button.setAttribute('aria-expanded', String(open));
      item.classList.toggle('is-open', open);
    });
  });
})();

/* ---------- Confronto: le barre si riempiono quando entrano in vista ---------- */
(function initCompare() {
  const block = document.querySelector('[data-compare]');
  if (!block) return;

  if (reduceMotion || !('IntersectionObserver' in window)) {
    block.classList.add('is-visible');
    return;
  }

  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.35 });

  observer.observe(block);
})();

/* ---------- Finestra CMD: scrive i comandi uno alla volta ---------- */
(async function initConsole() {
  const body = document.querySelector('[data-console-body]');
  if (!body) return;

  const root = body.closest('.console');
  const lines = [...body.querySelectorAll('p')].map((el) => {
    const typed = el.querySelector('.typed');
    return { el, kind: el.dataset.kind, typed, text: typed ? typed.textContent : '' };
  });

  if (reduceMotion) {
    root.classList.add('is-done');
    return;
  }

  // Aspetta i font, poi blocca l'altezza finale per evitare scatti del layout.
  if (document.fonts && document.fonts.ready) await document.fonts.ready;
  body.style.minHeight = body.offsetHeight + 'px';

  const cursor = document.createElement('span');
  cursor.className = 'cursor';
  body.querySelector('.cursor')?.remove();

  lines.forEach((line) => {
    line.el.hidden = true;
    if (line.typed) line.typed.textContent = '';
  });

  await sleep(500);

  for (const line of lines) {
    line.el.hidden = false;

    if (line.kind === 'cmd') {
      line.typed.after(cursor);
      await sleep(380);
      for (const char of line.text) {
        line.typed.textContent += char;
        await sleep(30 + Math.random() * 55);
      }
      await sleep(320);
    } else if (line.kind === 'out') {
      await sleep(200);
    } else if (line.kind === 'idle') {
      line.typed.after(cursor);
    }
  }

  root.classList.add('is-done');
})();

/* ---------- Modulo di contatto ---------- */
(function initForm() {
  const form = document.querySelector('[data-form]');
  if (!form) return;

  const status = form.querySelector('.form__status');
  const submit = form.querySelector('[type="submit"]');

  const setStatus = (type, message) => {
    status.className = 'form__status' + (type ? ' is-' + type : '');
    status.textContent = message;
  };

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    // Campo anti-spam: se è compilato, è un bot. Si ferma senza avvisare.
    if (form.elements.website.value) return;

    if (!form.reportValidity()) {
      setStatus('error', 'Compila nome, email, messaggio e conferma la privacy.');
      return;
    }

    if (!CONFIG.formEndpoint) {
      console.warn('Imposta CONFIG.formEndpoint in js/main.js per attivare il modulo.');
      setStatus('error', 'Il modulo non è ancora attivo. Riprova più tardi.');
      return;
    }

    submit.disabled = true;
    setStatus('', 'Invio in corso…');

    try {
      const response = await fetch(CONFIG.formEndpoint, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error('HTTP ' + response.status);
      form.reset();
      setStatus('ok', 'Richiesta inviata. Grazie!');
    } catch (error) {
      setStatus('error', 'Invio non riuscito. Controlla la connessione e riprova.');
    } finally {
      submit.disabled = false;
    }
  });
})();
