(() => {
  'use strict';

  const PRODUCTS = window.TM_PRODUCTS;
  const QUESTIONS = window.TM_QUESTIONS;
  const DETAILS = window.TM_DETAILS;
  const FORMAT_LABEL = window.TM_FORMAT_LABEL;
  const LOADING = window.TM_LOADING;
  const { recommend, formatKey } = window.TM_MATCH;
  const FX = window.TM_FX;

  const IDLE_QUESTION_MS = 40000;  // тишина на вопросе → «Still there?»
  const IDLE_RESULT_MS = 75000;    // на результате даём дольше показать бариста
  const IDLE_COUNTDOWN = 10;       // секунд до сброса после «Still there?»
  const AUTO_ADVANCE_MS = 380;     // пауза после выбора, чтобы увидеть нажатие
  const BOOM_MS = 1900;            // взрыв сферы до живого градиента
  const PANEL_AT_MS = 1050;        // когда во время взрыва наплывает панель
  const UNBOOM_MS = 1500;          // обратно к сфере
  const SWAP_MS = 300;             // смена экрана внутри панели
  const CHECK_STEP_MS = 650;       // загрузка: шаг между галочками

  const $ = (s) => document.querySelector(s);
  const intro = $('#intro');
  const hand = $('#hand');
  const stage = $('#stage');
  const panel = $('#panel');

  let state = { screen: 'intro', step: 0, answers: {}, result: null };
  let busy = false;
  let reloadOnStart = false;      // пришла новая версия, пока человек проходил квиз
  let barsOn = 0;                 // сколько полосок прогресса уже чёрные
  const timers = new Set();
  const wait = (ms) => new Promise((r) => { const id = setTimeout(() => { timers.delete(id); r(); }, ms); timers.add(id); });
  const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); };

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const visibleQuestions = () => QUESTIONS.filter((q) => !(q.skipIf && q.skipIf(state.answers)));
  const formatLabel = (p) => FORMAT_LABEL[formatKey(p)];

  /* ===================== старт и взрыв ===================== */

  function replay(el) {
    for (const n of [el, ...el.children]) { n.style.animation = 'none'; void n.offsetWidth; n.style.animation = ''; }
  }

  async function explode() {
    if (busy || state.screen !== 'intro') return;
    busy = true;
    state = { screen: 'question', step: 0, answers: {}, result: null };
    hand.classList.add('gone');
    intro.classList.add('exploding');
    document.body.classList.add('boomed');
    FX.animateBoom(1, BOOM_MS);
    await wait(320);
    intro.classList.add('gone');
    await wait(PANEL_AT_MS - 320);
    barsOn = 0;
    stage.hidden = false;
    stage.classList.remove('leave');
    stage.classList.add('enter');
    renderQuestion();
    await wait(900);
    intro.classList.add('hidden');
    hand.classList.add('hidden');
    busy = false;
  }

  async function backToIntro() {
    if (state.screen === 'intro') return;
    if (reloadOnStart) { location.reload(); return; }
    busy = true;
    clearTimers();
    closeOverlays();
    stage.classList.remove('enter');
    stage.classList.add('leave');
    await wait(480);
    stage.hidden = true;
    panel.innerHTML = '';
    document.body.classList.remove('boomed');
    FX.animateBoom(0, UNBOOM_MS);
    await wait(UNBOOM_MS * 0.5);
    intro.classList.remove('hidden', 'exploding', 'gone');
    hand.classList.remove('hidden', 'gone');
    replay(intro); replay(hand);
    state = { screen: 'intro', step: 0, answers: {}, result: null };
    await wait(UNBOOM_MS * 0.5);
    busy = false;
  }

  /* ===================== экраны в панели ===================== */

  // Новый экран появляется, когда старый успел раствориться
  function mount(html, cls, target) {
    const old = panel.querySelector('.view:not(.leaving)');
    const el = document.createElement('div');
    el.className = 'view ' + cls;
    el.innerHTML = html;
    const show = () => {
      panel.appendChild(el);
      const bars = el.querySelectorAll('.progress i');
      requestAnimationFrame(() => requestAnimationFrame(() => {
        bars.forEach((b, i) => b.classList.toggle('on', i < target));
        barsOn = target;
      }));
    };
    if (old) {
      old.classList.add('leaving');
      const t = setTimeout(() => { timers.delete(t); old.remove(); }, SWAP_MS + 20);
      timers.add(t);
      const s = setTimeout(() => { timers.delete(s); show(); }, SWAP_MS);
      timers.add(s);
    } else show();
    return el;
  }

  // Полоски рисуются в прежнем состоянии и плавно доезжают до нового
  const progress = (total) => `<div class="progress">${Array.from({ length: total }, (_, i) => `<i class="${i < barsOn ? 'on' : ''}"></i>`).join('')}</div>`;

  let order = 0;
  const a = (cls) => `class="${cls} a" style="--d:${order++}"`;

  const btn = {
    back: () => `<button class="btn" type="button" data-act="back"><img src="assets/icons/back.svg" alt=""><span class="t-btn">Back</span></button>`,
    restart: () => `<button class="btn" type="button" data-act="restart"><img src="assets/icons/restart.svg" alt=""><span class="t-btn">Start over</span></button>`
  };

  function renderQuestion() {
    state.screen = 'question';
    const qs = visibleQuestions();
    const q = qs[state.step];
    const value = state.answers[q.id];
    const multi = q.type === 'multi';
    const isSel = (v) => (multi ? (value || []).includes(v) : value === v);
    const isLast = state.step === qs.length - 1;
    order = 0;

    let opts = '';
    if (q.layout === 'grid') {
      opts = `<div class="opts-grid">${q.options.map((o) => `
        <button ${a('opt opt-card' + (isSel(o.value) ? ' selected' : ''))} type="button" data-value="${esc(o.value)}">
          <span class="t-lead">${esc(o.label)}</span>${o.note ? `<span class="t-body">${esc(o.note)}</span>` : ''}
        </button>`).join('')}</div>`;
    } else if (q.layout === 'images') {
      opts = `<div class="opts-images">${q.options.map((o) => `
        <button ${a('opt-image' + (isSel(o.value) ? ' selected' : ''))} type="button" data-value="${esc(o.value)}">
          <span class="ph"><img src="${esc(o.image)}" alt=""></span>
          <span class="label"><span class="t-sub">${esc(o.label)}</span></span>
        </button>`).join('')}</div>`;
    } else {
      opts = `<div class="opts-rows">${q.options.map((o) => `
        <button ${a('opt opt-row' + (isSel(o.value) ? ' selected' : ''))} type="button" data-value="${esc(o.value)}">
          ${o.icon ? `<span class="icon"><img src="${esc(o.icon)}" alt=""></span>` : ''}
          <span class="name t-lead">${esc(o.label)}</span>
          ${o.note ? `<span class="note t-body">${esc(o.note)}</span>` : ''}
        </button>`).join('')}</div>`;
    }

    const head = `<div class="q-head${q.layout === 'images' ? ' tight' : ''}">
        <p ${a('helper t-body')}>${esc(q.helper)}</p>
        <h1 ${a('t-title')}>${q.title.map(esc).join('<br>')}</h1>
      </div>`;
    const nextBtn = multi ? `<button class="btn btn-yellow" type="button" data-act="next"${(value || []).length ? '' : ' disabled'}><span class="t-btn">${isLast ? 'Show my coffee' : 'Next question'}</span><img src="assets/icons/next.svg" alt=""></button>` : '';
    const actions = `<div ${a('actions')}><div class="group">${btn.back()}${btn.restart()}</div>${nextBtn}</div>`;

    const el = mount(progress(6) + head + opts + actions, q.layout === 'images' ? 'stack' : 'spread', Math.min(6, Math.round(((state.step + 1) / qs.length) * 6)));

    let locked = false;
    el.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (act && !locked) {
        if (act.dataset.act === 'back') { locked = true; back(); }
        if (act.dataset.act === 'restart') { locked = true; backToIntro(); }
        if (act.dataset.act === 'next') { locked = true; next(); }
        return;
      }
      const opt = e.target.closest('[data-value]');
      if (!opt || locked) return;
      const v = opt.dataset.value;
      if (!multi) {
        state.answers[q.id] = v;
        el.querySelectorAll('[data-value]').forEach((b) => b.classList.toggle('selected', b === opt));
        locked = true;
        wait(AUTO_ADVANCE_MS).then(next);
        return;
      }
      let list = (state.answers[q.id] || []).slice();
      if (list.includes(v)) list = list.filter((x) => x !== v);
      else { list.push(v); if (q.max && list.length > q.max) list.shift(); }
      state.answers[q.id] = list;
      el.querySelectorAll('[data-value]').forEach((b) => b.classList.toggle('selected', list.includes(b.dataset.value)));
      el.querySelector('[data-act="next"]').disabled = list.length === 0;
    });
  }

  function next() {
    const qs = visibleQuestions();
    if (state.step < qs.length - 1) { state.step += 1; renderQuestion(); }
    else renderLoading();
  }

  function back() {
    if (state.step === 0) backToIntro();
    else { state.step -= 1; renderQuestion(); }
  }

  /* ===================== загрузка ===================== */

  function renderLoading() {
    state.screen = 'loading';
    const picks = recommend(PRODUCTS, state.answers, loadOff());
    state.result = picks[0] || null;
    if (!state.result) { backToIntro(); return; }
    order = 0;
    const head = `<div class="q-head"><p ${a('helper t-body')}>${esc(LOADING.helper)}</p><h1 ${a('t-title')}>${LOADING.title.map(esc).join('<br>')}</h1></div>`;
    const rows = `<div class="checks">${LOADING.steps.map((s) => `
      <div class="opt check-row"><span class="check"><svg viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9"/></svg></span><span class="t-lead">${esc(s)}</span></div>`).join('')}</div>`;
    const actions = `<div ${a('actions')}><div class="group">${btn.restart()}</div></div>`;
    const el = mount(progress(6) + head + rows + actions, 'spread', 6);
    el.addEventListener('click', (e) => { if (e.target.closest('[data-act="restart"]')) backToIntro(); });

    const items = el.querySelectorAll('.check-row');
    items.forEach((row, i) => {
      wait(SWAP_MS + 300 + i * CHECK_STEP_MS).then(() => row.classList.add('in'));
      wait(SWAP_MS + 300 + i * CHECK_STEP_MS + 420).then(() => row.classList.add('done'));
    });
    wait(SWAP_MS + 300 + items.length * CHECK_STEP_MS + 700).then(() => { if (state.screen === 'loading') renderResult(); });
  }

  /* ===================== результат ===================== */

  function renderResult() {
    state.screen = 'result';
    const p = state.result.product;
    const d = DETAILS[p.id] || { title: [p.name, ''], roast: '—', process: '—', variety: '—', origin: '—', farm: '—', altitude: '—' };
    order = 0;
    const kv = (k, v) => `<div class="kv"><span class="t-label">${esc(k)}:</span><span class="v t-cap">${esc(v || '—')}</span></div>`;
    const hr = '<div class="divider"></div>';
    const squares = (n) => `<span class="squares">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;
    const taste = `<div class="taste">${['acidity', 'bitterness', 'sweetness'].map((k) => `
      <div class="taste-row">${squares(p.taste[k])}<span class="t-cap">${k[0].toUpperCase() + k.slice(1)}</span></div>`).join('')}</div>`;

    const html = progress(6) + `
      <div class="res-body">
        <div ${a('res-meta')}><span class="t-body">Your match</span><span class="t-body">${esc(formatLabel(p))}</span></div>
        <div ${a('res-titles')}><h1 class="t-title">${esc(d.title[0])}</h1>${d.title[1] ? `<h2 class="t-h4">${esc(d.title[1])}</h2>` : ''}</div>
        <div class="res-section">
          <div ${a('res-image')}><img src="${esc(p.image)}" alt=""></div>
          <div ${a('res-table')}>
            <div class="col">${kv('Roast', d.roast)}${hr}${kv('Process', d.process)}${hr}${kv('Notes', p.notes.join(', '))}${hr}${kv('Variety', d.variety)}</div>
            <div class="col">${kv('Origin', d.origin)}${hr}${kv('Farm', d.farm)}${hr}${kv('Altitude', d.altitude)}${hr}${taste}</div>
          </div>
        </div>
      </div>
      <div ${a('actions')}><div class="group">${btn.back()}${btn.restart()}</div>
        <button class="btn btn-yellow" type="button" data-act="share"><span class="t-btn">Share to your device</span><img src="assets/icons/share.svg" alt=""></button>
      </div>`;
    const el = mount(html, 'result', 6);
    el.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (!act) return;
      if (act.dataset.act === 'back') { state.step = visibleQuestions().length - 1; renderQuestion(); }
      if (act.dataset.act === 'restart') backToIntro();
      if (act.dataset.act === 'share') openQR(p);
    });
  }

  /* ===================== QR ===================== */

  const qrOverlay = $('#qr');
  function openQR(p) {
    const qr = window.qrcode(0, 'M');
    qr.addData(p.url);
    qr.make();
    const n = qr.getModuleCount();
    let path = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (qr.isDark(r, c)) path += `M${c} ${r}h1v1h-1z`;
    $('#qr-code').innerHTML = `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><path d="${path}" fill="#141414"/></svg>`;
    $('#qr-name').textContent = p.name;
    qrOverlay.hidden = false;
  }
  $('#qr-close').addEventListener('click', () => { qrOverlay.hidden = true; });
  qrOverlay.addEventListener('click', (e) => { if (e.target === qrOverlay) qrOverlay.hidden = true; });

  /* ===================== простой и сброс ===================== */

  const idle = $('#idle');
  const idleCount = $('#idle-count');
  let lastTouch = Date.now();
  let countdown = null;

  function stopCountdown() { clearInterval(countdown); countdown = null; idle.hidden = true; }
  function closeOverlays() { stopCountdown(); qrOverlay.hidden = true; }

  document.addEventListener('pointerdown', () => { lastTouch = Date.now(); if (countdown) stopCountdown(); }, true);

  setInterval(() => {
    if (busy || countdown || !admin.hidden || !['question', 'result'].includes(state.screen)) return;
    const limit = state.screen === 'result' ? IDLE_RESULT_MS : IDLE_QUESTION_MS;
    if (Date.now() - lastTouch < limit) return;
    let left = IDLE_COUNTDOWN;
    idleCount.textContent = left;
    idle.hidden = false;
    countdown = setInterval(() => {
      left -= 1;
      idleCount.textContent = left;
      if (left <= 0) { stopCountdown(); backToIntro(); }
    }, 1000);
  }, 1000);

  /* ===================== админка: 5 тапов по логотипу на старте ===================== */

  const admin = $('#admin');
  const adminList = $('#admin-list');
  const OFF_KEY = 'tm-coffee-match-off';

  function loadOff() {
    try { return JSON.parse(localStorage.getItem(OFF_KEY)) || []; } catch (e) { return []; }
  }
  function saveOff(list) {
    try { localStorage.setItem(OFF_KEY, JSON.stringify(list)); } catch (e) { /* приватный режим — живём без сохранения */ }
  }
  function renderAdmin() {
    const off = loadOff();
    adminList.innerHTML = PRODUCTS.map((p) => `
      <button class="toggle${off.includes(p.id) ? '' : ' on'}" type="button" data-id="${esc(p.id)}">
        <span class="t-lead" style="font-size:1.25rem">${esc(p.name)}</span><span class="t-cap">${esc(formatLabel(p))}</span>
      </button>`).join('');
  }
  adminList.addEventListener('click', (e) => {
    const t = e.target.closest('.toggle');
    if (!t) return;
    let off = loadOff();
    off = off.includes(t.dataset.id) ? off.filter((x) => x !== t.dataset.id) : off.concat(t.dataset.id);
    saveOff(off);
    t.classList.toggle('on');
  });
  $('#admin-all').addEventListener('click', () => { saveOff([]); renderAdmin(); });
  $('#admin-close').addEventListener('click', () => { admin.hidden = true; });
  $('#idle-stay').addEventListener('click', stopCountdown);

  let taps = [];
  $('#brand').addEventListener('click', (e) => {
    e.stopPropagation();
    const now = Date.now();
    taps = taps.filter((t) => now - t < 2500).concat(now);
    if (taps.length >= 5) { taps = []; renderAdmin(); admin.hidden = false; }
  });

  intro.addEventListener('click', explode);

  /* ===================== запуск ===================== */

  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('gesturestart', (e) => e.preventDefault());

  // Прогреваем картинки, чтобы на iPad ничего не мигало
  [...QUESTIONS.flatMap((q) => q.options.map((o) => o.image || o.icon)).filter(Boolean), ...PRODUCTS.map((p) => p.image)]
    .forEach((src) => { new Image().src = src; });

  FX.init($('#fx'), 'assets/bg/gradient.png').then((ok) => { if (!ok) document.body.classList.add('no-gl'); })
    .catch(() => document.body.classList.add('no-gl'));

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    // Новая версия встала в кеш — перезагружаемся сами, но только на старте
    let hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController) { hadController = true; return; }
      if (state.screen === 'intro') location.reload();
      else reloadOnStart = true;
    });
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
})();
