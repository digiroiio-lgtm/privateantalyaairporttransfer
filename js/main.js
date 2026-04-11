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

  /* ================================================================
     RIDE SEARCH WIDGET
     ================================================================ */

  var RS = {
    /* state */
    selectedDate: null,     // Date object
    selectedTime: null,     // 'HH:MM' string or null (null = Now)
    isReturn: false,
    passengers: { adults: 1, children: 0, infants: 0 },
    calOffset: 0,           // months offset from current for left calendar

    /* DOM refs */
    dateBtn:    null,
    calPopup:   null,
    dateDisplay:null,
    timeDisplay:null,
    returnBtn:  null,
    paxTrigger: null,
    paxDropdown:null,
    calMonths:  null,
    timeInput:  null,
    timeNowChk: null,

    /* ---- init ---- */
    init: function () {
      var self = this;

      self.dateBtn     = document.getElementById('rs-datetime-btn');
      self.calPopup    = document.getElementById('rs-calendar-popup');
      self.dateDisplay = document.getElementById('rs-date-display');
      self.timeDisplay = document.getElementById('rs-time-display');
      self.returnBtn   = document.getElementById('rs-return-btn');
      self.paxTrigger  = document.getElementById('rs-pax-trigger');
      self.paxDropdown = document.getElementById('rs-pax-dropdown');
      self.calMonths   = document.getElementById('rs-cal-months');
      self.timeInput   = document.getElementById('rs-time-input');
      self.timeNowChk  = document.getElementById('rs-time-now-chk');

      if (!self.dateBtn) return; // widget not on this page

      // Pre-select today
      self.selectedDate = new Date();
      self.selectedDate.setHours(0, 0, 0, 0);
      self.updateDateDisplay();

      /* date/time button */
      self.dateBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = !self.calPopup.hidden;
        self.closePax();
        if (isOpen) {
          self.closeCalendar();
        } else {
          self.openCalendar();
        }
      });

      /* prev/next month */
      document.getElementById('rs-cal-prev').addEventListener('click', function () {
        self.calOffset--;
        self.renderCalendar();
      });
      document.getElementById('rs-cal-next').addEventListener('click', function () {
        self.calOffset++;
        self.renderCalendar();
      });

      /* confirm & cancel */
      document.getElementById('rs-cal-confirm').addEventListener('click', function () {
        self.closeCalendar();
        self.updateDateDisplay();
      });
      document.getElementById('rs-cal-cancel').addEventListener('click', function () {
        self.closeCalendar();
      });

      /* time input */
      self.timeInput.addEventListener('change', function () {
        self.timeNowChk.checked = false;
        self.selectedTime = self.timeInput.value;
        self.updateTimeDisplay();
      });

      /* "Now" checkbox */
      self.timeNowChk.addEventListener('change', function () {
        if (self.timeNowChk.checked) {
          self.selectedTime = null;
          self.updateTimeDisplay();
        }
      });

      /* return toggle */
      self.returnBtn.addEventListener('click', function () {
        self.isReturn = !self.isReturn;
        self.returnBtn.setAttribute('aria-pressed', self.isReturn ? 'true' : 'false');
      });

      /* passengers trigger */
      self.paxTrigger.addEventListener('click', function (e) {
        e.stopPropagation();
        var isOpen = !self.paxDropdown.hidden;
        self.closeCalendar();
        if (isOpen) {
          self.closePax();
        } else {
          self.openPax();
        }
      });

      /* passenger +/- buttons */
      document.querySelectorAll('.rs-pax-minus, .rs-pax-plus').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var type  = btn.getAttribute('data-type');
          var delta = btn.classList.contains('rs-pax-plus') ? 1 : -1;
          var min   = type === 'adults' ? 1 : 0;
          self.passengers[type] = Math.max(min, (self.passengers[type] || 0) + delta);
          self.renderPassengerCounts();
          self.updatePaxLabel();
        });
      });

      /* done button */
      document.getElementById('rs-pax-done').addEventListener('click', function () {
        self.closePax();
      });

      /* close on outside click */
      document.addEventListener('click', function () {
        self.closeCalendar();
        self.closePax();
      });

      /* search button */
      var searchBtn = document.getElementById('rs-search-btn');
      if (searchBtn) {
        searchBtn.addEventListener('click', function () {
          var pickup  = document.getElementById('rs-pickup').value.trim();
          var dropoff = document.getElementById('rs-dropoff').value.trim();
          if (!pickup || !dropoff) {
            if (!pickup) document.getElementById('rs-pickup').focus();
            else document.getElementById('rs-dropoff').focus();
            return;
          }
          /* scroll to destinations / booking section */
          var target = document.getElementById('booking') || document.getElementById('destinations');
          if (target) {
            var hh = header ? header.offsetHeight : 70;
            window.scrollTo({ top: target.getBoundingClientRect().top + window.pageYOffset - hh - 8, behavior: 'smooth' });
          }
        });
      }

      /* initial passenger label */
      self.updatePaxLabel();
    },

    /* ---- calendar ---- */
    openCalendar: function () {
      var self = this;
      self.calPopup.hidden = false;
      self.dateBtn.setAttribute('aria-expanded', 'true');
      self.calOffset = 0;
      self.renderCalendar();
    },

    closeCalendar: function () {
      var self = this;
      if (!self.calPopup) return;
      self.calPopup.hidden = true;
      if (self.dateBtn) self.dateBtn.setAttribute('aria-expanded', 'false');
    },

    renderCalendar: function () {
      var self = this;
      var now   = new Date();
      now.setHours(0, 0, 0, 0);
      var base  = new Date(now.getFullYear(), now.getMonth() + self.calOffset, 1);
      var next  = new Date(base.getFullYear(), base.getMonth() + 1, 1);

      self.calMonths.innerHTML =
        self.buildMonth(base, now) +
        self.buildMonth(next, now);

      /* attach day click events */
      self.calMonths.querySelectorAll('.rs-cal-day[data-ts]').forEach(function (cell) {
        cell.addEventListener('click', function () {
          var ts = parseInt(cell.getAttribute('data-ts'), 10);
          if (isNaN(ts)) return;
          var d = new Date(ts);
          if (d < now) return;
          self.selectedDate = d;
          self.renderCalendar(); // re-render to update selection
        });
      });
    },

    buildMonth: function (firstDay, today) {
      var self = this;
      var DAYS = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
      var MONTHS = ['JANUARY','FEBRUARY','MARCH','APRIL','MAY','JUNE',
                    'JULY','AUGUST','SEPTEMBER','OCTOBER','NOVEMBER','DECEMBER'];

      var year  = firstDay.getFullYear();
      var month = firstDay.getMonth();

      /* day of week Mon=0 … Sun=6 */
      var startDow = (firstDay.getDay() + 6) % 7;
      var daysInMonth = new Date(year, month + 1, 0).getDate();

      var html = '<div class="rs-cal-month">';
      html += '<div class="rs-cal-month-title">' + MONTHS[month] + ' ' + year + '</div>';
      html += '<div class="rs-cal-grid">';

      /* day-of-week headers */
      DAYS.forEach(function (d) {
        html += '<div class="rs-cal-dow">' + d + '</div>';
      });

      /* empty leading cells */
      for (var e = 0; e < startDow; e++) {
        html += '<div class="rs-cal-day rs-cal-day--empty"></div>';
      }

      /* day cells */
      for (var d = 1; d <= daysInMonth; d++) {
        var date = new Date(year, month, d);
        var ts   = date.getTime();

        var cls = 'rs-cal-day';
        if (date < today) cls += ' rs-cal-day--past';
        if (date.getTime() === today.getTime()) cls += ' rs-cal-day--today';
        if (self.selectedDate && date.getTime() === self.selectedDate.getTime()) cls += ' rs-cal-day--selected';

        var attrs = date < today ? '' : ' data-ts="' + ts + '" tabindex="0" role="button" aria-label="' + d + ' ' + (month + 1) + ' ' + year + '"';
        html += '<div class="' + cls + '"' + attrs + '>' + d + '</div>';
      }

      html += '</div></div>';
      return html;
    },

    /* ---- date/time display ---- */
    updateDateDisplay: function () {
      var self = this;
      if (!self.dateDisplay) return;
      var MONTHS_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
      if (self.selectedDate) {
        self.dateDisplay.textContent =
          self.selectedDate.getDate() + ' ' +
          MONTHS_SHORT[self.selectedDate.getMonth()] + ' ' +
          self.selectedDate.getFullYear();
      }
    },

    updateTimeDisplay: function () {
      var self = this;
      if (!self.timeDisplay) return;
      self.timeDisplay.textContent = self.selectedTime ? self.selectedTime : 'Now';
    },

    /* ---- passengers ---- */
    openPax: function () {
      var self = this;
      self.paxDropdown.hidden = false;
      self.paxTrigger.setAttribute('aria-expanded', 'true');
      self.renderPassengerCounts();
    },

    closePax: function () {
      var self = this;
      if (!self.paxDropdown) return;
      self.paxDropdown.hidden = true;
      if (self.paxTrigger) self.paxTrigger.setAttribute('aria-expanded', 'false');
    },

    renderPassengerCounts: function () {
      var self = this;
      document.getElementById('rs-adults-count').textContent   = self.passengers.adults;
      document.getElementById('rs-children-count').textContent = self.passengers.children;
      document.getElementById('rs-infants-count').textContent  = self.passengers.infants;

      /* disable minus buttons at minimum */
      document.querySelectorAll('.rs-pax-minus').forEach(function (btn) {
        var type = btn.getAttribute('data-type');
        var min  = type === 'adults' ? 1 : 0;
        btn.disabled = self.passengers[type] <= min;
      });
    },

    updatePaxLabel: function () {
      var self = this;
      var total = self.passengers.adults + self.passengers.children + self.passengers.infants;
      var label = document.getElementById('rs-pax-label');
      if (label) {
        label.textContent = total + (total === 1 ? ' Passenger' : ' Passengers');
      }
    }
  };

  /* Boot ride-search widget on DOMContentLoaded */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { RS.init(); });
  } else {
    RS.init();
  }

})();
