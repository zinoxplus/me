"use strict";



(function initSpotlight() {
  const spot = document.getElementById('spotlight');
  if (!spot) return;
  document.addEventListener('mousemove', e => {
    spot.style.left = e.clientX + 'px';
    spot.style.top  = e.clientY + 'px';
  });
})();


const waveCanvas = document.getElementById('waveCanvas');
const wCtx = waveCanvas ? waveCanvas.getContext('2d') : null;
let wavePhase = 0, waveActive = false, waveRAF = null;

function drawWave(playing) {
  if (!wCtx) return;
  const W = waveCanvas.offsetWidth || 280;
  const H = waveCanvas.offsetHeight || 44;
  waveCanvas.width = W;
  waveCanvas.height = H;
  wCtx.clearRect(0,0,W,H);
  const bars = 56;
  const bw = W / bars;
  for (let i = 0; i < bars; i++) {
    const t = i / bars;
    const amp = playing
      ? (0.18 + 0.72 * Math.abs(Math.sin(i * 0.38 + wavePhase) * Math.cos(i * 0.19 + wavePhase * 0.5))) * H * 0.88
      : H * 0.10 + Math.sin(i * 0.3) * H * 0.04;
    const x = i * bw + bw * 0.18;
    const bWidth = bw * 0.58;
    const alpha = playing ? (0.3 + 0.7 * (amp / H)) : 0.18;

    const hue = playing ? (185 + t * 30) : 200;
    wCtx.fillStyle = `hsla(${hue},100%,${playing?62:40}%,${alpha.toFixed(2)})`;
    wCtx.beginPath();
    if (wCtx.roundRect) {
      wCtx.roundRect(x, (H - amp) / 2, bWidth, amp, 2);
    } else {
      wCtx.rect(x, (H - amp) / 2, bWidth, amp);
    }
    wCtx.fill();
  }
  if (playing) wavePhase += 0.065;
}
function startWave() {
  waveActive = true;
  (function loop() {
    drawWave(true);
    if (waveActive) waveRAF = requestAnimationFrame(loop);
  })();
}
function stopWave() {
  waveActive = false;
  cancelAnimationFrame(waveRAF);
  drawWave(false);
}
drawWave(false);


const eqMini = document.getElementById('eqMini');
function setEq(on) {
  if (!eqMini) return;
  eqMini.classList.toggle('stopped', !on);
}


const tracks = [
  { name: 'sec -1:29- listen✭', url: 'https://raw.githubusercontent.com/zinoxplus/me/main/2200946991.mp3' },
  { name: 'dige love ni ✭',     url: 'https://raw.githubusercontent.com/zinoxplus/me/main/dglvn.mp3' },
 { name: 'LAST TIME - PR★',    url: 'https://raw.githubusercontent.com/zinoxplus/me/main/lhzzz.mp3' },
{ name: '2BE shak★★>', url: 'https://raw.githubusercontent.com/zinoxplus/me/main/fff1.mp3' },
    { name: 'PiDaR★★>',    url: 'https://raw.githubusercontent.com/zinoxplus/me/main/2393843085.mp3' },
  { name: 'Miri 1:08✭',         url: 'https://raw.githubusercontent.com/zinoxplus/me/main/8b569bc7_e391_4c22_b2d6_e38671697370Miri_140_audio_only_medium.m4a' },
  { name: 'BLOK3 - turk Trend', url: 'https://raw.githubusercontent.com/zinoxplus/me/main/BLOK3%20-%20Napiyosun%20Mesela%20Musics-Fa.mp3' },
  { name: 'Instrumental - SAD', url: 'https://raw.githubusercontent.com/zinoxplus/me/main/nothing_after.mp3' },
  { name: 'SAD PLUS +',         url: 'https://raw.githubusercontent.com/zinoxplus/me/main/LLLH.mp3' }
];

// ─── DOM REFS ─────────────────────────
const audio     = new Audio();
const playBtn   = document.getElementById('playBtn');
const prevBtn   = document.getElementById('prevBtn');
const nextBtn   = document.getElementById('nextBtn');
const shuffBtn  = document.getElementById('shuffBtn');
const reptBtn   = document.getElementById('reptBtn');
const muteBtn   = document.getElementById('muteBtn');
const seekInput = document.getElementById('seekInput');
const volInput  = document.getElementById('volInput');
const curTime   = document.getElementById('curTime');
const durTime   = document.getElementById('durTime');
const tName     = document.getElementById('tName');
const tMeta     = document.getElementById('tMeta');
const pList     = document.getElementById('pList');


let idx = 0, playing = false, shuffle = false, repeat = 0; // 0=none 1=all 2=one
let mutedPrev = 0.7;


function save() {
  try {
    localStorage.setItem('xlmc2_idx', idx);
    localStorage.setItem('xlmc2_vol', audio.volume);
    localStorage.setItem('xlmc2_rep', repeat);
    localStorage.setItem('xlmc2_shuf', shuffle);
  } catch(_) {}
}
function load() {
  try {
    const i = +localStorage.getItem('xlmc2_idx');
    if (!isNaN(i) && i >= 0 && i < tracks.length) idx = i;
    const v = +localStorage.getItem('xlmc2_vol');
    if (!isNaN(v) && v >= 0 && v <= 1) { audio.volume = v; volInput.value = v; mutedPrev = v; }
    const r = +localStorage.getItem('xlmc2_rep');
    if (!isNaN(r) && r >= 0 && r <= 2) repeat = r;
    if (localStorage.getItem('xlmc2_shuf') === 'true') shuffle = true;
  } catch(_) {}
}


function loadTrack(i, autoplay) {
  if (i < 0) i = tracks.length - 1;
  if (i >= tracks.length) i = 0;
  idx = i;
  audio.src = tracks[idx].url;
  tName.textContent = tracks[idx].name;
  tMeta.textContent = '⬡ XLMC · MUSIC PLAYER';
  seekInput.value = 0;
  curTime.textContent = '0:00';
  durTime.textContent = '0:00';
  highlightPlaylist();
  save();
  if (autoplay) audio.play().catch(()=>{});
}


function renderPlaylist() {
  pList.innerHTML = '';
  tracks.forEach((t, i) => {
    const div = document.createElement('div');
    div.className = 'ptrack' + (i === idx ? ' active' : '');
    div.innerHTML = `
      <span class="ptrack-num">${String(i+1).padStart(2,'0')}</span>
      <span class="ptrack-name">${t.name}</span>
      <span class="ptrack-dot"></span>
    `;
    div.addEventListener('click', () => {
      loadTrack(i, true);
      if (!playing) { playing = true; updatePlayBtn(); startWave(); setEq(true); }
    });
    pList.appendChild(div);
  });
}
function highlightPlaylist() {
  document.querySelectorAll('.ptrack').forEach((el, i) => {
    el.classList.toggle('active', i === idx);
  });
}

function togglePlay() {
  if (!audio.src) loadTrack(idx, false);
  if (playing) {
    audio.pause();
    playing = false;
    stopWave();
    setEq(false);
    updatePlayBtn();
    save();
  } else {
    const p = audio.play();
    if (p && p.then) {
      p.then(() => {
        playing = true;
        startWave();
        setEq(true);
        updatePlayBtn();
        save();
      }).catch(() => {
        playing = false;
        updatePlayBtn();
      });
    }
  }
}
function updatePlayBtn() {
  if (!playBtn) return;
  playBtn.innerHTML = playing ? '⏸' : '▶';
}

function randIdx() {
  let n = Math.floor(Math.random() * tracks.length);
  while (tracks.length > 1 && n === idx) n = Math.floor(Math.random() * tracks.length);
  return n;
}
function nextTrack() {
  loadTrack(shuffle ? randIdx() : (idx+1) % tracks.length, playing);
}
function prevTrack() {
  if (audio.currentTime > 3) { audio.currentTime = 0; return; }
  loadTrack(shuffle ? randIdx() : (idx - 1 + tracks.length) % tracks.length, playing);
}


function cycleRepeat() {
  repeat = (repeat + 1) % 3;
  if (reptBtn) {
    reptBtn.textContent = repeat === 2 ? '🔂' : '🔁';
    reptBtn.classList.toggle('active', repeat > 0);
  }
  save();
}


function toggleShuffle() {
  shuffle = !shuffle;
  if (shuffBtn) shuffBtn.classList.toggle('active', shuffle);
  save();
}


function toggleMute() {
  if (audio.volume > 0) {
    mutedPrev = audio.volume;
    audio.volume = 0; volInput.value = 0;
    if (muteBtn) muteBtn.textContent = '🔇';
  } else {
    audio.volume = mutedPrev; volInput.value = mutedPrev;
    if (muteBtn) muteBtn.textContent = '🔊';
  }
  save();
}


function doSeek(v) {
  if (audio.duration) audio.currentTime = (v / 100) * audio.duration;
}
function doVolume(v) {
  audio.volume = +v;
  if (muteBtn) muteBtn.textContent = +v === 0 ? '🔇' : '🔊';
  if (+v > 0) mutedPrev = +v;
  save();
}

function fmt(s) {
  if (isNaN(s) || !isFinite(s)) return '0:00';
  return Math.floor(s/60) + ':' + String(Math.floor(s%60)).padStart(2,'0');
}

audio.addEventListener('timeupdate', () => {
  if (!audio.duration) return;
  seekInput.value = (audio.currentTime / audio.duration) * 100;
  curTime.textContent = fmt(audio.currentTime);
  durTime.textContent = fmt(audio.duration);
});
audio.addEventListener('loadedmetadata', () => {
  durTime.textContent = fmt(audio.duration);
  seekInput.value = 0;
});
audio.addEventListener('ended', () => {
  if (repeat === 2) { audio.currentTime = 0; audio.play().catch(()=>{}); return; }
  if (repeat === 1) { nextTrack(); return; }
  if (idx < tracks.length - 1) { nextTrack(); }
  else { playing = false; updatePlayBtn(); stopWave(); setEq(false); audio.currentTime = 0; }
  save();
});
audio.addEventListener('play',  () => { playing = true;  updatePlayBtn(); });
audio.addEventListener('pause', () => { playing = false; updatePlayBtn(); });


document.addEventListener('keydown', e => {
  if (document.activeElement?.tagName === 'INPUT') return;
  switch(e.key) {
    case ' ':          e.preventDefault(); togglePlay(); break;
    case 'ArrowLeft':  e.preventDefault(); audio.currentTime = Math.max(0, audio.currentTime-5); break;
    case 'ArrowRight': e.preventDefault(); audio.currentTime = Math.min(audio.duration||0, audio.currentTime+5); break;
    case 'ArrowUp':    e.preventDefault(); doVolume(Math.min(1, audio.volume+0.1)); volInput.value = audio.volume; break;
    case 'ArrowDown':  e.preventDefault(); doVolume(Math.max(0, audio.volume-0.1)); volInput.value = audio.volume; break;
    case 'm': case 'M': e.preventDefault(); toggleMute(); break;
    case 'r': case 'R': e.preventDefault(); cycleRepeat(); break;
    case 's': case 'S': e.preventDefault(); toggleShuffle(); break;
  }
});


(function init() {
  load();
  renderPlaylist();
  loadTrack(idx, false);
  audio.volume = +volInput.value || 0.7;


  if (reptBtn) { reptBtn.textContent = repeat === 2 ? '🔂' : '🔁'; reptBtn.classList.toggle('active', repeat > 0); }
  if (shuffBtn) shuffBtn.classList.toggle('active', shuffle);
  updatePlayBtn();


  playBtn  && playBtn.addEventListener('click', togglePlay);
  prevBtn  && prevBtn.addEventListener('click', prevTrack);
  nextBtn  && nextBtn.addEventListener('click', nextTrack);
  shuffBtn && shuffBtn.addEventListener('click', toggleShuffle);
  reptBtn  && reptBtn.addEventListener('click', cycleRepeat);
  muteBtn  && muteBtn.addEventListener('click', toggleMute);
  seekInput && seekInput.addEventListener('input', e => doSeek(+e.target.value));
  volInput  && volInput.addEventListener('input',  e => doVolume(e.target.value));


  // The music player is isolated from the card shelf.
  // A generic page click must never start the music accidentally.
  document.addEventListener('click', e => {
    if (e.target.closest('.cards-section')) return;
  }, true);

  // Also stop pointer/click bubbling from the shelf before it reaches unrelated handlers.
  const cardsSection = document.querySelector('.cards-section');
  if (cardsSection) {
    cardsSection.addEventListener('click', e => e.stopPropagation());
    cardsSection.addEventListener('pointerup', e => e.stopPropagation());
  }
})();


/* ─── SUBTLE 3D TILT ON HOVER (panels only, cheap & reduced-motion aware) ─── */
(function initTilt() {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) return;
  const targets = document.querySelectorAll('.hero-card, .rank-panel, .stats-panel');
  const maxTilt = 3.5;
  targets.forEach(el => {
    el.addEventListener('mousemove', e => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - 0.5;
      const py = (e.clientY - r.top) / r.height - 0.5;
      el.style.transform = `perspective(1000px) rotateX(${(-py * maxTilt).toFixed(2)}deg) rotateY(${(px * maxTilt).toFixed(2)}deg)`;
      el.classList.add('tilting');
    });
    el.addEventListener('mouseleave', () => {
      el.style.transform = '';
      el.classList.remove('tilting');
    });
  });
})();


/* ─── COLLECTED CARDS — 3D shelf ─── */
(function cardsShelf() {
  const shelf = document.getElementById('shelf3d');
  if (!shelf) return;

  const cards   = Array.from(shelf.querySelectorAll('.mem-card'));
  const dotsEl  = document.getElementById('shelfDots');
  const prevBtn = document.getElementById('cardPrev');
  const nextBtn = document.getElementById('cardNext');
  const total   = cards.length;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let active = 0;

  function layout() {
    cards.forEach((c, i) => {
      let pos = 'hidden';
      if (i === active) pos = 'active';
      else if (i === (active - 1 + total) % total) pos = 'left';
      else if (i === (active + 1) % total) pos = 'right';
      c.dataset.pos = pos;
    });
    if (dotsEl) {
      Array.from(dotsEl.children).forEach((d, i) => d.classList.toggle('active', i === active));
    }
  }

  function renderDots() {
    if (!dotsEl) return;
    dotsEl.innerHTML = '';
    cards.forEach((_, i) => {
      const b = document.createElement('button');
      b.className = 'shelf-dot' + (i === active ? ' active' : '');
      b.setAttribute('aria-label', 'کارت ' + (i + 1));
      b.addEventListener('click', () => goTo(i));
      dotsEl.appendChild(b);
    });
  }

  function goTo(i) {
    const next = (i + total) % total;
    if (next === active) return;
    active = next;
    layout();
    if (cards[active]?.classList.contains('theme-end')) playEndCardSound();
    else playAchievementChime();
  }
  function next() { goTo(active + 1); }
  function prev() { goTo(active - 1); }

  prevBtn && prevBtn.addEventListener('click', prev);
  nextBtn && nextBtn.addEventListener('click', next);

  cards.forEach(c => {
    c.addEventListener('click', () => {
      if (c.dataset.pos === 'left') prev();
      else if (c.dataset.pos === 'right') next();
    });
  });

  // swipe / drag to flip through the shelf
  let startX = null;
  shelf.addEventListener('pointerdown', e => { startX = e.clientX; });
  shelf.addEventListener('pointerup', e => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); }
    startX = null;
  });

  layout();
  renderDots();

  // ── lightweight ambient particles, themed per card ──
  if (!reduceMotion) {
    cards.forEach(c => {
      const layer = c.querySelector('.particle-layer');
      if (!layer) return;
      const type = c.classList.contains('theme-tough') ? 'ember'
                 : c.classList.contains('theme-tired') ? 'dust' : 'snow';
      const count = type === 'snow' ? 20 : type === 'ember' ? 16 : 16;
      const frag = document.createDocumentFragment();
      for (let i = 0; i < count; i++) {
        const s = document.createElement('span');
        s.className = 'p';
        const left = Math.random() * 100;
        const delay = (Math.random() * 6).toFixed(2);
        const dur = type === 'ember' ? (2.2 + Math.random() * 1.6).toFixed(2)
                  : type === 'dust'  ? (4 + Math.random() * 3).toFixed(2)
                  : (5 + Math.random() * 4).toFixed(2);
        const size = type === 'ember' ? (2 + Math.random() * 2).toFixed(1) : (2 + Math.random() * 2.5).toFixed(1);
        s.style.left = left + '%';
        s.style.animationName = type === 'ember' ? 'emberRise' : type === 'dust' ? 'dustDrift' : 'snowFall';
        s.style.animationDelay = delay + 's';
        s.style.animationDuration = dur + 's';
        s.style.width = size + 'px';
        s.style.height = size + 'px';
        frag.appendChild(s);
      }
      layer.appendChild(frag);
    });
  }

  // ── isolated card transition sounds ──
  // Card navigation owns these audio objects. They never touch the music player.
  const achievementAudio = new Audio('https://raw.githubusercontent.com/zinoxplus/me/main/dsdsdsdr.mp3');
  const endCardAudio = new Audio('https://raw.githubusercontent.com/zinoxplus/me/main/yuyuyuyu.mp3');
  achievementAudio.preload = 'auto';
  endCardAudio.preload = 'auto';
  achievementAudio.volume = 0.55;
  endCardAudio.volume = 0.62;

  let achievementFileOk = true;
  let endCardFileOk = true;
  achievementAudio.addEventListener('error', () => { achievementFileOk = false; });
  endCardAudio.addEventListener('error', () => { endCardFileOk = false; });

  let actx = null;
  function playSynthChime() {
    if (reduceMotion) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === 'suspended') actx.resume();
      const now = actx.currentTime;
      const notes = [523.25, 659.25];
      notes.forEach((freq, i) => {
        const osc = actx.createOscillator();
        const gain = actx.createGain();
        const filter = actx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 2000;
        osc.type = 'sine';
        osc.frequency.value = freq;
        const t0 = now + i * 0.13;
        gain.gain.setValueAtTime(0, t0);
        gain.gain.linearRampToValueAtTime(0.12, t0 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 1.1);
        osc.connect(filter);
        filter.connect(gain);
        gain.connect(actx.destination);
        osc.start(t0);
        osc.stop(t0 + 1.2);
      });
    } catch (_) {}
  }

  function playAchievementChime() {
    if (reduceMotion) return;
    if (achievementFileOk) {
      try {
        achievementAudio.currentTime = 0;
        const p = achievementAudio.play();
        if (p && p.catch) p.catch(() => playSynthChime());
        return;
      } catch (_) {}
    }
    playSynthChime();
  }

  function playEndCardSound() {
    if (reduceMotion) return;
    if (endCardFileOk) {
      try {
        endCardAudio.currentTime = 0;
        const p = endCardAudio.play();
        if (p && p.catch) p.catch(() => {});
        return;
      } catch (_) {}
    }
    // Do not use the music player's audio as a fallback.
    playSynthChime();
  }

})();
