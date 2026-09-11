'use strict';

/* ============================================================
   InNoVarr.Xxx — Final Optimized Script
   ✅ Fix F5: mỗi lần load → reset về hero screen
   ✅ Không khung vuông khi long press trên mobile
   ✅ Ultra smooth 60fps
   ============================================================ */

const $ = (id) => document.getElementById(id);
const isTouch = matchMedia('(hover: none) and (pointer: coarse)').matches;
const prefersReducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- 0. RESET STATE KHI F5 ---------- */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
window.scrollTo(0, 0);
document.body.classList.remove('scrollable', 'qr-modal-open');
document.documentElement.classList.remove('orientation-changing');

/* ---------- 0.1 CHỐNG LONG PRESS / CONTEXT MENU TRÊN MOBILE ---------- */
document.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  return false;
}, { passive: false });

document.addEventListener('selectstart', (e) => {
  if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
    e.preventDefault();
  }
}, { passive: false });

document.addEventListener('dragstart', (e) => {
  e.preventDefault();
  return false;
});

if (isTouch) {
  // Chặn long-press callout trên iOS
  document.addEventListener('touchstart', (e) => {
    const target = e.target;
    if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
      if (target.style) {
        target.style.webkitTouchCallout = 'none';
        target.style.webkitUserSelect = 'none';
      }
    }
  }, { passive: true });

  // Chặn double-tap zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
      e.preventDefault();
    }
    lastTouchEnd = now;
  }, { passive: false });
}

// Clear selection khi mouseup
document.addEventListener('mouseup', () => {
  if (window.getSelection) {
    const sel = window.getSelection();
    if (sel && sel.rangeCount) sel.removeAllRanges();
  }
});

/* ---------- 1. LOADING SCREEN ---------- */
const loadingScreen = $('loading-screen');

function hideLoader() {
  loadingScreen?.classList.add('hidden');
  document.querySelectorAll('.reveal').forEach((el) => {
    if (el.getBoundingClientRect().top < innerHeight) el.classList.add('visible');
  });
}

const loaderTimeout = setTimeout(hideLoader, 1800);
window.addEventListener('load', () => {
  clearTimeout(loaderTimeout);
  window.scrollTo(0, 0);
  setTimeout(hideLoader, 600);
}, { once: true });

/* ---------- 2. PARTICLES ---------- */
const canvas = $('particle-canvas');
const ctx = canvas?.getContext('2d', { alpha: true });
const PARTICLE_COUNT = isTouch ? 18 : 30;
const particles = [];
let animId = null;

function resizeCanvas() {
  if (!canvas || !ctx) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  canvas.width = innerWidth * dpr;
  canvas.height = innerHeight * dpr;
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

class Particle {
  constructor() { this.reset(true); }
  reset(initial = false) {
    this.x = Math.random() * innerWidth;
    this.y = initial ? Math.random() * innerHeight : -10;
    this.size = Math.random() * 1.8 + 0.5;
    this.vx = (Math.random() - 0.5) * 0.15;
    this.vy = (Math.random() - 0.5) * 0.15;
    this.opacity = Math.random() * 0.35 + 0.08;
    this.phase = Math.random() * Math.PI * 2;
  }
  update() {
    this.phase += 0.012;
    this.x += this.vx + Math.sin(this.phase) * 0.05;
    this.y += this.vy + Math.cos(this.phase) * 0.05;
    if (this.x < 0 || this.x > innerWidth) this.vx *= -1;
    if (this.y < 0 || this.y > innerHeight) this.vy *= -1;
  }
  draw() {
    const alpha = this.opacity * (0.7 + 0.3 * Math.sin(this.phase));
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(192,132,252,${alpha})`;
    ctx.fill();
  }
}

function initParticles() {
  if (!ctx) return;
  resizeCanvas();
  particles.length = 0;
  for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new Particle());
}

function animateParticles() {
  if (!ctx || document.hidden) return;
  ctx.clearRect(0, 0, innerWidth, innerHeight);
  for (const p of particles) { p.update(); p.draw(); }
  animId = requestAnimationFrame(animateParticles);
}

function stopParticles() {
  if (animId) { cancelAnimationFrame(animId); animId = null; }
}

/* ---------- 3. STARS ---------- */
function createStars() {
  const container = $('starContainer');
  if (!container) return;
  const frag = document.createDocumentFragment();
  const emojis = ['✦', '✧', '✨', '⭐'];
  const count = isTouch ? 25 : 40;
  for (let i = 0; i < count; i++) {
    const star = document.createElement('div');
    star.className = 'star';
    star.textContent = emojis[(Math.random() * emojis.length) | 0];
    star.style.cssText = `left:${Math.random() * 94 + 3}%;top:${Math.random() * 94 + 3}%;font-size:${Math.random() * 1.2 + 0.4}rem;opacity:${Math.random() * 0.4 + 0.15};--duration:${Math.random() * 5 + 3}s;animation-delay:${Math.random() * 6}s;`;
    frag.appendChild(star);
  }
  container.appendChild(frag);
}

/* ---------- 4. MUSIC ---------- */
const audio = $('backgroundMusic');
const musicBtn = $('musicBtn');
const volumeSlider = $('volumeSlider');
const volumeValue = $('volumeValue');
let musicOn = false;
let rampId = null;

function updateVolumeUI() {
  const p = Math.round(audio.volume * 100);
  if (volumeSlider) volumeSlider.value = p;
  if (volumeValue) volumeValue.textContent = p + '%';
  const icon = musicBtn?.querySelector('i');
  if (icon) icon.className = musicOn ? 'fas fa-volume-up' : 'fas fa-volume-mute';
  musicBtn?.classList.toggle('playing', musicOn);
}

function rampVolume(target, duration = 500, done) {
  if (rampId) cancelAnimationFrame(rampId);
  const start = audio.volume;
  const t0 = performance.now();
  const step = (t) => {
    const k = Math.min((t - t0) / duration, 1);
    audio.volume = Math.max(0, Math.min(1, start + (target - start) * k));
    updateVolumeUI();
    if (k < 1) rampId = requestAnimationFrame(step);
    else { audio.volume = target; updateVolumeUI(); done?.(); }
  };
  rampId = requestAnimationFrame(step);
}

async function playMusic() {
  if (musicOn) return;
  musicOn = true;
  try {
    await audio.play();
    rampVolume(1, 600);
  } catch { musicOn = false; }
  updateVolumeUI();
}

function pauseMusic() {
  if (!musicOn) return;
  musicOn = false;
  updateVolumeUI();
  rampVolume(0, 400, () => audio.pause());
}

function stopMusic() {
  if (rampId) cancelAnimationFrame(rampId);
  musicOn = false;
  audio.pause();
  try { audio.currentTime = 0; } catch {}
  updateVolumeUI();
}

musicBtn?.addEventListener('click', (e) => {
  e.stopPropagation();
  musicOn ? pauseMusic() : playMusic();
});

volumeSlider?.addEventListener('input', (e) => {
  const v = Math.max(0, Math.min(1, +e.target.value / 100));
  if (v === 0) { stopMusic(); return; }
  if (!musicOn) { audio.volume = v; playMusic(); } else audio.volume = v;
  updateVolumeUI();
});

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { stopMusic(); stopParticles(); }
  else { if (!particles.length) initParticles(); animateParticles(); }
});

/* ---------- 5. HERO → MAIN ---------- */
const heroSection = $('heroSection');
const heroClick = $('heroClick');
const mainContent = $('mainContent');
let isMainVisible = false;

function resetToInitialState() {
  isMainVisible = false;
  heroSection?.classList.remove('hidden');
  mainContent?.classList.remove('visible');
  document.body.classList.remove('scrollable', 'qr-modal-open');
  window.scrollTo(0, 0);
}
resetToInitialState();

heroClick?.addEventListener('click', (e) => {
  e.stopPropagation();
  if (isMainVisible) return;
  isMainVisible = true;
  playMusic();
  heroSection.classList.add('hidden');
  mainContent.classList.add('visible');
  document.body.classList.add('scrollable');
  spawnSparkles();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

function spawnSparkles() {
  if (prefersReducedMotion) return;
  const emojis = ['✨', '⭐', '💫'];
  const frag = document.createDocumentFragment();
  for (let i = 0; i < 18; i++) {
    const s = document.createElement('div');
    s.className = 'sparkle';
    s.textContent = emojis[(Math.random() * emojis.length) | 0];
    s.style.cssText = `left:${Math.random() * 80 + 10}vw;top:${Math.random() * 80 + 10}vh;font-size:${Math.random() * 1.4 + 0.6}rem;animation-delay:${i * 40}ms;`;
    frag.appendChild(s);
    setTimeout(() => s.remove(), 1800);
  }
  document.body.appendChild(frag);
}

/* ---------- 6. SOCIAL CARDS ---------- */
const socialData = [
  { brand: 'tiktok',    label: 'TikTok',    username: '@innovarr.xxx',    url: 'https://www.tiktok.com/@innovarr.xxx',  img: 'image/tiktok.png' },
  { brand: 'facebook',  label: 'Facebook',  username: 'nnglinhtam',       url: 'https://www.facebook.com/nnglinhtam',   img: 'image/facebook.png' },
  { brand: 'instagram', label: 'Instagram', username: '@nnglinhtam',      url: 'https://www.instagram.com/nnglinhtam',  img: 'image/instagram.png' },
  { brand: 'zalo',      label: 'Zalo',      username: '0901289316',       url: 'https://zalo.me/0901289316',            img: 'image/zalo.png' },
  { brand: 'github',    label: 'GitHub',    username: 'tamm55',           url: 'https://github.com/tamm55',             img: 'image/github.png' },
  { brand: 'mbbank',    label: 'MBBank',    username: 'Qr Chuyển Khoản',  url: '',                                      img: 'image/mbbank.png' }
];

function buildSocialCards() {
  const grid = $('socialGrid');
  if (!grid) return;
  const frag = document.createDocumentFragment();
  socialData.forEach((item, i) => {
    const card = document.createElement('div');
    card.className = `social-card entry-scale entry-scale-delay-${(i % 3) + 1} float-effect float-effect-delay-${(i % 5) + 1}`;
    card.dataset.url = item.url;
    card.dataset.brand = item.brand;
    card.innerHTML = `
      <div class="social-card-inner">
        <div class="logo-svg"><img src="${item.img}" alt="${item.label}" loading="lazy" decoding="async" draggable="false"></div>
        <span class="platform-name">${item.label}</span>
        <span class="username">${item.username}</span>
      </div>`;
    card.addEventListener('click', (e) => onSocialClick(e, card, item));
    frag.appendChild(card);
  });
  grid.appendChild(frag);
}

function onSocialClick(e, card, item) {
  e.preventDefault();
  if (item.brand === 'mbbank') openQrBank();
  else if (item.url) window.open(item.url, '_blank', 'noopener');
  const rect = card.getBoundingClientRect();
  const ripple = document.createElement('span');
  ripple.className = 'ripple';
  ripple.style.left = (e.clientX - rect.left) + 'px';
  ripple.style.top = (e.clientY - rect.top) + 'px';
  card.appendChild(ripple);
  setTimeout(() => ripple.remove(), 900);
}

/* ---------- 7. QR MODAL ---------- */
let qrModal = null;
function openQrBank() {
  if (!qrModal) {
    qrModal = document.createElement('div');
    qrModal.id = 'qrBankModal';
    qrModal.className = 'qr-bank-modal';
    qrModal.innerHTML = `
      <div class="qr-bank-overlay"></div>
      <div class="qr-bank-box" role="dialog" aria-modal="true" aria-label="QR Bank">
        <button class="qr-bank-close" type="button" aria-label="Đóng">×</button>
        <img src="image/qr-bank.png" alt="QR Bank" loading="lazy" draggable="false">
      </div>`;
    document.body.appendChild(qrModal);
    const close = () => {
      qrModal.classList.remove('show');
      document.body.classList.remove('qr-modal-open');
    };
    qrModal.querySelector('.qr-bank-close').addEventListener('click', (e) => { e.stopPropagation(); close(); });
    qrModal.querySelector('.qr-bank-overlay').addEventListener('click', close);
    qrModal.querySelector('.qr-bank-box').addEventListener('click', (e) => e.stopPropagation());
  }
  qrModal.classList.add('show');
  document.body.classList.add('qr-modal-open');
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    qrModal?.classList.remove('show');
    document.body.classList.remove('qr-modal-open');
  }
});

/* ---------- 8. TILT 3D ---------- */
if (!isTouch && !prefersReducedMotion) {
  const wrapper = $('profile3d');
  const card = $('profileCard');
  let rafId = null, lastX = 0, lastY = 0;

  wrapper?.addEventListener('pointermove', (e) => {
    lastX = e.clientX; lastY = e.clientY;
    if (rafId) return;
    rafId = requestAnimationFrame(() => {
      rafId = null;
      const r = wrapper.getBoundingClientRect();
      const x = (lastX - r.left) / r.width - 0.5;
      const y = (lastY - r.top) / r.height - 0.5;
      card.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateZ(6px)`;
    });
  }, { passive: true });

  wrapper?.addEventListener('pointerleave', () => {
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    card.style.transform = '';
  });
}

/* ---------- 9. INTERSECTION OBSERVER ---------- */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((e) => e.isIntersecting && e.target.classList.add('visible'));
}, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ---------- 10. ORIENTATION ---------- */
let orientTimer = null;
function handleOrientation() {
  const isPortrait = matchMedia('(orientation: portrait)').matches;
  document.documentElement.classList.toggle('is-portrait', isPortrait);
  document.documentElement.classList.toggle('is-landscape', !isPortrait);
  document.documentElement.classList.add('orientation-changing');
  clearTimeout(orientTimer);
  orientTimer = setTimeout(() => {
    document.documentElement.classList.remove('orientation-changing');
    resizeCanvas();
  }, 700);
}
matchMedia('(orientation: portrait)').addEventListener?.('change', handleOrientation);
handleOrientation();

/* ---------- 11. RESIZE ---------- */
let resizeTimer = null;
addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    resizeCanvas();
    handleOrientation();
  }, 150);
}, { passive: true });

/* ---------- 12. CLEANUP ---------- */
addEventListener('pagehide', stopMusic);
addEventListener('beforeunload', stopMusic);

/* ---------- 13. INIT ---------- */
function init() {
  createStars();
  initParticles();
  animateParticles();
  buildSocialCards();
  updateVolumeUI();
  audio.volume = 0;
}
init();