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
  const CHECK_STEP_MS = 800;       // загрузка: сколько «грузится» одна строка

  const $ = (s) => document.querySelector(s);
  const intro = $('#intro');
  const hand = $('#hand');
  const stage = $('#stage');
  const panel = $('#panel');

  // Копия стартового текста в overlay-наложении: при взрыве обычный текст плавно гаснет,
  // а копия проявляется поверх градиента и тоже растворяется — как во втором кадре Figma
  const ghost = intro.cloneNode(true);
  ghost.id = 'intro-ghost';
  ghost.classList.add('ghost');
  ghost.setAttribute('aria-hidden', 'true');
  ghost.querySelector('#brand').removeAttribute('id');
  intro.after(ghost);

  let state = { screen: 'intro', step: 0, answers: {}, result: null };
  let busy = false;
  let reloadOnStart = false;      // пришла новая версия, пока человек проходил квиз
  let barsOn = 0;                 // сколько полосок прогресса уже чёрные
  let shareFile = null;           // картинка результата для «Поделиться», готовится заранее
  const timers = new Set();
  const wait = (ms) => new Promise((r) => { const id = setTimeout(() => { timers.delete(id); r(); }, ms); timers.add(id); });
  const clearTimers = () => { timers.forEach(clearTimeout); timers.clear(); };

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const formatLabel = (p) => FORMAT_LABEL[formatKey(p)];

  /* ===================== что есть на баре ===================== */

  // По умолчанию на баре товары с onBar: true (data.js); админка хранит отличия от этого набора
  const BAR_KEY = 'tm-coffee-match-bar';
  function loadBar() { try { return JSON.parse(localStorage.getItem(BAR_KEY)) || {}; } catch (e) { return {}; } }
  function saveBar(map) { try { localStorage.setItem(BAR_KEY, JSON.stringify(map)); } catch (e) { /* приватный режим */ } }
  const onBar = (p, map = loadBar()) => (p.id in map ? map[p.id] : Boolean(p.onBar));
  const barProducts = () => { const map = loadBar(); return PRODUCTS.filter((p) => onBar(p, map)); };
  const has = (need) => barProducts().some((p) => (need === 'decaf' ? p.decaf : p.format === need));

  const visibleQuestions = () => QUESTIONS.filter((q) => !(q.skipIf && q.skipIf(state.answers)) && (!q.needs || has(q.needs)));
  const visibleOptions = (q) => q.options.filter((o) => !o.needs || has(o.needs));

  /* ===================== старт и взрыв ===================== */

  function replay(el) {
    for (const n of [el, ...el.children]) { n.style.animation = 'none'; void n.offsetWidth; n.style.animation = ''; }
  }

  // Пробуем спрятать статус-бар iPad: полноэкранный режим браузер даёт включить только по нажатию.
  // Только на тач-экранах — на компьютере во время правок это мешало бы
  function goFullscreen() {
    const el = document.documentElement;
    if (!matchMedia('(pointer: coarse)').matches || document.fullscreenElement || document.webkitFullscreenElement) return;
    try {
      const r = (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
      if (r && r.catch) r.catch(() => {});
    } catch (e) { /* не поддерживается — остаёмся как есть */ }
  }

  async function explode() {
    if (busy || state.screen !== 'intro') return;
    busy = true;
    goFullscreen();
    state = { screen: 'question', step: 0, answers: {}, result: null };
    hand.classList.add('gone');
    intro.classList.add('fading');
    ghost.classList.add('glow');
    document.body.classList.add('boomed');
    FX.animateBoom(1, BOOM_MS);
    await wait(650);
    ghost.classList.add('out');
    await wait(PANEL_AT_MS - 650);
    barsOn = 0;
    stage.hidden = false;
    stage.classList.remove('leave');
    stage.classList.add('enter');
    renderQuestion();
    await wait(1100);
    for (const el of [intro, ghost, hand]) el.classList.add('hidden');
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
    intro.classList.remove('hidden', 'fading');
    ghost.classList.remove('hidden', 'glow', 'out');
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
    const options = visibleOptions(q);
    const value = state.answers[q.id];
    const multi = q.type === 'multi';
    const isSel = (v) => (multi ? (value || []).includes(v) : value === v);
    const isLast = state.step === qs.length - 1;
    order = 0;

    let opts = '';
    if (q.layout === 'grid') {
      opts = `<div class="opts-grid">${options.map((o) => `
        <button ${a('opt opt-card' + (isSel(o.value) ? ' selected' : ''))} type="button" data-value="${esc(o.value)}">
          <span class="t-lead">${esc(o.label)}</span>${o.note ? `<span class="t-body">${esc(o.note)}</span>` : ''}
        </button>`).join('')}</div>`;
    } else if (q.layout === 'images') {
      opts = `<div class="opts-images">${options.map((o) => `
        <button ${a('opt-image' + (isSel(o.value) ? ' selected' : ''))} type="button" data-value="${esc(o.value)}">
          <span class="ph"><img src="${esc(o.image)}" alt=""></span>
          <span class="label"><span class="t-sub">${esc(o.label)}</span></span>
        </button>`).join('')}</div>`;
    } else {
      opts = `<div class="opts-rows">${options.map((o) => `
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

    const el = mount(progress(qs.length) + head + opts + actions, q.layout === 'images' ? 'stack' : 'spread', state.step + 1);

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
    const picks = recommend(barProducts(), state.answers, []);
    state.result = picks[0] || null;
    if (!state.result) { backToIntro(); return; }
    const total = visibleQuestions().length;
    order = 0;
    const head = `<div class="q-head"><p ${a('helper t-body')}>${esc(LOADING.helper)}</p><h1 ${a('t-title')}>${LOADING.title.map(esc).join('<br>')}</h1></div>`;
    const rows = `<div class="checks" style="--step:${CHECK_STEP_MS}ms">${LOADING.steps.map((s) => `
      <div class="opt check-row"><i class="fill"></i><span class="check"><svg viewBox="0 0 20 20"><path d="M4 10.5l4 4 8-9"/></svg></span><span class="t-lead">${esc(s)}</span></div>`).join('')}</div>`;
    const actions = `<div ${a('actions')}><div class="group">${btn.restart()}</div></div>`;
    const el = mount(progress(total) + head + rows + actions, 'spread', total);
    el.addEventListener('click', (e) => { if (e.target.closest('[data-act="restart"]')) backToIntro(); });

    // Пока строки «грузятся», заранее рисуем картинку результата для «Поделиться»
    shareFile = null;
    const p = state.result.product;
    makeShareFile(p).then((f) => { shareFile = f; }).catch(() => {});

    const items = el.querySelectorAll('.check-row');
    items.forEach((row, i) => {
      const t0 = SWAP_MS + 250 + i * CHECK_STEP_MS;
      wait(t0).then(() => row.classList.add('in', 'running'));
      wait(t0 + CHECK_STEP_MS - 100).then(() => { row.classList.remove('running'); row.classList.add('done'); });
    });
    wait(SWAP_MS + 250 + items.length * CHECK_STEP_MS + 500).then(() => { if (state.screen === 'loading') renderResult(); });
  }

  /* ===================== результат ===================== */

  const details = (p) => DETAILS[p.id] || { title: [p.name, ''], roast: '—', process: '—', variety: '—', origin: '—', farm: '—', altitude: '—' };

  // QR со стрелкой The Miners в центре, как в макете. Уровень коррекции H переживает вырезанную середину
  const ARROW_D = 'M25.9958 60H48.6373V38.5325H74.6331L37.3166 0L0 38.5325H25.9958V60Z';
  const ARROW_W = 74.6331, ARROW_H = 60;
  function qrModel(text) {
    const qr = window.qrcode(0, 'H');
    qr.addData(text);
    qr.make();
    const n = qr.getModuleCount();
    let hole = Math.round(n * 0.3);
    if (hole % 2 === 0) hole += 1;
    const h0 = (n - hole) / 2;
    const inHole = (r, c) => r >= h0 && r < h0 + hole && c >= h0 && c < h0 + hole;
    const w = hole - 2.4, h = w * ARROW_H / ARROW_W;
    return { n, dark: (r, c) => qr.isDark(r, c) && !inHole(r, c), arrow: { x: (n - w) / 2, y: (n - h) / 2, w, h } };
  }
  function qrSvg(text) {
    const q = qrModel(text), a = q.arrow;
    let path = '';
    for (let r = 0; r < q.n; r++) for (let c = 0; c < q.n; c++) if (q.dark(r, c)) path += `M${c} ${r}h1v1h-1z`;
    return `<svg viewBox="0 0 ${q.n} ${q.n}"><path d="${path}" fill="#141414" shape-rendering="crispEdges"/>` +
      `<path d="${ARROW_D}" fill="#141414" transform="translate(${a.x} ${a.y}) scale(${a.w / ARROW_W})"/></svg>`;
  }

  function renderResult() {
    state.screen = 'result';
    const p = state.result.product;
    const d = details(p);
    const total = visibleQuestions().length;
    order = 0;
    const kv = (k, v, small) => `<div class="kv"><span class="t-key">${esc(k)}:</span><span class="v ${small ? 't-small' : 't-body'}">${esc(v || '—')}</span></div>`;
    const hr = '<div class="divider"></div>';
    const squares = (n) => `<span class="squares">${[1, 2, 3, 4, 5].map((i) => `<i class="${i <= n ? 'on' : ''}"></i>`).join('')}</span>`;
    const taste = `<div class="taste">${['acidity', 'bitterness', 'sweetness'].map((k) => `
      <div class="taste-row">${squares(p.taste[k])}<span class="t-body">${k[0].toUpperCase() + k.slice(1)}</span></div>`).join('')}</div>`;

    const html = progress(total) + `
      <div class="res-body">
        <div ${a('res-meta')}><span class="t-body">Your match</span><span class="t-body">${esc(formatLabel(p))}</span></div>
        <div ${a('res-titles')}><h1 class="t-title">${esc(d.title[0])}</h1>${d.title[1] ? `<h2 class="t-h4">${esc(d.title[1])}</h2>` : ''}</div>
        <div ${a('res-image')}><img src="${esc(p.image)}" alt=""></div>
        <div ${a('res-table')}>
          <div class="res-grid">
            ${kv('Roast', d.roast)}${kv('Origin', d.origin)}${hr}${hr}
            ${kv('Process', d.process)}${kv('Farm', d.farm)}${hr}${hr}
            ${kv('Notes', p.notes.join(', '), true)}${kv('Altitude', d.altitude)}${hr}${hr}
            ${kv('Variety', d.variety)}${taste}
          </div>
          <div class="qr-col">${qrSvg(p.url)}<span class="t-key">Open in e-shop</span></div>
        </div>
      </div>
      <div ${a('actions')}><div class="group">${btn.back()}${btn.restart()}</div>
        <button class="btn btn-yellow" type="button" data-act="share"><span class="t-btn">Share to your device</span><img src="assets/icons/share.svg" alt=""></button>
      </div>`;
    const el = mount(html, 'result', total);
    el.addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (!act) return;
      if (act.dataset.act === 'back') { state.step = visibleQuestions().length - 1; renderQuestion(); }
      if (act.dataset.act === 'restart') backToIntro();
      if (act.dataset.act === 'share') shareResult(p);
    });
  }

  /* ===================== «Поделиться»: картинка результата через AirDrop ===================== */

  async function shareResult(p) {
    const file = shareFile;
    if (file && navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file] }); } catch (e) { /* закрыли меню — ничего не делаем */ }
      return;
    }
    openQR(p);   // нет системного «Поделиться» (например, браузер на компьютере) — показываем QR крупно
  }

  const loadImg = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });

  // Рисуем экран результата на canvas (в 1,5 раза больше макета) — без кнопок, с подписью The Miners внизу
  async function makeShareFile(p) {
    const d = details(p);
    const S = 1.5, W = 1024, H = 1366;
    const c = document.createElement('canvas');
    c.width = W * S; c.height = H * S;
    const x = c.getContext('2d');
    x.scale(S, S);
    await Promise.all([300, 400, 500, 700, 900].map((w) => document.fonts.load(`${w} 20px TheMinersFont`)));
    const [bg, pack] = await Promise.all([loadImg('assets/bg/gradient.png'), loadImg(p.image)]);
    const font = (w, s) => { x.font = `${w} ${s}px TheMinersFont, Arial`; };
    const ink = '#141414';

    // фон и панель
    const k = Math.max(W / bg.width, H / bg.height);
    x.drawImage(bg, (W - bg.width * k) / 2, (H - bg.height * k) / 2, bg.width * k, bg.height * k);
    x.fillStyle = '#f7f7f7'; x.beginPath(); x.roundRect(60, 60, 904, 1246, 40); x.fill();

    const L = 120, R = 904, CW = 784;
    let y = 120;
    const total = visibleQuestions().length;
    const bw = (CW - 10 * (total - 1)) / total;
    x.fillStyle = ink;
    for (let i = 0; i < total; i++) { x.beginPath(); x.roundRect(L + i * (bw + 10), y, bw, 6, 3); x.fill(); }
    y += 6 + 80;

    font(400, 20); x.textBaseline = 'alphabetic';
    x.textAlign = 'left'; x.fillText('Your match', L, y + 14);
    x.textAlign = 'right'; x.fillText(formatLabel(p), R, y + 14);
    x.textAlign = 'left';
    y += 14 + 40;

    const fit = (text, weight, size) => { font(weight, size); while (x.measureText(text).width > CW && size > 20) { size -= 2; font(weight, size); } return size; };
    const t1 = d.title[0].toUpperCase(), t2 = (d.title[1] || '').toUpperCase();
    let s1 = fit(t1, 900, 96); x.fillText(t1, L, y + s1 * 0.72); y += s1 * 0.72 + 20;
    if (t2) { const s2 = fit(t2, 900, 48); x.fillText(t2, L, y + s2 * 0.72); y += s2 * 0.72; }
    y += 40;

    // низ: подпись, выше — таблица, между — фото пачки
    const footY = 1246;
    font(500, 20); x.fillText('Coffee Match · The Miners', L, footY);
    x.textAlign = 'right'; x.fillText('theminers.eu', R, footY); x.textAlign = 'left';
    // таблица: две колонки характеристик со строками на одной высоте, справа QR
    const qrS = 140, colW = (CW - qrS - 80) / 2, cols = [L, L + colW + 40];
    const cap = (size) => size * 0.72;   // текст обрезан по высоте прописных, как на экране
    const wrap = (text, maxW) => {
      const words = String(text).split(' '); const lines = []; let line = '';
      for (const w of words) { const tryL = line ? line + ' ' + w : w; if (x.measureText(tryL).width > maxW && line) { lines.push(line); line = w; } else line = tryL; }
      if (line) lines.push(line); return lines;
    };
    const cell = (k, v, size = 20) => {
      font(700, 16); const lw = x.measureText(k + ':').width;
      font(400, size); const lines = wrap(v || '—', colW - lw - 16);
      return { k, size, lines, h: cap(size) + (lines.length - 1) * size * 1.2 };
    };
    const rows = [
      [cell('Roast', d.roast), cell('Origin', d.origin)],
      [cell('Process', d.process), cell('Farm', d.farm)],
      [cell('Notes', p.notes.join(', '), 16), cell('Altitude', d.altitude)],
      [cell('Variety', d.variety), { taste: true, h: 3 * 14 + 2 * 6 }]
    ];
    const rowH = rows.map((r) => Math.max(r[0].h, r[1].h));
    const gridH = rowH.reduce((sum, h) => sum + h, 0) + (rows.length - 1) * 40.6;
    const tableTop = footY - 14 - 60 - Math.max(gridH, qrS + 20 + cap(16));
    const imgBottom = tableTop - 40;
    x.fillStyle = '#ffffff'; x.beginPath(); x.roundRect(L, y, CW, imgBottom - y, 16); x.fill();
    const box = { x: L + 20, y: y + 20, w: CW - 40, h: imgBottom - y - 40 };
    const pk = Math.min(box.w / pack.width, box.h / pack.height);
    x.filter = 'brightness(1.013)';
    x.drawImage(pack, box.x + (box.w - pack.width * pk) / 2, box.y + (box.h - pack.height * pk) / 2, pack.width * pk, pack.height * pk);
    x.filter = 'none';
    x.fillStyle = ink; x.strokeStyle = ink;

    const drawTaste = (cx, ty) => ['acidity', 'bitterness', 'sweetness'].forEach((key, r) => {
      const sy = ty + r * 20;
      for (let i = 1; i <= 5; i++) {
        const sx = cx + (i - 1) * 18;
        if (i <= p.taste[key]) x.fillRect(sx, sy, 14, 14);
        else { x.lineWidth = 1.29; x.strokeRect(sx + 0.645, sy + 0.645, 12.71, 12.71); }
      }
      font(400, 20); x.textAlign = 'right'; x.fillText(key[0].toUpperCase() + key.slice(1), cx + colW, sy + 7 + cap(20) / 2); x.textAlign = 'left';
    });
    let ry = tableTop;
    rows.forEach((r, i) => {
      r.forEach((c, j) => {
        const cx = cols[j];
        if (c.taste) { drawTaste(cx, ry); return; }
        font(700, 16); x.fillText(c.k + ':', cx, ry + cap(16));
        font(400, c.size); x.textAlign = 'right';
        c.lines.forEach((l, n) => x.fillText(l, cx + colW, ry + cap(c.size) + n * c.size * 1.2));
        x.textAlign = 'left';
      });
      ry += rowH[i];
      if (i < rows.length - 1) { ry += 20; cols.forEach((cx) => x.fillRect(cx, ry, colW, 0.6)); ry += 20.6; }
    });

    const q = qrModel(p.url), qx = R - qrS, qy = tableTop, m = qrS / q.n;
    for (let r = 0; r < q.n; r++) for (let cc = 0; cc < q.n; cc++) if (q.dark(r, cc)) x.fillRect(qx + cc * m, qy + r * m, m + 0.3, m + 0.3);
    x.save(); x.translate(qx + q.arrow.x * m, qy + q.arrow.y * m); x.scale(q.arrow.w * m / ARROW_W, q.arrow.w * m / ARROW_W); x.fill(new Path2D(ARROW_D)); x.restore();
    font(700, 16); x.fillText('Open in e-shop', qx, qy + qrS + 20 + cap(16));

    const blob = await new Promise((res) => c.toBlob(res, 'image/png'));
    return new File([blob], `the-miners-${p.id}.png`, { type: 'image/png' });
  }

  /* ===================== QR крупно (если «Поделиться» недоступно) ===================== */

  const qrOverlay = $('#qr');
  function openQR(p) {
    $('#qr-code').innerHTML = qrSvg(p.url);
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

  function renderAdmin() {
    const map = loadBar();
    adminList.innerHTML = PRODUCTS.map((p) => `
      <button class="toggle${onBar(p, map) ? ' on' : ''}" type="button" data-id="${esc(p.id)}">
        <span class="t-lead" style="font-size:1.25rem">${esc(p.name)}</span><span class="t-cap">${esc(formatLabel(p))}</span>
      </button>`).join('');
  }
  adminList.addEventListener('click', (e) => {
    const t = e.target.closest('.toggle');
    if (!t) return;
    const map = loadBar();
    const p = PRODUCTS.find((x) => x.id === t.dataset.id);
    map[p.id] = !onBar(p, map);
    if (map[p.id] === Boolean(p.onBar)) delete map[p.id];
    saveBar(map);
    t.classList.toggle('on');
  });
  // Строка для диагностики на iPad: какая версия реально запущена и какие размеры видит страница
  async function renderAdminInfo() {
    const ver = window.caches ? (await caches.keys().catch(() => [])).find((k) => k.startsWith('coffee-match')) : null;
    const mode = isStandalone() ? 'home screen' : 'browser';
    const fs = (document.fullscreenEnabled || document.webkitFullscreenEnabled) ? 'available' : 'unavailable';
    $('#admin-info').textContent = `${ver || 'no offline cache yet'} · ${mode} · screen ${screen.width}×${screen.height} · window ${innerWidth}×${innerHeight} · page ${getComputedStyle(document.documentElement).getPropertyValue('--app-h') || '—'} · fullscreen ${fs}`;
  }
  $('#admin-all').addEventListener('click', () => { saveBar({}); renderAdmin(); });
  $('#admin-close').addEventListener('click', () => { admin.hidden = true; });
  $('#idle-stay').addEventListener('click', stopCountdown);

  let taps = [];
  $('#brand').addEventListener('click', (e) => {
    e.stopPropagation();
    const now = Date.now();
    taps = taps.filter((t) => now - t < 2500).concat(now);
    if (taps.length >= 5) { taps = []; renderAdmin(); renderAdminInfo(); admin.hidden = false; }
  });

  intro.addEventListener('click', explode);

  // ?debug — доступ к картинке для «Поделиться» из консоли
  if (/[?&]debug/.test(location.search)) window.__tm = { makeShareFile, state: () => state };

  /* ===================== запуск ===================== */

  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('gesturestart', (e) => e.preventDefault());

  // iPad, иконка на экране «Домой»: iOS отдаёт высоту окна без статус-бара, хотя рисует страницу от самого верха,
  // и снизу остаётся тёмная полоса. Растягиваем всё на настоящую высоту экрана (всё полноэкранное считается от верха)
  const isStandalone = () => navigator.standalone === true || matchMedia('(display-mode: standalone)').matches;
  function fitScreen() {
    const gap = screen.height - innerHeight;
    const root = document.documentElement.style;
    if (isStandalone() && gap >= 0 && gap <= 80 && !document.fullscreenElement && !document.webkitFullscreenElement) root.setProperty('--app-h', screen.height + 'px');
    else root.removeProperty('--app-h');
  }
  fitScreen();
  addEventListener('resize', fitScreen);

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
    // Приложение с иконки iPad обычно не перезапускается, а просыпается со старым кодом —
    // поэтому проверяем обновление при каждом возвращении на экран и раз в 10 минут
    navigator.serviceWorker.register('sw.js').then((reg) => {
      document.addEventListener('visibilitychange', () => { if (!document.hidden) reg.update().catch(() => {}); });
      setInterval(() => reg.update().catch(() => {}), 10 * 60 * 1000);
    }).catch(() => {});
  }
})();
