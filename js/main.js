/* === MAIN JAVASCRIPT === */
/* Private Antalya Airport Transfer */

(function () {
  'use strict';

  /* ---- HEADER SCROLL EFFECT ---- */
  const header = document.querySelector('.site-header');
  const stickyBar = document.querySelector('.sticky-bar');

  function onScroll() {
    const scrollY = window.scrollY || window.pageYOffset;

    if (header) {
      header.classList.toggle('scrolled', scrollY > 60);
    }

    if (stickyBar) {
      stickyBar.classList.toggle('visible', scrollY > 400);
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---- MOBILE MENU ---- */
  const menuBtn = document.querySelector('.mobile-menu-btn');
  const mobileNav = document.querySelector('.mobile-nav');

  if (menuBtn && mobileNav) {
    menuBtn.addEventListener('click', function () {
      const isOpen = mobileNav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', isOpen);
      menuBtn.textContent = isOpen ? '✕' : '☰';
    });

    // Close on nav link click
    mobileNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileNav.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
        menuBtn.textContent = '☰';
      });
    });
  }

  /* ---- FAQ ACCORDION ---- */
  document.querySelectorAll('.faq-question').forEach(function (question) {
    question.addEventListener('click', function () {
      const item = question.closest('.faq-item');
      const answer = item.querySelector('.faq-answer');
      const isOpen = item.classList.contains('open');

      // Close all
      document.querySelectorAll('.faq-item').forEach(function (el) {
        el.classList.remove('open');
        const a = el.querySelector('.faq-answer');
        if (a) a.classList.remove('open');
      });

      // Open clicked (if was closed)
      if (!isOpen) {
        item.classList.add('open');
        if (answer) answer.classList.add('open');
      }
    });
  });

  /* ---- SMOOTH SCROLL FOR ANCHOR LINKS ---- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (target) {
        e.preventDefault();
        const headerH = header ? header.offsetHeight : 70;
        const top = target.getBoundingClientRect().top + window.pageYOffset - headerH - 8;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }
    });
  });

  /* ---- INTERSECTION OBSERVER FOR ANIMATIONS ---- */
  if ('IntersectionObserver' in window) {
    const animateEls = document.querySelectorAll(
      '.route-card, .feature-card, .vehicle-card, .review-card, .blog-card, .step-item'
    );

    const observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );

    animateEls.forEach(function (el, i) {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = 'opacity 0.5s ease ' + i * 0.05 + 's, transform 0.5s ease ' + i * 0.05 + 's';
      observer.observe(el);
    });
  }

  /* ---- BOOKING BUTTON TRACKING ---- */
  document.querySelectorAll('[data-cta]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const label = btn.getAttribute('data-cta') || 'unknown';
      // Analytics hook - replace with real implementation
      if (window.gtag) {
        window.gtag('event', 'cta_click', { event_label: label });
      }
    });
  });

  /* ---- LAZY LOAD IMAGES ---- */
  if ('loading' in HTMLImageElement.prototype) {
    document.querySelectorAll('img[data-src]').forEach(function (img) {
      img.src = img.dataset.src;
    });
  } else if ('IntersectionObserver' in window) {
    const imgObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          const img = entry.target;
          img.src = img.dataset.src;
          imgObserver.unobserve(img);
        }
      });
    });
    document.querySelectorAll('img[data-src]').forEach(function (img) {
      imgObserver.observe(img);
    });
  }

})();
