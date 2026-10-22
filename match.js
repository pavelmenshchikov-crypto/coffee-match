/* =====================================================================
   THE MINERS — Festival Coffee Match
   Подбор: каждый товар получает очки за совпадение с ответами,
   три лучших идут на экран результата. Веса — здесь.
   ===================================================================== */

(function (root) {
  'use strict';

  // Насколько формат товара подходит способу заварки: 10 — точно, меньше — «тоже можно»
  const FORMAT_FIT = {
    espresso: { 'beans:espresso': 10 },
    capsules: { capsules: 10 },
    filter: { 'beans:filter': 10, drip: 4, 'beans:espresso': 3 },
    moka: { 'beans:espresso': 10, 'beans:filter': 5 },
    nogear: { drip: 10, can: 3 },
    cold: { can: 10 }
  };

  const FORMAT_REASON = {
    espresso: { 'beans:espresso': 'Roasted for your espresso machine' },
    capsules: { capsules: 'Fits your Nespresso® Original machine' },
    filter: { 'beans:filter': 'Roasted for filter — V60, Chemex, AeroPress', drip: 'Your filter cup, packed for days away from home', 'beans:espresso': 'A darker roast that works in your filter, too' },
    moka: { 'beans:espresso': 'Made for your moka pot or French press', 'beans:filter': 'Shines in a French press, too' },
    nogear: { drip: 'No gear needed — just hot water and a mug', can: 'No gear at all — just open the can' },
    cold: { can: 'Ice-cold and ready to drink, right now' }
  };

  // Если формат не совпал ни с одним способом заварки
  const FALLBACK_REASON = {
    'beans:espresso': 'Whole beans, roasted for espresso',
    'beans:filter': 'Whole beans, roasted for filter',
    capsules: 'In capsules, if you ever get the machine',
    drip: 'Try it as a drip bag — no gear needed',
    can: 'Grab one cold from our bar'
  };

  const FAMILY_NAME = {
    choc: 'chocolate & caramel',
    fruit: 'berries & fruit',
    floral: 'florals & tea',
    wild: 'wild & fermented'
  };

  const ACIDITY_TARGET = { low: 1.5, mid: 3, high: 4.7 };

  const formatKey = (p) => (p.format === 'beans' ? `beans:${p.roast}` : p.format);

  function score(p, a) {
    const reasons = [];
    let s = 0;
    const key = formatKey(p);

    // формат
    let best = 0;
    let bestReason = null;
    for (const method of a.brew || []) {
      const fit = (FORMAT_FIT[method] || {})[key] || 0;
      if (fit > best) { best = fit; bestReason = FORMAT_REASON[method][key]; }
    }
    s += best;
    // формат, который человек не выбирал, называем первым, чтобы не было сюрпризом
    reasons.push(best >= 10 ? { w: 5, text: bestReason } : { w: 9, text: bestReason || FALLBACK_REASON[key] });

    // вкус
    const fav = a.flavour || [];
    const hits = p.families.filter((f) => fav.includes(f));
    if (hits.length) {
      s += 2.5 * hits.length;
      reasons.push({ w: 2.5 * hits.length, text: `Matches what you love: ${hits.map((f) => FAMILY_NAME[f]).join(', ')}` });
    } else if (fav.length) {
      s -= 0.5;
    }

    // кислотность
    if (a.acidity) {
      const acid = p.taste.acidity;
      s += 2 - Math.abs(acid - ACIDITY_TARGET[a.acidity]);
      if (a.acidity === 'low' && acid <= 2) reasons.push({ w: 2, text: 'Low acidity — smooth and round' });
      if (a.acidity === 'high' && acid >= 4) reasons.push({ w: 2, text: 'Bright, juicy acidity — just how you like it' });
      if (a.acidity === 'mid' && acid === 3) reasons.push({ w: 1.5, text: 'Balanced acidity, never sharp' });
    }

    // молоко
    if (a.milk === 'milk') {
      s += 1.2 * p.milk - 1;
      if (p.milk >= 2) reasons.push({ w: p.milk, text: 'Full body that loves milk' });
    } else if (a.milk === 'black') {
      if (p.milk <= 1) { s += 0.5; reasons.push({ w: 0.8, text: 'Clean and clear — best enjoyed black' }); }
    } else if (a.milk === 'both') {
      s += 0.4 * p.milk;
      if (p.milk >= 2) reasons.push({ w: 1, text: 'Great black, even better with milk' });
    }

    // кофеин
    if (a.caffeine === 'decaf') {
      s += p.decaf ? 12 : -12;
      if (p.decaf) reasons.push({ w: 5, text: 'All the flavour, none of the caffeine' });
    } else if (a.caffeine === 'yes' && p.decaf) {
      s -= 12;
    } else if (a.caffeine === 'any' && p.decaf) {
      s -= 1.5;
    }

    // опыт
    const adv = p.adventure;
    if (a.level === 'beginner') {
      s += adv === 1 ? 2 : adv === 3 ? -2 : 0;
      if (adv === 1) reasons.push({ w: 1.5, text: 'An easy, crowd-pleasing cup' });
    } else if (a.level === 'regular') {
      s += adv === 2 ? 1 : adv === 1 ? 0.5 : 0;
      if (adv === 2) reasons.push({ w: 1, text: 'A step beyond the everyday' });
    } else if (a.level === 'nerd') {
      s += adv === 3 ? 2 : adv === 2 ? 1 : -1;
      if (adv === 3) reasons.push({ w: 2, text: 'A wild lot for a curious palate' });
    }

    s += p.taste.sweetness * 0.1;

    reasons.sort((x, y) => y.w - x.w);
    return { product: p, score: s, reasons: reasons.map((r) => r.text) };
  }

  function recommend(products, answers, offIds) {
    const off = offIds || [];
    const ranked = products
      .filter((p) => !off.includes(p.id))
      .map((p) => score(p, answers))
      .sort((x, y) => y.score - x.score);
    if (!ranked.length) return [];

    // Выбрал несколько способов заварки — в тройке будет хотя бы по товару на каждый,
    // если такой товар есть и не сильно хуже по вкусу
    const picks = [ranked[0]];
    const fits = (r, method) => ((FORMAT_FIT[method] || {})[formatKey(r.product)] || 0) === 10;
    for (const method of answers.brew || []) {
      if (picks.length >= 3) break;
      if (picks.some((r) => fits(r, method))) continue;
      const best = ranked.find((r) => !picks.includes(r) && fits(r, method) && r.score > ranked[0].score - 14);
      if (best) picks.push(best);
    }
    for (const r of ranked) {
      if (picks.length >= 3) break;
      if (!picks.includes(r)) picks.push(r);
    }
    return [picks[0], ...picks.slice(1).sort((x, y) => y.score - x.score)];
  }

  root.TM_MATCH = { recommend, formatKey };
})(typeof window !== 'undefined' ? window : globalThis);
