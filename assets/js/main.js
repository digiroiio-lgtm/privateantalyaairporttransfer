/* ============================================================
   Private Antalya Airport Transfer – Main JavaScript
   ============================================================ */

(function () {
  'use strict';

  /* -------- Currency Config -------- */
  const CURRENCIES = {
    EUR: { symbol: '€', rate: 1,     label: 'EUR (€)' },
    GBP: { symbol: '£', rate: 0.86,  label: 'GBP (£)' },
    USD: { symbol: '$', rate: 1.09,  label: 'USD ($)' },
    TRY: { symbol: '₺', rate: 35.2,  label: 'TRY (₺)' },
  };

  const BASE_PRICES = {
    belek:   35,
    side:    45,
    alanya:  65,
    kemer:   40,
    kalkan:  80,
    antalya: 20,
  };

  let activeCurrency = detectCurrency();

  function detectCurrency() {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
    const lang = (navigator.language || navigator.userLanguage || '').toLowerCase();
    if (tz.includes('London') || lang.startsWith('en-gb')) return 'GBP';
    if (tz.includes('America') || lang.startsWith('en-us')) return 'USD';
    return 'EUR';
  }

  function formatPrice(eurAmount, currency) {
    const c = CURRENCIES[currency] || CURRENCIES.EUR;
    const val = Math.round(eurAmount * c.rate);
    return c.symbol + val;
  }

  function updateAllPrices() {
    document.querySelectorAll('[data-price-eur]').forEach(el => {
      const base = parseFloat(el.getAttribute('data-price-eur'));
      el.textContent = formatPrice(base, activeCurrency);
    });
  }

  /* -------- Navbar Toggle -------- */
  function initNavbar() {
    const toggle = document.querySelector('.navbar-toggle');
    const nav = document.querySelector('.navbar-nav');
    if (!toggle || !nav) return;
    toggle.addEventListener('click', () => nav.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (!toggle.contains(e.target) && !nav.contains(e.target)) {
        nav.classList.remove('open');
      }
    });
  }

  /* -------- Currency Selector -------- */
  function initCurrencySelector() {
    const sel = document.querySelector('.currency-select');
    if (!sel) return;

    // Populate options
    Object.entries(CURRENCIES).forEach(([code, info]) => {
      const opt = document.createElement('option');
      opt.value = code;
      opt.textContent = info.label;
      if (code === activeCurrency) opt.selected = true;
      sel.appendChild(opt);
    });

    sel.addEventListener('change', () => {
      activeCurrency = sel.value;
      updateAllPrices();
      updateBookingPreview();
    });

    updateAllPrices();
  }

  /* -------- Booking Form & Live Price Preview -------- */
  function initBookingForm() {
    const form = document.querySelector('#booking-form');
    if (!form) return;

    const destInput = document.querySelector('#destination');
    const previewEl = document.querySelector('#price-preview-amount');
    const urgencyEl = document.querySelector('#urgency-stock');

    const destinations = [
      { name: 'Belek',   key: 'belek',   price: 35 },
      { name: 'Side',    key: 'side',    price: 45 },
      { name: 'Alanya',  key: 'alanya',  price: 65 },
      { name: 'Kemer',   key: 'kemer',   price: 40 },
      { name: 'Kalkan',  key: 'kalkan',  price: 80 },
      { name: 'Antalya City Centre', key: 'antalya', price: 20 },
      { name: 'Lara Beach',  key: 'belek',  price: 28 },
      { name: 'Kundu',   key: 'antalya', price: 22 },
      { name: 'Manavgat', key: 'side',   price: 50 },
    ];

    // Autocomplete
    if (destInput) {
      const list = document.createElement('ul');
      list.className = 'autocomplete-list';
      list.style.cssText = 'position:absolute;top:100%;left:0;right:0;background:#fff;border:1.5px solid #fde68a;border-radius:8px;list-style:none;z-index:100;box-shadow:0 4px 16px rgba(0,0,0,.12);max-height:220px;overflow-y:auto;display:none;';
      destInput.parentElement.style.position = 'relative';
      destInput.parentElement.appendChild(list);

      destInput.addEventListener('input', () => {
        const q = destInput.value.toLowerCase();
        const matches = q.length < 1 ? [] : destinations.filter(d => d.name.toLowerCase().includes(q));
        list.innerHTML = '';
        if (matches.length === 0) { list.style.display = 'none'; return; }
        matches.forEach(d => {
          const li = document.createElement('li');
          li.textContent = d.name;
          li.style.cssText = 'padding:10px 14px;cursor:pointer;font-size:.9rem;color:#334155;';
          li.addEventListener('mouseenter', () => li.style.background = '#fefce8');
          li.addEventListener('mouseleave', () => li.style.background = '');
          li.addEventListener('click', () => {
            destInput.value = d.name;
            destInput.setAttribute('data-price-key', d.key);
            destInput.setAttribute('data-base-price', d.price);
            list.style.display = 'none';
            updateBookingPreview();
          });
          list.appendChild(li);
        });
        list.style.display = 'block';
      });

      document.addEventListener('click', e => {
        if (!destInput.contains(e.target)) list.style.display = 'none';
      });
    }

    form.addEventListener('submit', e => {
      e.preventDefault();
      const dest = destInput ? destInput.value : '';
      const date = form.querySelector('#transfer-date')?.value || '';
      const time = form.querySelector('#transfer-time')?.value || '';
      const passengers = form.querySelector('#passengers')?.value || '1';
      const msg = encodeURIComponent(
        `Hello! I want to book an Antalya Airport Transfer.\n` +
        `Destination: ${dest}\nDate: ${date}\nTime: ${time}\nPassengers: ${passengers}\nPlease confirm availability and price.`
      );
      window.open(`https://wa.me/905XXXXXXXXX?text=${msg}`, '_blank');
    });
  }

  function updateBookingPreview() {
    const destInput = document.querySelector('#destination');
    const previewEl = document.querySelector('#price-preview-amount');
    if (!previewEl || !destInput) return;
    const basePrice = parseFloat(destInput.getAttribute('data-base-price') || '35');
    previewEl.textContent = formatPrice(basePrice, activeCurrency);
  }

  /* -------- Urgency Counter -------- */
  function initUrgency() {
    const els = document.querySelectorAll('.urgency-vehicles');
    if (!els.length) return;
    // Pseudo-random "low stock" number seeded by date
    const today = new Date();
    const seed = (today.getDate() * 7 + today.getMonth() * 3) % 5 + 1;
    els.forEach(el => el.textContent = seed);
  }

  /* -------- FAQ Accordion -------- */
  function initFAQ() {
    document.querySelectorAll('.faq-question').forEach(btn => {
      btn.addEventListener('click', () => {
        const answer = btn.nextElementSibling;
        const isOpen = btn.classList.contains('open');

        // Close all
        document.querySelectorAll('.faq-question.open').forEach(b => {
          b.classList.remove('open');
          b.nextElementSibling.classList.remove('open');
        });

        // Toggle current
        if (!isOpen) {
          btn.classList.add('open');
          answer.classList.add('open');
        }
      });
    });
  }

  /* -------- Exit Intent Popup -------- */
  function initExitIntent() {
    const overlay = document.querySelector('#exit-overlay');
    if (!overlay) return;
    if (sessionStorage.getItem('exitShown')) return;

    let triggered = false;
    document.addEventListener('mouseleave', e => {
      if (e.clientY < 10 && !triggered) {
        triggered = true;
        sessionStorage.setItem('exitShown', '1');
        overlay.classList.add('show');
      }
    });

    // Mobile: trigger after 30s
    setTimeout(() => {
      if (!triggered) {
        triggered = true;
        sessionStorage.setItem('exitShown', '1');
        overlay.classList.add('show');
      }
    }, 30000);

    overlay.querySelector('.exit-close')?.addEventListener('click', () => overlay.classList.remove('show'));
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.classList.remove('show'); });
  }

  /* -------- Sticky WhatsApp -------- */
  function initStickyWA() {
    const btn = document.querySelector('.sticky-wa');
    if (!btn) return;
    // Show label after 5s
    setTimeout(() => {
      const label = document.querySelector('.sticky-wa-label');
      if (label) {
        label.classList.add('show');
        setTimeout(() => label.classList.remove('show'), 4000);
      }
    }, 5000);
  }

  /* -------- Smooth Scroll -------- */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(a => {
      a.addEventListener('click', e => {
        const target = document.querySelector(a.getAttribute('href'));
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  /* -------- Animate on scroll -------- */
  function initScrollAnim() {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.why-card, .price-card, .review-card, .route-card, .blog-card').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(20px)';
      el.style.transition = 'opacity .5s ease, transform .5s ease';
      observer.observe(el);
    });
  }

  /* -------- Init -------- */
  document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initCurrencySelector();
    initBookingForm();
    initUrgency();
    initFAQ();
    initExitIntent();
    initStickyWA();
    initSmoothScroll();
    initScrollAnim();
  });

})();
