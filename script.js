/* ═══════════════════════════════════════════════════════════
   THEME — apply before first paint
═══════════════════════════════════════════════════════════ */
(function () {
  if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark');
  }
})();

document.getElementById('themeToggle').addEventListener('click', function () {
  document.body.classList.toggle('dark');
  localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
});

/* ═══════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════ */
function isDark() {
  return document.body.classList.contains('dark');
}

/* ═══════════════════════════════════════════════════════════
   DOT GRID BACKGROUND
═══════════════════════════════════════════════════════════ */
(function () {
  var canvas  = document.getElementById('dotGrid');
  var ctx     = canvas.getContext('2d');
  var dots    = [];
  var GAP     = 36;
  var RAD     = 1.2;
  var lastT   = 0;

  function buildDots() {
    dots = [];
    var cols = Math.ceil(canvas.width  / GAP) + 2;
    var rows = Math.ceil(canvas.height / GAP) + 2;
    for (var r = 0; r < rows; r++) {
      for (var c = 0; c < cols; c++) {
        dots.push({
          x:     c * GAP,
          y:     r * GAP,
          phase: Math.random() * Math.PI * 2,
          freq:  0.00035 + Math.random() * 0.00025,
        });
      }
    }
  }

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    buildDots();
  }

  function frame(ts) {
    var dt = ts - lastT;
    lastT = ts;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var dark   = isDark();
    var dotRgb = dark ? '41,151,255' : '0,113,227';
    var minA   = dark ? 0.08 : 0.10;
    var maxA   = dark ? 0.28 : 0.28;

    for (var i = 0; i < dots.length; i++) {
      var d = dots[i];
      d.phase += d.freq * dt;
      var alpha = minA + (maxA - minA) * (0.5 + 0.5 * Math.sin(d.phase));
      ctx.beginPath();
      ctx.arc(d.x, d.y, RAD, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(' + dotRgb + ',' + alpha.toFixed(3) + ')';
      ctx.fill();
    }

    requestAnimationFrame(frame);
  }

  window.addEventListener('resize', resize, { passive: true });
  resize();
  requestAnimationFrame(frame);
})();

/* ═══════════════════════════════════════════════════════════
   SCROLL PROGRESS BAR
═══════════════════════════════════════════════════════════ */
var bar = document.getElementById('scrollProgress');
function updateBar() {
  var total = document.documentElement.scrollHeight - window.innerHeight;
  bar.style.width = (total > 0 ? (window.scrollY / total) * 100 : 0) + '%';
}
window.addEventListener('scroll', updateBar, { passive: true });
updateBar();

/* ═══════════════════════════════════════════════════════════
   SECTION REVEAL
═══════════════════════════════════════════════════════════ */
function revealSection(s) { s.classList.add('visible'); }

var secObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting) { revealSection(e.target); secObs.unobserve(e.target); }
  });
}, { threshold: 0 });

document.querySelectorAll('section').forEach(function (s) {
  var r = s.getBoundingClientRect();
  if (r.top < window.innerHeight && r.bottom > 0) revealSection(s);
  else secObs.observe(s);
});

/* ═══════════════════════════════════════════════════════════
   SKILL TABS
═══════════════════════════════════════════════════════════ */
var skillsAnimatedPanels = {};

function animatePanelBars(panelId) {
  if (skillsAnimatedPanels[panelId]) return;
  skillsAnimatedPanels[panelId] = true;

  var panel = document.querySelector('[data-panel="' + panelId + '"]');
  if (!panel) return;

  panel.querySelectorAll('.skill-fill').forEach(function (fill) {
    var w = fill.getAttribute('data-w') || '0';
    fill.style.width = '0';
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        fill.style.width = w + '%';
      });
    });
  });
}

// Tab click switching
document.querySelectorAll('.skill-tab').forEach(function (tab) {
  tab.addEventListener('click', function () {
    var target = tab.getAttribute('data-tab');

    // Deactivate all tabs and panels
    document.querySelectorAll('.skill-tab').forEach(function (t) {
      t.classList.remove('active');
    });
    document.querySelectorAll('.skill-panel').forEach(function (p) {
      p.classList.remove('active');
    });

    // Activate clicked tab and matching panel
    tab.classList.add('active');
    var panel = document.querySelector('[data-panel="' + target + '"]');
    if (panel) {
      panel.classList.add('active');
      animatePanelBars(target);
    }
  });
});

// Animate the initially active panel when skills section enters view
var skillsSection = document.getElementById('skills');
var skillsFirstAnimate = false;

var skillObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting && !skillsFirstAnimate) {
      skillsFirstAnimate = true;
      var activeTab = document.querySelector('.skill-tab.active');
      if (activeTab) {
        animatePanelBars(activeTab.getAttribute('data-tab'));
      }
      skillObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

if (skillsSection) skillObs.observe(skillsSection);

/* ═══════════════════════════════════════════════════════════
   STAT COUNTERS
═══════════════════════════════════════════════════════════ */
function animateCount(el) {
  var target = parseInt(el.getAttribute('data-target'), 10);
  if (isNaN(target)) return;
  var dur = 900, t0 = performance.now();
  function tick(now) {
    var p = Math.min((now - t0) / dur, 1);
    el.textContent = Math.round((1 - Math.pow(1 - p, 3)) * target);
    if (p < 1) requestAnimationFrame(tick); else el.textContent = target;
  }
  requestAnimationFrame(tick);
}

var statObs = new IntersectionObserver(function (entries) {
  entries.forEach(function (e) {
    if (e.isIntersecting && !e.target.dataset.done) {
      e.target.dataset.done = '1';
      animateCount(e.target);
      statObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1 });

document.querySelectorAll('.stat-number').forEach(function (el) { statObs.observe(el); });

/* ═══════════════════════════════════════════════════════════
   SMOOTH SCROLL
═══════════════════════════════════════════════════════════ */
document.querySelectorAll('a[href^="#"]').forEach(function (a) {
  a.addEventListener('click', function (e) {
    var target = document.querySelector(a.getAttribute('href'));
    if (!target) return;
    e.preventDefault();
    revealSection(target);
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
});

/* ═══════════════════════════════════════════════════════════
   FOOTER YEAR
═══════════════════════════════════════════════════════════ */
var yearEl = document.getElementById('footerYear');
if (yearEl) yearEl.textContent = new Date().getFullYear();

/* ═══════════════════════════════════════════════════════════
   PROJECT CURSOR TOOLTIP
═══════════════════════════════════════════════════════════ */
(function () {
  var tooltip  = document.getElementById('projTooltip');
  var ttTitle  = document.getElementById('projTtTitle');
  var ttDesc   = document.getElementById('projTtDesc');
  var ttTags   = document.getElementById('projTtTags');
  if (!tooltip) return;

  var mouseX = 0, mouseY = 0;
  var isHovering = false;

  // Track cursor globally
  document.addEventListener('mousemove', function (e) {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (isHovering) positionTooltip();
  });

  function positionTooltip() {
    var tw = tooltip.offsetWidth  || 240;
    var th = tooltip.offsetHeight || 130;
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    var offset = 18;

    var left = mouseX + offset;
    var top  = mouseY + offset;

    // Flip left if overflowing right edge
    if (left + tw > vw - 8) left = mouseX - tw - offset;
    // Flip up if overflowing bottom edge
    if (top + th > vh - 8)  top  = mouseY - th - offset;

    tooltip.style.left = left + 'px';
    tooltip.style.top  = top  + 'px';
  }

  document.querySelectorAll('.project-card').forEach(function (card) {
    card.addEventListener('mouseenter', function () {
      var title = card.getAttribute('data-title') || '';
      var desc  = card.getAttribute('data-desc')  || '';
      var tags  = (card.getAttribute('data-tags') || '').split(',').map(function (t) { return t.trim(); }).filter(Boolean);

      ttTitle.textContent = title;
      ttDesc.textContent  = desc;
      ttTags.innerHTML    = tags.map(function (t) {
        return '<span class="proj-tag">' + t + '</span>';
      }).join('');

      positionTooltip();
      isHovering = true;
      tooltip.classList.add('visible');
    });

    card.addEventListener('mouseleave', function () {
      isHovering = false;
      tooltip.classList.remove('visible');
    });
  });
})();
