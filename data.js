/* =====================================================================
   THE MINERS — Festival Coffee Match
   Всё, что можно править без программиста: товары, вопросы, тексты.

   ТОВАР
     format     beans | capsules | drip | can
     roast      espresso | filter (только для beans)
     taste      кислотность / горечь / сладость, шкала 1–5 как на сайте
                tasteEstimated: true — на сайте шкалы нет, значения прикинуты
                по описанию, их стоит проверить у обжарщика
     families   вкусовые группы из вопроса 4: choc | fruit | floral | wild
     milk       0–3, насколько хорошо с молоком
     adventure  1 — понятный, 2 — интересный, 3 — экспериментальный лот
   ===================================================================== */

window.TM_PRODUCTS = [
  {
    id: 'office-blend',
    name: 'Office Blend',
    format: 'beans', roast: 'espresso',
    notes: ['Cocoa', 'Nougat', 'Pecan Nuts'],
    blurb: 'For everyday drinkers and home espresso — when you are not in the mood for acidity.',
    taste: { acidity: 1, bitterness: 4, sweetness: 5 },
    families: ['choc'], milk: 2, adventure: 1, decaf: false,
    url: 'https://www.theminers.eu/office-blend/'
  },
  {
    id: 'brazil-monteiro-lobato',
    name: 'Brazil Monteiro Lobato',
    format: 'beans', roast: 'espresso',
    notes: ['Caramel', 'Wafer Biscuits', 'Chocolate Ice Cream'],
    blurb: 'Bourbon, Mundo Novo & Catuaí from Rio Pardo. Full body, works great with milk.',
    taste: { acidity: 1, bitterness: 2, sweetness: 5 },
    families: ['choc'], milk: 3, adventure: 1, decaf: false,
    url: 'https://www.theminers.eu/brazil-monteiro-lobato/'
  },
  {
    id: 'colombia-condor-decaf',
    name: 'Colombia Condor Decaf',
    format: 'beans', roast: 'espresso',
    notes: ['Cocoa', 'Orange', 'Tropical Fruit'],
    blurb: 'Single-origin sugarcane decaf from Tolima. Smooth and sweet, zero caffeine.',
    taste: { acidity: 3, bitterness: 2, sweetness: 5 },
    families: ['choc', 'fruit'], milk: 2, adventure: 1, decaf: true,
    url: 'https://www.theminers.eu/colombia-condor-decaf/'
  },
  {
    id: 'colombia-guava-banana',
    name: 'Colombia Guava Banana',
    format: 'beans', roast: 'filter',
    notes: ['Guava', 'Tamarind', 'Raspberry'],
    blurb: 'Natural anaerobic from El Vergel Estate. Vibrant, clean and tropical.',
    taste: { acidity: 4, bitterness: 1, sweetness: 4 },
    families: ['fruit', 'wild'], milk: 0, adventure: 3, decaf: false,
    url: 'https://www.theminers.eu/colombia-guava-banana/'
  },
  {
    id: 'ethiopia-kebena',
    name: 'Ethiopia Kebena',
    format: 'beans', roast: 'espresso',
    notes: ['Mulberry', 'Linden Blossom', 'Wild Honey'],
    blurb: 'Washed Ethiopia from Kebena Estate. Clean, elegant and balanced espresso.',
    taste: { acidity: 4, bitterness: 2, sweetness: 4 },
    families: ['fruit', 'floral'], milk: 1, adventure: 2, decaf: false,
    url: 'https://www.theminers.eu/ethiopia-kebena-2/'
  },
  {
    id: 'kenya-gititu',
    name: 'Kenya AB Gititu #007',
    format: 'beans', roast: 'filter',
    notes: ['Rhubarb', 'Black Tea', 'Jostaberry'],
    blurb: 'Washed Kenya from Nyeri. Intense, juicy and complex with a full body.',
    taste: { acidity: 5, bitterness: 1, sweetness: 3 },
    families: ['fruit', 'floral'], milk: 0, adventure: 3, decaf: false,
    url: 'https://www.theminers.eu/kenya-ab-gititu--007/'
  },
  {
    id: 'ethiopia-kello-siko',
    name: 'Ethiopia Kello Siko #3',
    format: 'beans', roast: 'filter',
    notes: ['Apricot', 'Wild Strawberry', 'Florals'],
    blurb: 'Washed Guji. Clean, elegant and complex, with hints of black tea and honey.',
    taste: { acidity: 4, bitterness: 1, sweetness: 4 },
    families: ['fruit', 'floral'], milk: 0, adventure: 2, decaf: false,
    url: 'https://www.theminers.eu/ethiopia-kello-siko--3-2/'
  },
  {
    id: 'el-salvador-rufatti',
    name: 'El Salvador Rodolfo Rufatti',
    format: 'beans', roast: 'espresso',
    notes: ['Aronia Berry', 'Figs', 'Red Wine'],
    blurb: 'Natural with 72-hour cherry maceration. Juicy, complex and fruit-forward.',
    taste: { acidity: 3, bitterness: 2, sweetness: 5 },
    families: ['fruit', 'wild'], milk: 1, adventure: 3, decaf: false,
    url: 'https://www.theminers.eu/el-salvador-rodolfo-rufatti/'
  },
  {
    id: 'condor-decaf-capsules',
    name: 'Colombia Condor Decaf Capsules',
    format: 'capsules',
    notes: ['Cocoa', 'Passion Fruit', 'Orange'],
    blurb: 'Our sugarcane decaf, ready for your capsule machine.',
    taste: { acidity: 3, bitterness: 2, sweetness: 5 },
    families: ['choc', 'fruit'], milk: 2, adventure: 1, decaf: true,
    url: 'https://www.theminers.eu/decaf-capsules/'
  },
  {
    id: 'bubble-gum-capsules',
    name: 'Colombia Bubble Gum Capsules',
    format: 'capsules',
    notes: ['Blackberry', 'Plums', 'Dark Chocolate'],
    blurb: 'An anoxic natural from Jardines Chambaku — a wild lot in a capsule.',
    taste: { acidity: 4, bitterness: 3, sweetness: 5 },
    families: ['fruit', 'choc', 'wild'], milk: 2, adventure: 3, decaf: false,
    url: 'https://www.theminers.eu/colombia-bubble-gum-capsules/'
  },
  {
    id: 'brazil-monteiro-capsules',
    name: 'Brazil Monteiro Capsules',
    format: 'capsules',
    notes: ['Caramel', 'Wafer Biscuits', 'Chocolate Ice Cream'],
    blurb: 'The comfy one. Sweet, round and great with milk.',
    taste: { acidity: 1, bitterness: 2, sweetness: 5 }, tasteEstimated: true,
    families: ['choc'], milk: 3, adventure: 1, decaf: false,
    url: 'https://www.theminers.eu/brazil-monteiro-capsules/'
  },
  {
    id: 'rocket-flower-capsules',
    name: 'Colombia Rocket Flower Capsules',
    format: 'capsules',
    notes: ['Jasmine', 'White Peach', 'Pomelo'],
    blurb: 'Washed with controlled fermentation. Floral, light and bright.',
    taste: { acidity: 4, bitterness: 1, sweetness: 4 }, tasteEstimated: true,
    families: ['floral', 'fruit'], milk: 0, adventure: 2, decaf: false,
    url: 'https://www.theminers.eu/colombia-rocket-flower-capsules/'
  },
  {
    id: 'decaf-drip',
    name: 'Decaf Drip',
    format: 'drip',
    notes: ['Cocoa', 'Orange Juice', 'Passion Fruit'],
    blurb: 'A pour-over in a bag: hot water, a mug, three pours. No caffeine.',
    taste: { acidity: 3, bitterness: 2, sweetness: 5 }, tasteEstimated: true,
    families: ['choc', 'fruit'], milk: 1, adventure: 1, decaf: true,
    url: 'https://www.theminers.eu/decaf-drip/'
  },
  {
    id: 'geisha-drip',
    name: 'Peru Dreyde Perez Geisha Drip',
    format: 'drip',
    notes: ['Plums', 'Dark Cherry', 'Bergamot'],
    blurb: 'Geisha, anoxic washed with mosto for 120–180 hours. Rare lot, zero gear.',
    taste: { acidity: 4, bitterness: 1, sweetness: 4 }, tasteEstimated: true,
    families: ['fruit', 'floral', 'wild'], milk: 0, adventure: 3, decaf: false,
    url: 'https://www.theminers.eu/peru-dreyde-perez-geisha-drip/'
  },
  {
    id: 'rocket-flower-drip',
    name: 'Colombia Rocket Flower Drip',
    format: 'drip',
    notes: ['Osmanthus', 'White Peach', 'Earl Grey'],
    blurb: 'Mosto-fermented washed Colombia in a drip bag. Tea-like and floral.',
    taste: { acidity: 4, bitterness: 1, sweetness: 4 }, tasteEstimated: true,
    families: ['floral', 'fruit'], milk: 0, adventure: 2, decaf: false,
    url: 'https://www.theminers.eu/colombia-rocket-flower-drip/'
  },
  {
    id: 'nitro-black',
    name: 'Nitro Cold Brew Black',
    format: 'can',
    notes: ['Mulberry', 'Linden Blossom', 'Wild Honey'],
    blurb: 'Cold brew from Ethiopia Kebena, charged with nitrogen. Silky and clean.',
    taste: { acidity: 3, bitterness: 1, sweetness: 4 }, tasteEstimated: true,
    families: ['fruit', 'floral'], milk: 1, adventure: 1, decaf: false,
    url: 'https://www.theminers.eu/nitro-cold-brew-black/'
  },
  {
    id: 'nitro-blood-orange',
    name: 'Nitro Cold Brew Blood Orange & Grapefruit',
    format: 'can',
    notes: ['Blood Orange', 'Grapefruit', 'Chocolate'],
    blurb: 'Our first flavoured cold brew. Juicy, sweet, with a tonic-like bite.',
    taste: { acidity: 4, bitterness: 2, sweetness: 4 }, tasteEstimated: true,
    families: ['floral', 'fruit', 'wild'], milk: 0, adventure: 2, decaf: false,
    url: 'https://www.theminers.eu/nitro-cold-brew-blood-orange-grapefruit/'
  }
];

/* Подпись формата на карточке результата */
window.TM_FORMAT_LABEL = {
  'beans:espresso': 'Whole beans · Espresso roast',
  'beans:filter': 'Whole beans · Filter roast',
  'capsules': 'Capsules · Nespresso® Original',
  'drip': 'Drip bag · Single serve',
  'can': 'Can · Nitro cold brew'
};

/* =====================================================================
   ВОПРОСЫ
     type      single — выбор сразу ведёт дальше
               multi  — можно выбрать несколько, дальше по кнопке
     max       для multi: сколько вариантов можно выбрать
     skipIf    вопрос пропускается, если функция вернула true
   ===================================================================== */

const onlyCans = (a) => Array.isArray(a.brew) && a.brew.length > 0 && a.brew.every((v) => v === 'cold');

window.TM_QUESTIONS = [
  {
    id: 'level',
    title: 'How deep are you into specialty coffee?',
    type: 'single',
    options: [
      { value: 'beginner', label: 'Just getting started', sub: 'Coffee is coffee — show me the good stuff' },
      { value: 'regular', label: 'I drink it now and then', sub: 'I know my flat white from my latte' },
      { value: 'nerd', label: 'Every day. I’m a coffee nerd', sub: 'Washed, natural, anaerobic — bring it on' }
    ]
  },
  {
    id: 'brew',
    title: 'How do you make your coffee?',
    type: 'multi',
    options: [
      { value: 'espresso', label: 'Espresso machine' },
      { value: 'capsules', label: 'Nespresso® capsules', sub: 'Original line machine' },
      { value: 'filter', label: 'Filter', sub: 'V60, Chemex, AeroPress' },
      { value: 'moka', label: 'Moka pot or French press' },
      { value: 'nogear', label: 'No gear at all', sub: 'Office, travel, camping' },
      { value: 'cold', label: 'I want a cold one now', sub: 'Ready-to-drink cans' }
    ]
  },
  {
    id: 'milk',
    title: 'Milk or black?',
    type: 'single',
    skipIf: onlyCans,
    options: [
      { value: 'black', label: 'Black, always' },
      { value: 'milk', label: 'With milk', sub: 'Flat white, cappuccino, latte' },
      { value: 'both', label: 'Depends on the mood' }
    ]
  },
  {
    id: 'flavour',
    title: 'Which flavours pull you in?',
    type: 'multi',
    max: 2,
    options: [
      { value: 'choc', label: 'Chocolate, nuts, caramel' },
      { value: 'fruit', label: 'Berries & ripe fruit' },
      { value: 'floral', label: 'Florals, tea, citrus' },
      { value: 'wild', label: 'Something wild', sub: 'Fermented, winey, tropical' }
    ]
  },
  {
    id: 'acidity',
    title: 'How do you feel about acidity?',
    type: 'single',
    options: [
      { value: 'low', label: 'Not my thing', sub: 'Smooth, round, low acidity' },
      { value: 'mid', label: 'A little is nice', sub: 'Balanced and sweet' },
      { value: 'high', label: 'The brighter, the better', sub: 'Juicy, citrusy, sparkling' }
    ]
  },
  {
    id: 'caffeine',
    title: 'Caffeine?',
    type: 'single',
    skipIf: onlyCans,
    options: [
      { value: 'yes', label: 'Yes, please' },
      { value: 'decaf', label: 'Decaf only' },
      { value: 'any', label: 'Doesn’t matter' }
    ]
  }
];
