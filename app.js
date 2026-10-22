(() => {
  'use strict';

  const PRODUCTS = window.TM_PRODUCTS;
  const QUESTIONS = window.TM_QUESTIONS;
  const FORMAT_LABEL = window.TM_FORMAT_LABEL;
  const { recommend, formatKey } = window.TM_MATCH;

  const IDLE_QUESTION_MS = 40000;  // тишина на вопросе → «Still there?»
  const IDLE_RESULT_MS = 75000;    // на результате даём дольше показать бариста
  const IDLE_COUNTDOWN = 10;       // секунд до сброса после «Still there?»
  const AUTO_ADVANCE_MS = 280;     // пауза после выбора, чтобы увидеть нажатие

  const app = document.getElementById('app');
  const restartBtn = document.getElementById('restart');

  let state = { screen: 'start', step: 0, answers: {} };
  let reloadOnStart = false;  // пришла новая версия, пока человек проходил квиз

  /* ===================== экраны ===================== */

  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pad = (n) => String(n).padStart(2, '0');

  const visibleQuestions = () => QUESTIONS.filter((q) => !(q.skipIf && q.skipIf(state.answers)));

  function dashes(total, current) {
    return `<div class="dashes">${Array.from({ length: total }, (_, i) => `<span class="dash${i === current ? ' on' : ''}"></span>`).join('')}</div>`;
  }

  function mount(html, cls) {
    const prev = app.querySelector('.screen:not(.leaving)');
    if (prev) {
      prev.classList.add('leaving');
      setTimeout(() => prev.remove(), 230);
    }
    const el = document.createElement('section');
    el.className = `screen ${cls}`;
    el.innerHTML = html;
    app.appendChild(el);
    restartBtn.hidden = state.screen !== 'question';
    return el;
  }

  function renderStart() {
    if (reloadOnStart) { location.reload(); return; }
    state = { screen: 'start', step: 0, answers: {} };
    const total = QUESTIONS.length;
    const el = mount(`
      <div class="card">
        ${dashes(total, 0)}
        <h1 class="display">Find<br>your<br>coffee.</h1>
        <div class="bottom">
          <p class="lead">${total} quick questions while you wait in line. We’ll match you with the beans, capsules, drips or cans from our bar that fit you best.</p>
          <div class="start-foot">
            <button class="btn btn-primary btn-big" type="button">Start the quiz</button>
            <p class="eyebrow">Takes 30 seconds<br>No sign-up</p>
          </div>
        </div>
      </div>
    `, 'start');
    el.addEventListener('click', () => { state.screen = 'question'; state.step = 0; renderQuestion(); });
  }

  function renderQuestion() {
    const qs = visibleQuestions();
    const q = qs[state.step];
    const value = state.answers[q.id];
    const isMulti = q.type === 'multi';
    const selected = (v) => (isMulti ? (value || []).includes(v) : value === v);
    const cols = q.options.length > 3 ? ' cols-2' : '';
    const hint = !isMulti ? 'Tap one' : q.max === 2 ? 'Pick up to two' : 'Pick all that apply';
    const isLast = state.step === qs.length - 1;

    const el = mount(`
      <div class="card">
        ${dashes(qs.length, state.step)}
        <div class="q-meta"><span class="eyebrow">Question ${pad(state.step + 1)} / ${pad(qs.length)}</span><span class="eyebrow">${hint}</span></div>
        <h1 class="display">${esc(q.title)}</h1>
        <div class="bottom">
          <div class="options${cols}">
            ${q.options.map((o, i) => `
              <button class="opt${selected(o.value) ? ' selected' : ''}" type="button" data-value="${esc(o.value)}" style="--i:${i}">
                <span class="opt-label">${esc(o.label)}</span>
                ${o.sub ? `<span class="opt-sub">${esc(o.sub)}</span>` : ''}
                ${isMulti ? '<span class="tick"></span>' : ''}
              </button>`).join('')}
          </div>
          <div class="actions">
            <button class="btn btn-ghost" type="button" data-act="back">Back</button>
            ${isMulti ? `<button class="btn btn-primary" type="button" data-act="next"${(value || []).length ? '' : ' disabled'}>${isLast ? 'Show my coffee' : 'Next question'}</button>` : ''}
          </div>
        </div>
      </div>
    `, 'question');

    let locked = false;
    el.querySelector('.options').addEventListener('click', (e) => {
      const btn = e.target.closest('.opt');
      if (!btn || locked) return;
      const v = btn.dataset.value;
      if (!isMulti) {
        state.answers[q.id] = v;
        el.querySelectorAll('.opt').forEach((b) => b.classList.toggle('selected', b === btn));
        locked = true;
        setTimeout(next, AUTO_ADVANCE_MS);
        return;
      }
      let list = (state.answers[q.id] || []).slice();
      if (list.includes(v)) list = list.filter((x) => x !== v);
      else {
        list.push(v);
        if (q.max && list.length > q.max) list.shift();
      }
      state.answers[q.id] = list;
      el.querySelectorAll('.opt').forEach((b) => b.classList.toggle('selected', list.includes(b.dataset.value)));
      el.querySelector('[data-act="next"]').disabled = list.length === 0;
    });

    el.querySelector('.actions').addEventListener('click', (e) => {
      const act = e.target.closest('[data-act]');
      if (!act || locked) return;
      if (act.dataset.act === 'back') back();
      if (act.dataset.act === 'next') { locked = true; next(); }
    });
  }

  function next() {
    const qs = visibleQuestions();
    if (state.step < qs.length - 1) { state.step += 1; renderQuestion(); }
    else renderResult();
  }

  function back() {
    if (state.step === 0) renderStart();
    else { state.step -= 1; renderQuestion(); }
  }

  function scales(taste) {
    return `<div class="scales">${['acidity', 'bitterness', 'sweetness'].map((k) => `
      <div class="scale"><span class="scale-label">${k}</span>
        <span class="scale-bar">${[1, 2, 3, 4, 5].map((n) => `<i class="${n <= taste[k] ? 'on' : ''}"></i>`).join('')}</span>
      </div>`).join('')}</div>`;
  }

  const formatLabel = (p) => FORMAT_LABEL[formatKey(p)];

  function renderResult() {
    state.screen = 'result';
    const picks = recommend(PRODUCTS, state.answers, loadOff());
    if (!picks.length) { renderStart(); return; }
    const [main, ...alts] = picks;
    const p = main.product;

    const el = mount(`
      <div class="card">
        <div class="match-head"><span class="eyebrow">Your match</span><span class="eyebrow">${esc(formatLabel(p))}</span></div>
        <h1 class="display match-name">${esc(p.name)}</h1>
        <div class="match-body">
          <div class="match-info">
            <p class="notes">${esc(p.notes.join(' · '))}</p>
            <p class="blurb">${esc(p.blurb)}</p>
            <ul class="why">${main.reasons.slice(0, 3).map((r) => `<li>${esc(r)}</li>`).join('')}</ul>
          </div>
          ${scales(p.taste)}
        </div>
      </div>
      ${alts.length ? `<div class="alts-wrap"><p class="eyebrow">Also for you</p><div class="alts">${alts.map((r) => `
        <div class="panel alt">
          <p class="eyebrow">${esc(formatLabel(r.product))}</p>
          <p class="alt-name">${esc(r.product.name)}</p>
          <p class="notes">${esc(r.product.notes.join(' · '))}</p>
          <ul class="why">${r.reasons.slice(0, 2).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
          ${scales(r.product.taste)}
        </div>`).join('')}</div></div>` : ''}
      <div class="result-foot">
        <p>Show this screen to our barista.<span>We’ll grab it for you from the bar.</span></p>
        <button class="btn btn-primary" type="button" data-act="again">Start over</button>
      </div>
    `, 'result');
    el.querySelector('[data-act="again"]').addEventListener('click', renderStart);
    fitResult(el);
  }

  // Длинное название + длинные причины могут не влезть — ужимаем по ступенькам
  function fitResult(el) {
    for (const level of ['tight', 'tighter']) {
      if (el.scrollHeight <= el.clientHeight + 1) return;
      el.classList.add(level);
    }
  }

  restartBtn.addEventListener('click', renderStart);

  /* ===================== простой и сброс ===================== */

  const idle = document.getElementById('idle');
  const idleCount = document.getElementById('idle-count');
  let lastTouch = Date.now();
  let countdown = null;

  function stopCountdown() {
    clearInterval(countdown);
    countdown = null;
    idle.hidden = true;
  }

  document.addEventListener('pointerdown', () => {
    lastTouch = Date.now();
    if (countdown) stopCountdown();
  }, true);

  setInterval(() => {
    if (state.screen === 'start' || countdown || !admin.hidden) return;
    const limit = state.screen === 'result' ? IDLE_RESULT_MS : IDLE_QUESTION_MS;
    if (Date.now() - lastTouch < limit) return;
    let left = IDLE_COUNTDOWN;
    idleCount.textContent = left;
    idle.hidden = false;
    countdown = setInterval(() => {
      left -= 1;
      idleCount.textContent = left;
      if (left <= 0) { stopCountdown(); renderStart(); }
    }, 1000);
  }, 1000);

  /* ===================== админка: 5 тапов по логотипу ===================== */

  const admin = document.getElementById('admin');
  const adminList = document.getElementById('admin-list');
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
        <b>${esc(p.name)}</b><small>${esc(formatLabel(p))}</small>
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
  document.getElementById('admin-all').addEventListener('click', () => { saveOff([]); renderAdmin(); });
  document.getElementById('admin-close').addEventListener('click', () => { admin.hidden = true; renderStart(); });

  let taps = [];
  document.getElementById('brand').addEventListener('click', () => {
    const now = Date.now();
    taps = taps.filter((t) => now - t < 2500).concat(now);
    if (taps.length >= 5) { taps = []; renderAdmin(); admin.hidden = false; }
  });

  /* ===================== старт ===================== */

  document.addEventListener('contextmenu', (e) => e.preventDefault());
  document.addEventListener('gesturestart', (e) => e.preventDefault());

  if ('serviceWorker' in navigator && location.protocol === 'https:') {
    // Новая версия встала в кеш — перезагружаемся сами, но только на стартовом экране
    let hadController = Boolean(navigator.serviceWorker.controller);
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!hadController) { hadController = true; return; }  // самая первая установка
      if (state.screen === 'start') location.reload();
      else reloadOnStart = true;
    });
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }

  renderStart();
})();
