const $ = id => document.getElementById(id);

/* ---------- Ayarlar ---------- */
const NORMAL_TARGET = Date.parse('2026-10-24T00:00:00+04:00'); // Bakı vaxtı
const NAME = 'Zeynəb';
const MUSIC_FILE = 'music.mp3';
const EFFECT_WPM = 100;
const POEM_WPM = 300;

/* ?demo -> 10 saniyə sonra açılır | ?open -> dərhal açılır */
const params = new URLSearchParams(location.search);
const IS_DEMO = params.has('demo');
const IS_OPEN = params.has('open');
let targetTime = IS_DEMO && !IS_OPEN ? Date.now() + 10000 : NORMAL_TARGET;

/* ---------- Şeir ---------- */
const REFRAIN = '\u0000'; // bu şeirdə təkrar sətir yoxdur
const STANZAS = [
  ['Onun adı Dünya Gözəli','Özü də gözəllər gözəli','Qoy əbədi parlasın','Sevgi dolu gözləri'],
  ['Qışda qar yağanda','Yazda şimşək çaxanda','Şair yenə səndən yazır','Qələmi ələ alanda'],
  ['Gəlməyəsən pis baxışına','Düşəsən gözəl vaxtına','Mələktək qəlbi var','Heç inanmazsan yaşına'],
  ['Sevdiyi rəngdir çəhrayı','Dörd böyüklərdən Beşiktaşı','Qısqanır bütün dənizlər','Gəzərkən dalğalanan saçlarını'],
  ['Bakı... Sənin şad günündür','Bu gün Zeynəbin ad günüdür','Günəşli buludlu payız günüdür','Dostumun dünyada göz açdığı günüdür']
];
const EYES_STANZA = 0;   // "Sevgi dolu gözləri" – işıq azalır, gözlər parlayır
const FINAL_STANZA = 4;  // son bənd – atəşfəşanlıq

const poemEl = $('poem');
STANZAS.forEach((lines, si) => {
  const st = document.createElement('div');
  st.className = 'st';
  lines.forEach((text, li) => {
    const ln = document.createElement('span');
    ln.className = 'ln';
    ln.dataset.text = text;
    if (si === 0 && li === 0) ln.classList.add('rf');
    if (si === EYES_STANZA && li >= 2) ln.classList.add('eyeline');
    if (si === FINAL_STANZA && li === 3) ln.classList.add('fin');
    ln.innerHTML = '<span class="v"></span><span class="g"></span>';
    ln.querySelector('.g').textContent = text;
    st.appendChild(ln);
  });
  poemEl.appendChild(st);
});

/* ---------- Köməkçilər ---------- */
let skip = false;
const sleep = ms => skip ? Promise.resolve() : new Promise(r => setTimeout(r, ms));
const charDelay = wpm => 60000 / (wpm * 5);

async function typeLine(ln, wpm) {
  const text = ln.dataset.text, v = ln.querySelector('.v'), g = ln.querySelector('.g');
  const d = charDelay(wpm);
  for (let i = 1; i <= text.length; i++) {
    v.textContent = text.slice(0, i);
    g.textContent = text.slice(i);
    let pause = 0;
    if (/[.!?]/.test(text[i - 1])) pause = d * .8;
    else if (/[,;:]/.test(text[i - 1])) pause = d * .35;
    await sleep(d + pause);
  }
}
async function typeCine(el, text, wpm) {
  el.textContent = '';
  el.classList.remove('cineOut');
  el.classList.add('cineIn');
  const d = charDelay(wpm);
  for (let i = 1; i <= text.length; i++) { el.textContent = text.slice(0, i); await sleep(d); }
}

/* ---------- Canvas: ulduzlar, ləçəklər, konfeti, atəşfəşanlıq ---------- */
const fx = $('fx'), ctx = fx.getContext('2d');
let W = innerWidth, H = innerHeight;
function resize() { W = fx.width = innerWidth; H = fx.height = innerHeight; }
resize(); addEventListener('resize', resize);

const colors = ['#ff8fb3', '#ff5e94', '#ffd166', '#c9a7f0', '#ffffff', '#f7c6d9'];
const stars = Array.from({ length: 80 }, () => ({ x: Math.random(), y: Math.random(), r: .4 + Math.random() * 1.5, p: Math.random() * 6 }));
const petals = Array.from({ length: 36 }, () => ({
  x: Math.random() * W, y: Math.random() * H, s: 6 + Math.random() * 8, v: .5 + Math.random() * 1.2,
  r: Math.random() * 360, rv: -1 + Math.random() * 2, c: colors[Math.floor(Math.random() * 4)]
}));
let particles = [], petalsOn = false;

function burst(x, y, n = 50, speed = 5) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = Math.random() * speed + 1;
    particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v, life: 1, color: colors[Math.floor(Math.random() * colors.length)], size: 1 + Math.random() * 3 });
  }
}
function confetti(x, y, n = 100) {
  for (let i = 0; i < n; i++) {
    particles.push({ x, y, vx: (Math.random() - .5) * 14, vy: -Math.random() * 15 - 3, life: 1.7, color: colors[Math.floor(Math.random() * colors.length)], size: 4 + Math.random() * 5, gravity: .25, rect: true });
  }
}
function fireworks(n = 4) {
  for (let i = 0; i < n; i++) setTimeout(() => burst(W * (.1 + Math.random() * .8), H * (.1 + Math.random() * .45), 55, 6), i * 220);
}
function loop(t) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#fff';
  stars.forEach(s => {
    ctx.globalAlpha = .2 + .5 * Math.abs(Math.sin(t / 1000 + s.p));
    ctx.beginPath(); ctx.arc(s.x * W, s.y * H, s.r, 0, 6.283); ctx.fill();
  });
  if (petalsOn) petals.forEach(p => {
    p.y += p.v; p.x += Math.sin(t / 900 + p.r) * .35; p.r += p.rv;
    if (p.y > H + 20) { p.y = -20; p.x = Math.random() * W; }
    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.r * Math.PI / 180);
    ctx.globalAlpha = .7; ctx.fillStyle = p.c;
    ctx.beginPath(); ctx.ellipse(0, 0, p.s * .5, p.s, Math.PI / 4, 0, 6.283); ctx.fill();
    ctx.restore();
  });
  particles = particles.filter(p => p.life > 0);
  particles.forEach(p => {
    p.x += p.vx; p.y += p.vy; p.vy += p.gravity || .05; p.vx *= .985; p.life -= .014;
    ctx.globalAlpha = Math.max(0, p.life); ctx.fillStyle = p.color;
    if (p.rect) ctx.fillRect(p.x, p.y, p.size, p.size * .6);
    else { ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.283); ctx.fill(); }
  });
  ctx.globalAlpha = 1;
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);

/* ---------- Musiqi ---------- */
let audio = null, playing = false, musicMissing = false;
function ensureAudio() {
  if (audio) return;
  audio = new Audio(MUSIC_FILE);
  audio.loop = true; audio.volume = .55; audio.preload = 'auto';
  audio.addEventListener('error', () => { musicMissing = true; playing = false; $('music').hidden = true; });
}
async function playMusic() {
  ensureAudio();
  if (musicMissing) return;
  try { await audio.play(); playing = true; $('music').textContent = '❚❚ Musiqi'; }
  catch (e) {
    playing = false; $('music').textContent = '♫ Musiqini aç';
    // brauzer avtomatik səsi bloklayıb – ilk toxunuşda başlat
    const once = () => { if (!playing) playMusic(); };
    document.addEventListener('pointerdown', once, { once: true });
  }
}
$('music').addEventListener('click', async () => {
  ensureAudio();
  if (playing) { audio.pause(); playing = false; $('music').textContent = '♫ Musiqini aç'; }
  else await playMusic();
});

/* ---------- Geri sayım ---------- */
let started = false, countdownTimer = null, lastBig = null;

function startLastFiveEffects() {
  document.querySelector('.bP').style.opacity = '1';
  document.querySelector('.bG').style.opacity = '1';
  $('rays').classList.add('on');
  petalsOn = true;
}
function showBig(n) {
  $('final').style.display = 'flex';
  const b = $('bigNum');
  b.textContent = n; b.classList.remove('bigIn'); void b.offsetWidth; b.classList.add('bigIn');
  burst(W / 2, H / 2, 50, 6);
  if (n === 5) { confetti(W / 2, H * .65, 130); fireworks(5); }
  else if (n === 1) { fireworks(6); confetti(W / 2, H * .6, 100); }
  else fireworks(n);
}
function updateCountdown(diff) {
  const p = n => String(n).padStart(2, '0');
  $('d').textContent = p(Math.floor(diff / 86400000));
  $('h').textContent = p(Math.floor(diff % 86400000 / 3600000));
  $('m').textContent = p(Math.floor(diff % 3600000 / 60000));
  $('s').textContent = p(Math.floor(diff % 60000 / 1000));
}
function tick() {
  if (started) return;
  const diff = targetTime - Date.now();
  if (diff <= 0) { updateCountdown(0); clearInterval(countdownTimer); startCelebration(); return; }
  updateCountdown(diff);
  const left = Math.ceil(diff / 1000);
  if (left <= 5 && left !== lastBig) { lastBig = left; startLastFiveEffects(); showBig(left); }
}

/* ---------- Açılış kinosu ---------- */
$('skip').addEventListener('click', () => { skip = true; });

async function cinematic() {
  const box = $('cinematic'), text = $('cineText'), title = $('cineTitle');
  box.classList.add('on');
  text.style.display = ''; text.className = ''; text.textContent = '';
  title.style.opacity = '0'; title.classList.remove('cineIn', 'cineOut');
  await sleep(500);
  burst(W / 2, H / 2, 60, 5); fireworks(3);
  await typeCine(text, NAME + '...', EFFECT_WPM);
  await sleep(900);
  text.classList.add('cineOut'); await sleep(900);
  await typeCine(text, 'AD GÜNÜN MÜBARƏK!', EFFECT_WPM);
  fireworks(4);
  await sleep(1000);
  text.classList.add('cineOut'); await sleep(800);
  text.style.display = 'none';
  title.classList.add('cineIn');
  burst(W / 2, H * .5, 120, 7); confetti(W / 2, H * .65, 180); fireworks(8);
  await sleep(2200);
  title.classList.add('cineOut'); await sleep(500);
  box.classList.remove('on');
  skip = false;
}

/* ---------- Şeirin oxunması ---------- */
async function playPoem() {
  const sts = [...document.querySelectorAll('.st')];
  for (let si = 0; si < sts.length; si++) {
    const st = sts[si];
    sts.forEach(s => s.classList.remove('cur'));
    st.classList.add('cur', 'done');
    st.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const lns = [...st.querySelectorAll('.ln')];
    for (let li = 0; li < lns.length; li++) {
      const ln = lns[li];
      if (si === EYES_STANZA && li === 2) { $('dim').classList.add('on'); $('eyes').classList.add('on'); }
      await typeLine(ln, POEM_WPM);
      await sleep(180);
    }
    if (si === EYES_STANZA) {
      await sleep(600);
      $('dim').classList.remove('on'); $('eyes').classList.remove('on');
      burst(W / 2, H * .3, 70, 5);
    }
    if (si === FINAL_STANZA) { fireworks(6); confetti(W / 2, H * .4, 140); }
    await sleep(700);
  }
  sts.forEach(s => s.classList.remove('cur'));
  $('closing').classList.add('in'); await sleep(300);
  $('flowers').classList.add('in'); await sleep(400);
  $('wishbox').classList.add('in');
  $('wishbox').scrollIntoView({ behavior: 'smooth', block: 'center' });
  setTimeout(revealSecret, 9000);
}

function revealSecret() {
  const b = $('secretBtn');
  if (b.classList.contains('in')) return;
  b.style.display = 'inline-block';
  requestAnimationFrame(() => b.classList.add('in'));
}

async function startCelebration() {
  if (started) return;
  started = true;
  clearInterval(countdownTimer);
  $('final').style.display = 'none';
  $('wait').style.display = 'none';
  $('celeb').style.display = 'block';
  $('card').classList.add('glow');
  $('music').hidden = false;
  startLastFiveEffects();
  playMusic();
  await cinematic();
  $('greet').style.opacity = '1';
  await sleep(900);
  $('intro').classList.add('in');
  await sleep(3200);
  await playPoem();
}

/* ---------- Tort və gizli mesaj ---------- */
$('cake').addEventListener('click', () => {
  const cake = $('cake');
  if (cake.classList.contains('out')) return;
  cake.classList.add('out');
  $('cakeHint').textContent = '';
  const r = cake.getBoundingClientRect();
  confetti(r.left + r.width / 2, r.top + r.height * .3, 140);
  fireworks(6);
  setTimeout(() => { $('wishmsg').textContent = 'Diləyin gerçək olsun. ❤️'; }, 500);
  setTimeout(revealSecret, 1800);
});
$('secretBtn').addEventListener('click', () => {
  $('secret').style.display = 'flex';
  requestAnimationFrame(() => $('secret').classList.add('on'));
  burst(W / 2, H / 2, 50, 4);
});
$('secretClose').addEventListener('click', () => {
  $('secret').classList.remove('on');
  setTimeout(() => { $('secret').style.display = 'none'; }, 900);
});

/* ---------- Başlanğıc ---------- */
if (IS_OPEN) startCelebration();
else { tick(); countdownTimer = setInterval(tick, 50); }
