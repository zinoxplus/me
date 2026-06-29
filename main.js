"use strict";

/* ══════════════════════════════════
   XLMC v2 — main.js
   ══════════════════════════════════ */

// ─── SPOTLIGHT ───────────────────────
(function initSpotlight() {
  const spot = document.getElementById('spotlight');
  if (!spot) return;
  document.addEventListener('mousemove', e => {
    spot.style.left = e.clientX + 'px';
    spot.style.top  = e.clientY + 'px';
  });
})();

// ─── WAVEFORM ────────────────────────
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
    // Gradient color shift across width
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

// ─── EQ BARS ─────────────────────────
const eqMini = document.getElementById('eqMini');
function setEq(on) {
  if (!eqMini) return;
  eqMini.classList.toggle('stopped', !on);
}

// ─── PLAYLIST DATA ────────────────────
const tracks = [
  { name: 'sec -1:29- listen✭', url: 'https://raw.githubusercontent.com/zinoxplus/me/main/2200946991.mp3' },
  { name: 'dige love ni ✭',     url: 'https://raw.githubusercontent.com/zinoxplus/me/main/dglvn.mp3' },
  { name: 'Miri 1:08✭',         url: 'https://raw.githubusercontent.com/zinoxplus/me/main/8b569bc7_e391_4c22_b2d6_e38671697370Miri_140_audio_only_medium.m4a' },
  { name: 'LAST TIME - PR★',    url: 'https://raw.githubusercontent.com/zinoxplus/me/main/lhzzz.mp3' },
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

// ─── STATE ────────────────────────────
let idx = 0, playing = false, shuffle = false, repeat = 0; // 0=none 1=all 2=one
let mutedPrev = 0.7;

// ─── LOCALSTORAGE ─────────────────────
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

// ─── TRACK LOAD ───────────────────────
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

// ─── PLAYLIST RENDER ──────────────────
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

// ─── PLAY / PAUSE ─────────────────────
function togglePlay() {
  if (!audio.src) loadTrack(idx, false);
  if (playing) {
    audio.pause(); playing = false; stopWave(); setEq(false);
  } else {
    audio.play().catch(()=>{}); playing = true; startWave(); setEq(true);
  }
  updatePlayBtn(); save();
}
function updatePlayBtn() {
  if (!playBtn) return;
  playBtn.innerHTML = playing ? '⏸' : '▶';
}

// ─── NEXT / PREV ──────────────────────
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

// ─── REPEAT ───────────────────────────
function cycleRepeat() {
  repeat = (repeat + 1) % 3;
  if (reptBtn) {
    reptBtn.textContent = repeat === 2 ? '🔂' : '🔁';
    reptBtn.classList.toggle('active', repeat > 0);
  }
  save();
}

// ─── SHUFFLE ──────────────────────────
function toggleShuffle() {
  shuffle = !shuffle;
  if (shuffBtn) shuffBtn.classList.toggle('active', shuffle);
  save();
}

// ─── MUTE ─────────────────────────────
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

// ─── SEEK / VOLUME ────────────────────
function doSeek(v) {
  if (audio.duration) audio.currentTime = (v / 100) * audio.duration;
}
function doVolume(v) {
  audio.volume = +v;
  if (muteBtn) muteBtn.textContent = +v === 0 ? '🔇' : '🔊';
  if (+v > 0) mutedPrev = +v;
  save();
}

// ─── TIME FORMAT ──────────────────────
function fmt(s) {
  if (isNaN(s) || !isFinite(s)) return '0:00';
  return Math.floor(s/60) + ':' + String(Math.floor(s%60)).padStart(2,'0');
}

// ─── AUDIO EVENTS ─────────────────────
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

// ─── KEYBOARD ─────────────────────────
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

// ─── INIT ─────────────────────────────
(function init() {
  load();
  renderPlaylist();
  loadTrack(idx, false);
  audio.volume = +volInput.value || 0.7;

  // restore UI state
  if (reptBtn) { reptBtn.textContent = repeat === 2 ? '🔂' : '🔁'; reptBtn.classList.toggle('active', repeat > 0); }
  if (shuffBtn) shuffBtn.classList.toggle('active', shuffle);
  updatePlayBtn();

  // wire controls
  playBtn  && playBtn.addEventListener('click', togglePlay);
  prevBtn  && prevBtn.addEventListener('click', prevTrack);
  nextBtn  && nextBtn.addEventListener('click', nextTrack);
  shuffBtn && shuffBtn.addEventListener('click', toggleShuffle);
  reptBtn  && reptBtn.addEventListener('click', cycleRepeat);
  muteBtn  && muteBtn.addEventListener('click', toggleMute);
  seekInput && seekInput.addEventListener('input', e => doSeek(+e.target.value));
  volInput  && volInput.addEventListener('input',  e => doVolume(e.target.value));

  // first-click autoplay
  document.addEventListener('click', function once() {
    if (!playing && audio.src) {
      audio.play().catch(()=>{});
      playing = true; updatePlayBtn(); startWave(); setEq(true);
    }
    document.removeEventListener('click', once);
  }, { once: true });
})();
