/* ============================================================
   Private Antalya Airport Transfer – Main JS
   ============================================================ */

(function () {
  'use strict';

  /* ── Mobile nav toggle ──────────────────────────────────── */
  const navToggle = document.getElementById('navToggle');
  const navMobile = document.getElementById('navMobile');
  if (navToggle && navMobile) {
    navToggle.addEventListener('click', () => {
      const open = navMobile.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('click', (e) => {
      if (!navToggle.contains(e.target) && !navMobile.contains(e.target)) {
        navMobile.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ── Sticky header shrink ───────────────────────────────── */
  const header = document.querySelector('.site-header');
  if (header) {
    const onScroll = () => {
      header.style.boxShadow = window.scrollY > 60
        ? '0 4px 24px rgba(0,0,0,.25)'
        : '0 2px 16px rgba(0,0,0,.2)';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  /* ── FAQ Accordion ──────────────────────────────────────── */
  document.querySelectorAll('.faq-item__question').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item = btn.closest('.faq-item');
      const isOpen = item.classList.contains('open');
      // Close all
      document.querySelectorAll('.faq-item.open').forEach((el) => el.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });

  /* ── Booking Form Helper – build WhatsApp message ────────── */
  function buildWhatsAppMessage(form) {
    const get = (name) => {
      const el = form.querySelector(`[name="${name}"]`);
      return el ? el.value.trim() : '';
    };
    const direction  = get('direction');
    const from       = get('from');
    const to         = get('to');
    const date       = get('date');
    const time       = get('time');
    const pax        = get('passengers');
    const name       = get('name');
    const phone      = get('phone');
    const vehicle    = get('vehicle');
    const notes      = get('notes');

    const fromLabel = direction === 'from-airport' ? 'Antalya Airport (AYT)' : from || 'Antalya Airport (AYT)';
    const toLabel   = direction === 'from-airport' ? to : 'Antalya Airport (AYT)';

    return encodeURIComponent(
      `Hi, I'd like to book a private transfer:\n\n` +
      `From: ${fromLabel}\n` +
      `To: ${toLabel}\n` +
      `Date: ${date}\n` +
      `Time: ${time}\n` +
      `Passengers: ${pax}\n` +
      `Vehicle: ${vehicle || 'Any'}\n` +
      `Name: ${name}\n` +
      `Phone: ${phone}\n` +
      (notes ? `Notes: ${notes}\n` : '') +
      `\nPlease confirm availability and price. Thank you!`
    );
  }

  /* ── Booking Form Submit ────────────────────────────────── */
  document.querySelectorAll('.booking-form').forEach((form) => {
    const directionSel = form.querySelector('[name="direction"]');
    const fromGroup    = form.querySelector('.from-group');
    const toggleFrom   = () => {
      if (!fromGroup) return;
      fromGroup.style.display = directionSel && directionSel.value === 'to-airport' ? 'block' : 'none';
    };
    if (directionSel) {
      directionSel.addEventListener('change', toggleFrom);
      toggleFrom();
    }

    form.addEventListener('submit', (e) => {
      e.preventDefault();
      if (!validateForm(form)) return;
      const msg   = buildWhatsAppMessage(form);
      const phone = '905321234567'; // replace with actual WhatsApp business number
      window.open(`https://wa.me/${phone}?text=${msg}`, '_blank', 'noopener,noreferrer');
    });
  });

  function validateForm(form) {
    let valid = true;
    form.querySelectorAll('[required]').forEach((field) => {
      const wrapper = field.closest('.form-group') || field.parentElement;
      let err = wrapper.querySelector('.form-error');
      if (!field.value.trim()) {
        valid = false;
        field.style.borderColor = '#ef4444';
        if (!err) {
          err = document.createElement('span');
          err.className = 'form-error';
          err.style.cssText = 'color:#ef4444;font-size:.78rem;display:block;margin-top:4px;';
          err.textContent = 'This field is required.';
          wrapper.appendChild(err);
        }
      } else {
        field.style.borderColor = '';
        if (err) err.remove();
      }
    });
    return valid;
  }

  /* ── Animate counters in stats section ──────────────────── */
  const counters = document.querySelectorAll('[data-count]');
  if (counters.length) {
    const animateCount = (el) => {
      const target = parseFloat(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const duration = 1800;
      const step = target / (duration / 16);
      let current = 0;
      const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        el.textContent = (Number.isInteger(target) ? Math.round(current) : current.toFixed(1)) + suffix;
      }, 16);
    };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach((el) => observer.observe(el));
  }

  /* ── Smooth scroll for anchor links ─────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id  = a.getAttribute('href').slice(1);
      const el  = document.getElementById(id);
      if (el) {
        e.preventDefault();
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (navMobile) navMobile.classList.remove('open');
      }
    });
  });

  /* ── Scroll-reveal via IntersectionObserver ──────────────── */
  const style = document.createElement('style');
  style.textContent = `.reveal{opacity:0;transform:translateY(24px);transition:opacity .55s ease,transform .55s ease;}.reveal.visible{opacity:1;transform:none;}`;
  document.head.appendChild(style);

  const revealEls = document.querySelectorAll('.feature-card, .route-card, .fleet-card, .testimonial-card, .step, .faq-item');
  const revealObs = new IntersectionObserver((entries) => {
    entries.forEach((e, i) => {
      if (e.isIntersecting) {
        e.target.classList.add('reveal');
        setTimeout(() => e.target.classList.add('visible'), i * 60);
        revealObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach((el) => revealObs.observe(el));

})();
