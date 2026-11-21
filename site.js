(function () {
  var WEDDING = new Date('2027-02-13T00:00:00+01:00');

  // ----- Sticky header: appears after the hero on the home page -----
  var header = document.querySelector('.site-header');
  var hero = document.querySelector('.hero');
  if (header && hero) {
    var onScroll = function () {
      header.classList.toggle('show', window.scrollY > hero.offsetHeight - 90);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ----- Mobile drawer -----
  var drawer = document.querySelector('.drawer');
  document.querySelectorAll('.menu-btn').forEach(function (b) {
    b.addEventListener('click', function () { drawer && drawer.classList.add('open'); });
  });
  if (drawer) {
    drawer.addEventListener('click', function (e) {
      if (e.target === drawer || e.target.closest('.close') || e.target.closest('a')) drawer.classList.remove('open');
    });
  }

  // ----- Countdown -----
  var cd = document.querySelector('.countdown');
  if (cd) {
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var set = function (k, v) { var el = cd.querySelector('[data-k="' + k + '"]'); if (el) el.textContent = pad(v); };
    var tick = function () {
      var now = new Date();
      if (now >= WEDDING) { ['months', 'days', 'hours', 'minutes', 'seconds'].forEach(function (k) { set(k, 0); }); return; }
      // whole calendar months first, then the remainder
      var months = (WEDDING.getFullYear() - now.getFullYear()) * 12 + (WEDDING.getMonth() - now.getMonth());
      var anchor = new Date(now); anchor.setMonth(now.getMonth() + months);
      if (anchor > WEDDING) { months--; anchor = new Date(now); anchor.setMonth(now.getMonth() + months); }
      var diff = WEDDING - anchor;
      set('months', months);
      set('days', Math.floor(diff / 86400000));
      set('hours', Math.floor(diff % 86400000 / 3600000));
      set('minutes', Math.floor(diff % 3600000 / 60000));
      set('seconds', Math.floor(diff % 60000 / 1000));
    };
    tick(); setInterval(tick, 1000);
  }

  // ----- Photo strip carousel -----
  document.querySelectorAll('.strip').forEach(function (strip) {
    var track = strip.querySelector('.track');
    var i = 0;
    var perView = function () { return window.innerWidth <= 860 ? 3 : 6; };
    var go = function (d) {
      var max = Math.max(0, track.children.length - perView());
      i = i + d > max ? 0 : i + d < 0 ? max : i + d;
      var w = track.children[0].getBoundingClientRect().width + 4;
      track.style.transform = 'translateX(' + (-i * w) + 'px)';
    };
    strip.querySelector('.prev').addEventListener('click', function () { go(-1); });
    strip.querySelector('.next').addEventListener('click', function () { go(1); });
    var auto = setInterval(function () { go(1); }, 4000);
    strip.addEventListener('mouseenter', function () { clearInterval(auto); });
    window.addEventListener('resize', function () { i = 0; track.style.transform = 'none'; });
  });

  // ----- Lightbox for any [data-zoom] image -----
  var zoomables = Array.prototype.slice.call(document.querySelectorAll('[data-zoom] img'));
  if (zoomables.length) {
    var lb = document.createElement('div');
    lb.className = 'lightbox';
    lb.innerHTML = '<img alt=""><button class="x" aria-label="Close">&times;</button><button class="p" aria-label="Previous">&lsaquo;</button><button class="n" aria-label="Next">&rsaquo;</button>';
    document.body.appendChild(lb);
    var big = lb.querySelector('img');
    var cur = 0;
    var show = function (k) { cur = (k + zoomables.length) % zoomables.length; big.src = zoomables[cur].src; big.alt = zoomables[cur].alt; lb.classList.add('open'); };
    var close = function () { lb.classList.remove('open'); };
    zoomables.forEach(function (img, k) { img.addEventListener('click', function () { show(k); }); });
    lb.querySelector('.x').addEventListener('click', close);
    lb.querySelector('.p').addEventListener('click', function (e) { e.stopPropagation(); show(cur - 1); });
    lb.querySelector('.n').addEventListener('click', function (e) { e.stopPropagation(); show(cur + 1); });
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(cur - 1);
      if (e.key === 'ArrowRight') show(cur + 1);
    });
  }

  // ----- Add to calendar (.ics download) -----
  document.querySelectorAll('[data-calendar]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var ics = [
        'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//IfeoluwaIfeoma//Wedding//EN', 'BEGIN:VEVENT',
        'UID:ifeoluwa-ifeoma-20270213',
        'DTSTAMP:20260101T000000Z',
        'DTSTART;VALUE=DATE:20270213', 'DTEND;VALUE=DATE:20270214',
        'SUMMARY:Ifeoluwa & Ifeoma — Engagement & Reception',
        'LOCATION:Dapo Aderogba Hall\\, NUJ Press Centre\\, No. 2 Simeon Adebo Avenue\\, Iyaganku GRA\\, Ibadan\\, Oyo State',
        'END:VEVENT', 'END:VCALENDAR'
      ].join('\r\n');
      var a = document.createElement('a');
      a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
      a.download = 'ifeoluwa-and-ifeoma.ics';
      document.body.appendChild(a); a.click(); a.remove();
    });
  });

  // ----- Copy account numbers -----
  document.querySelectorAll('[data-copy]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var text = btn.getAttribute('data-copy');
      var done = function () {
        var old = btn.textContent; btn.textContent = 'Copied'; btn.classList.add('done');
        setTimeout(function () { btn.textContent = old; btn.classList.remove('done'); }, 1800);
      };
      if (navigator.clipboard) navigator.clipboard.writeText(text).then(done, done); else done();
    });
  });

  // ----- Reveal on scroll (with a safety net so nothing stays hidden) -----
  var targets = Array.prototype.slice.call(document.querySelectorAll('.reveal'));
  var reveal = function (el) { el.classList.add('in'); };
  setTimeout(function () { targets.forEach(reveal); }, 4000);
  if (!('IntersectionObserver' in window)) { targets.forEach(reveal); }
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) { reveal(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.12 });
    targets.forEach(function (el) { io.observe(el); });
  }
})();
