const SUPPORTED_LANGS = ['en', 'tr', 'de', 'ru'];
const LANG_LABELS = { en: 'EN', tr: 'TR', de: 'DE', ru: 'RU' };

let state = {
  data: null,
  gallery: [],
  currentIndex: 0,
  lang: (localStorage.getItem('lang') || (navigator.language || 'en').slice(0, 2).toLowerCase())
};
if (!SUPPORTED_LANGS.includes(state.lang)) state.lang = 'en';

const $ = (id) => document.getElementById(id);

async function loadData() {
  try {
    const res = await fetch('/data.json');
    if (!res.ok) throw new Error('fetch failed');
    return await res.json();
  } catch (e) {
    console.error('data.json could not be loaded:', e);
    return null;
  }
}

function getPath(obj, path) {
  return path.split('.').reduce((acc, k) => acc && acc[k], obj);
}

function t(val) {
  if (val && typeof val === 'object' && !Array.isArray(val) && (val.en !== undefined || val.tr !== undefined)) {
    return val[state.lang] ?? val.en ?? val.tr ?? '';
  }
  return val;
}

function renderStructure(data) {
  state.data = data;
  state.gallery = data.gallery || [];

  if ($('heroBg')) $('heroBg').style.backgroundImage = `url('${data.project.heroImage}')`;
  if ($('heroCta')) $('heroCta').href = data.project.cta.link;

  if ($('featuresGrid')) {
    $('featuresGrid').innerHTML = data.features.map((f, i) => `
      <div class="feature-card" data-feature="${i}">
        <div class="feature-icon">${f.icon}</div>
        <div class="feature-label"></div>
        <div class="feature-value"></div>
      </div>
    `).join('');
  }

  if ($('highlightsList')) {
    $('highlightsList').innerHTML =
      data.highlights.map((_, i) => `<li data-highlight="${i}">✦ &nbsp; </li>`).join('');
  }

  if ($('galleryGrid')) {
    $('galleryGrid').innerHTML = state.gallery.map((g, i) => `
      <div class="gallery-item" data-index="${i}">
        <img src="${g.src}" alt="" loading="lazy">
      </div>
    `).join('');
  }

  if ($('mapFrame')) {
    const { lat, lng, zoom } = data.location;
    $('mapFrame').src = `https://maps.google.com/maps?q=${lat},${lng}&z=${zoom || 14}&output=embed`;
  }

  if ($('phoneLink')) {
    $('phoneLink').href = `tel:${data.contact.phone.replace(/\s/g, '')}`;
    $('phoneLink').textContent = data.contact.phone;
  }

  if ($('emailLink')) {
    $('emailLink').href = `mailto:${data.contact.email}`;
    $('emailLink').textContent = data.contact.email;
  }

  if ($('whatsappBtn')) $('whatsappBtn').href = `https://wa.me/${data.contact.whatsapp}`;

  if ($('faqList')) {
    $('faqList').innerHTML = (data.faq || []).map((_, i) => `
      <div class="bg-white border border-gold/25 transition-colors hover:border-gold/50" data-faq="${i}">
        <button type="button" class="faq-trigger w-full flex justify-between items-center gap-4 text-left px-5 md:px-6 py-4 md:py-5 text-navy hover:text-gold transition-colors" aria-expanded="false">
          <span class="font-medium text-base md:text-lg faq-q"></span>
          <span class="faq-icon text-gold text-2xl leading-none transition-transform duration-300 shrink-0">+</span>
        </button>
        <div class="faq-panel grid grid-rows-[0fr] transition-all duration-300 ease-out">
          <div class="overflow-hidden min-h-0">
            <p class="px-5 md:px-6 pb-5 text-muted leading-relaxed faq-a"></p>
          </div>
        </div>
      </div>
    `).join('');
    setupFaq();
  }

  if ($('galleryGrid')) setupGallery();
}

function setupFaq() {
  document.querySelectorAll('#faqList .faq-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      const item = btn.closest('[data-faq]');
      const panel = item.querySelector('.faq-panel');
      const icon = item.querySelector('.faq-icon');
      const expanded = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', (!expanded).toString());
      panel.classList.toggle('grid-rows-[0fr]', expanded);
      panel.classList.toggle('grid-rows-[1fr]', !expanded);
      icon.classList.toggle('rotate-45', !expanded);
    });
  });
}

function applyTranslations() {
  const data = state.data;
  if (!data) return;

  document.documentElement.lang = state.lang;

  document.querySelectorAll('[data-bind]').forEach(el => {
    const val = t(getPath(data, el.dataset.bind));
    if (val != null) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = t(getPath(data, el.dataset.i18n));
    if (val != null) el.textContent = val;
  });

  document.querySelectorAll('[data-i18n-html]').forEach(el => {
    const val = t(getPath(data, el.dataset.i18nHtml));
    if (val != null) el.innerHTML = val;
  });

  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const val = t(getPath(data, el.dataset.i18nPlaceholder));
    if (val != null) el.placeholder = val;
  });

  const projectName = t(data.project.name);
  const pageTitle = document.querySelector('meta[name="page-title-key"]')?.content;
  if (pageTitle) {
    const localizedPageTitle = t(getPath(data, pageTitle));
    document.title = `${localizedPageTitle} — ${data.brand.name}`;
  } else {
    document.title = `${projectName} — ${data.brand.name}`;
  }

  if ($('heroCta')) $('heroCta').textContent = t(data.project.cta.text);
  if ($('formProject')) $('formProject').value = projectName;

  document.querySelectorAll('.feature-card[data-feature]').forEach(card => {
    const f = data.features[+card.dataset.feature];
    card.querySelector('.feature-label').textContent = t(f.label);
    card.querySelector('.feature-value').textContent = t(f.value);
  });

  document.querySelectorAll('#highlightsList li[data-highlight]').forEach(li => {
    const h = data.highlights[+li.dataset.highlight];
    li.innerHTML = `✦ &nbsp; ${t(h)}`;
  });

  document.querySelectorAll('#galleryGrid .gallery-item img').forEach((img, i) => {
    img.alt = t(state.gallery[i].alt) || '';
  });

  document.querySelectorAll('#faqList [data-faq]').forEach(item => {
    const entry = (data.faq || [])[+item.dataset.faq];
    if (!entry) return;
    item.querySelector('.faq-q').textContent = t(entry.q);
    item.querySelector('.faq-a').textContent = t(entry.a);
  });

  if ($('whatsappBtn')) {
    const msg = encodeURIComponent(t(data.contact.whatsappMessage) || '');
    $('whatsappBtn').href = `https://wa.me/${data.contact.whatsapp}?text=${msg}`;
  }

  if ($('langCurrentLabel')) {
    $('langCurrentLabel').textContent = LANG_LABELS[state.lang] || state.lang.toUpperCase();
  }

  document.querySelectorAll('#langMenu button').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === state.lang);
  });

  requestAnimationFrame(fitOverflowingText);
}

function fitText(el, minPx = 9) {
  el.style.fontSize = '';
  const parent = el.parentElement;
  if (!parent) return;
  const maxWidth = parent.clientWidth - (parseFloat(getComputedStyle(parent).paddingLeft) + parseFloat(getComputedStyle(parent).paddingRight));
  let size = parseFloat(getComputedStyle(el).fontSize);
  let guard = 40;
  while (el.scrollWidth > maxWidth && size > minPx && guard-- > 0) {
    size -= 0.5;
    el.style.fontSize = `${size}px`;
  }
}

function fitOverflowingText() {
  document.querySelectorAll('.feature-label, .feature-value, .highlights-list li').forEach(el => fitText(el));
}

window.addEventListener('resize', () => {
  clearTimeout(window._fitTO);
  window._fitTO = setTimeout(fitOverflowingText, 150);
});

function render(data) {
  if (!data) return;
  renderStructure(data);
  applyTranslations();
  scrollToHashAfterRender();
}

function scrollToHashAfterRender() {
  const hash = window.location.hash;
  if (!hash || hash === '#') return;
  const target = document.querySelector(hash);
  if (!target) return;
  requestAnimationFrame(() => {
    target.scrollIntoView({ behavior: 'auto', block: 'start' });
  });
}

function setLang(lang) {
  if (!SUPPORTED_LANGS.includes(lang) || lang === state.lang) return;
  state.lang = lang;
  localStorage.setItem('lang', lang);
  applyTranslations();
}

(function setupLangDropdown() {
  const switchEl = $('langSwitch');
  const trigger = $('langCurrent');
  const menu = $('langMenu');
  if (!switchEl || !trigger || !menu) return;

  function setOpen(open) {
    switchEl.classList.toggle('open', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
  }

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!switchEl.classList.contains('open'));
  });

  menu.addEventListener('click', (e) => {
    const btn = e.target.closest('button[data-lang]');
    if (!btn) return;
    setLang(btn.dataset.lang);
    setOpen(false);
  });

  document.addEventListener('click', (e) => {
    if (!switchEl.contains(e.target)) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
})();

function setupGallery() {
  const lightbox = $('lightbox');
  if (!lightbox) return;

  document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', () => {
      state.currentIndex = parseInt(item.dataset.index, 10);
      openLightbox();
    });
  });

  $('lightboxClose').onclick = closeLightbox;
  $('lightboxPrev').onclick = (e) => { e.stopPropagation(); navigate(-1); };
  $('lightboxNext').onclick = (e) => { e.stopPropagation(); navigate(1); };
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') navigate(-1);
    if (e.key === 'ArrowRight') navigate(1);
  });
}

function openLightbox() {
  const img = $('lightboxImg');
  img.src = state.gallery[state.currentIndex].src;
  img.alt = state.gallery[state.currentIndex].alt || '';
  $('lightbox').classList.add('active');
}
function closeLightbox() {
  $('lightbox').classList.remove('active');
}
function navigate(dir) {
  const len = state.gallery.length;
  state.currentIndex = (state.currentIndex + dir + len) % len;
  openLightbox();
}

window.addEventListener('scroll', () => {
  const nav = $('navbar');
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 50);
});

(function setupNavToggle() {
  const nav = $('navbar');
  const toggle = $('navToggle');
  if (!nav || !toggle) return;

  const setOpen = (open) => {
    nav.classList.toggle('nav-open', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  toggle.addEventListener('click', (e) => {
    e.stopPropagation();
    setOpen(!nav.classList.contains('nav-open'));
  });

  nav.querySelectorAll('.nav-links a').forEach(a => {
    a.addEventListener('click', () => setOpen(false));
  });

  document.addEventListener('click', (e) => {
    if (nav.classList.contains('nav-open') && !nav.contains(e.target)) setOpen(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') setOpen(false);
  });
})();

if ($('year')) $('year').textContent = new Date().getFullYear();

const contactForm = document.querySelector('.contact-form');
if (contactForm) {
  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = this;
    const successEl = $('formSuccess');

    const showSuccess = () => {
      successEl.style.display = 'block';
      form.reset();
      successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const isLocal = window.location.hostname === 'localhost' ||
                    window.location.hostname === '127.0.0.1' ||
                    window.location.protocol === 'file:';
    if (isLocal) {
      showSuccess();
      return;
    }

    try {
      const body = new URLSearchParams(new FormData(form)).toString();
      const res = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body
      });
      if (!res.ok) throw new Error('submit failed');
      showSuccess();
    } catch (err) {
      console.error('Form submit error:', err);
      alert('Submission failed. Please try again.');
    }
  });
}

loadData().then(render);
