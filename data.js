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
     image      фото пачки для экрана результата (assets/products/)
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
    image: 'assets/products/office-blend.jpg',
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
    image: 'assets/products/brazil-monteiro-lobato.jpg',
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
    image: 'assets/products/colombia-condor-decaf.jpg',
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
    image: 'assets/products/colombia-guava-banana.jpg',
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
    image: 'assets/products/ethiopia-kebena.jpg',
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
    image: 'assets/products/kenya-gititu.jpg',
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
    image: 'assets/products/ethiopia-kello-siko.jpg',
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
    image: 'assets/products/el-salvador-rufatti.jpg',
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
    image: 'assets/products/condor-decaf-capsules.jpg',
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
    image: 'assets/products/bubble-gum-capsules.jpg',
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
    image: 'assets/products/brazil-monteiro-capsules.jpg',
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
    image: 'assets/products/rocket-flower-capsules.jpg',
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
    image: 'assets/products/decaf-drip.jpg',
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
    image: 'assets/products/geisha-drip.jpg',
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
    image: 'assets/products/rocket-flower-drip.jpg',
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
    image: 'assets/products/nitro-black.jpg',
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
    image: 'assets/products/nitro-blood-orange.jpg',
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
   ЭКРАН РЕЗУЛЬТАТА — заголовок в две строки и таблица характеристик
     title      [крупная строка, вторая строка]
     roast …    значения для таблицы; '—' если на сайте нет данных
   ===================================================================== */

window.TM_DETAILS = {
  'office-blend': { title: ['Office', 'Blend'], roast: 'Espresso', process: 'Seasonal blend', variety: '—', origin: 'Changes with the season', farm: 'Secret blend', altitude: '—' },
  'brazil-monteiro-lobato': { title: ['Brazil', 'Monteiro Lobato'], roast: 'Espresso', process: 'Natural', variety: 'Bourbon, Mundo Novo, Catuaí', origin: 'Brazil (Rio Pardo)', farm: 'Fazenda Pinheiro', altitude: '800–900 masl' },
  'colombia-condor-decaf': { title: ['Colombia', 'Condor Decaf'], roast: 'Espresso', process: 'Natural + sugarcane decaf', variety: 'Red & Yellow Caturra', origin: 'Colombia (Tolima)', farm: 'El Vergel', altitude: '—' },
  'colombia-guava-banana': { title: ['Colombia', 'Guava Banana'], roast: 'Filter', process: 'Anaerobic natural', variety: 'Red & Yellow Caturra', origin: 'Colombia (Tolima)', farm: 'El Vergel Estate', altitude: '—' },
  'ethiopia-kebena': { title: ['Ethiopia', 'Kebena'], roast: 'Espresso', process: 'Washed', variety: 'Heirloom', origin: 'Ethiopia (Limu Kossa, Jimma)', farm: 'Kebena Estate', altitude: '1,865–2,090 masl' },
  'kenya-gititu': { title: ['Kenya', 'AB Gititu #007'], roast: 'Filter', process: 'Washed', variety: 'SL28, SL34, Ruiru, Batian', origin: 'Kenya (Nyeri)', farm: 'Gititu Factory', altitude: '—' },
  'ethiopia-kello-siko': { title: ['Ethiopia', 'Kello Siko #3'], roast: 'Filter', process: 'Washed', variety: 'Heirloom', origin: 'Ethiopia (Guji, Oromia)', farm: 'Siko Station', altitude: '2,100–2,250 masl' },
  'el-salvador-rufatti': { title: ['El Salvador', 'Rodolfo Rufatti'], roast: 'Espresso', process: 'Natural, 72h cherry maceration', variety: 'Hybrids, Red Bourbon', origin: 'El Salvador (Santa Ana)', farm: 'Finca Guanacaste', altitude: '1,000 masl' },
  'condor-decaf-capsules': { title: ['Colombia', 'Condor Decaf Capsules'], roast: 'Espresso', process: 'Natural + sugarcane decaf', variety: 'Caturra', origin: 'Colombia', farm: 'El Vergel', altitude: '—' },
  'bubble-gum-capsules': { title: ['Colombia', 'Bubble Gum Capsules'], roast: 'Espresso', process: 'Anoxic natural', variety: 'Caturra, Colombia', origin: 'Colombia', farm: 'Jardines Chambaku', altitude: '—' },
  'brazil-monteiro-capsules': { title: ['Brazil', 'Monteiro Capsules'], roast: 'Espresso', process: 'Natural', variety: 'Bourbon, Mundo Novo, Catuaí', origin: 'Brazil', farm: 'Fazenda Pinheiro', altitude: '800–900 masl' },
  'rocket-flower-capsules': { title: ['Colombia', 'Rocket Flower Capsules'], roast: 'Espresso', process: 'Washed, controlled fermentation', variety: 'Caturra', origin: 'Colombia', farm: 'Finca El Paseo', altitude: '1,750–1,950 masl' },
  'decaf-drip': { title: ['Colombia', 'Decaf Drip'], roast: 'Filter', process: 'Natural + sugarcane decaf', variety: 'Red & Yellow Caturra', origin: 'Colombia', farm: 'El Vergel Estate', altitude: '—' },
  'geisha-drip': { title: ['Peru', 'Dreyde Perez Geisha Drip'], roast: 'Filter', process: 'Anoxic washed with mosto', variety: 'Geisha', origin: 'Peru', farm: 'Finca La Ponderosa', altitude: '1,960 masl' },
  'rocket-flower-drip': { title: ['Colombia', 'Rocket Flower Drip'], roast: 'Filter', process: 'Mosto-fermented washed', variety: 'Caturra', origin: 'Colombia', farm: 'Finca El Paseo', altitude: '1,750–1,950 masl' },
  'nitro-black': { title: ['Nitro', 'Cold Brew Black'], roast: 'Cold brew', process: 'Washed', variety: 'Heirloom', origin: 'Ethiopia (Limu Kossa)', farm: 'Kebena Estate', altitude: '1,865–2,090 masl' },
  'nitro-blood-orange': { title: ['Nitro', 'Blood Orange & Grapefruit'], roast: 'Cold brew', process: 'Flavoured cold brew', variety: '—', origin: 'Brazil', farm: '—', altitude: '—' }
};

/* =====================================================================
   ВОПРОСЫ
     layout    rows   — плашки во всю ширину (иконка, название, описание — всё опционально)
               grid   — две колонки: название + подпись
               images — 2×2 карточки с фото и подписью
     type      single — выбор сразу ведёт дальше
               multi  — можно выбрать несколько, дальше по кнопке Next
     max       для multi: сколько вариантов можно выбрать
     title     строки заголовка (перенос внутри строки — автоматически)
     helper    подсказка над заголовком
     skipIf    вопрос пропускается, если функция вернула true
   ===================================================================== */

const onlyCans = (a) => Array.isArray(a.brew) && a.brew.length > 0 && a.brew.every((v) => v === 'cold');

window.TM_QUESTIONS = [
  {
    id: 'level',
    layout: 'rows',
    type: 'single',
    helper: 'So we know how adventurous to go with your pick.',
    title: ['Your specialty', 'coffee level?'],
    options: [
      { value: 'beginner', label: 'Rookie', note: 'Getting started. Coffee is coffee — show me the good.', icon: 'assets/icons/level-rookie.svg' },
      { value: 'regular', label: 'Hooked', note: 'I drink it now and then. I know my flat white from my latte.', icon: 'assets/icons/level-hooked.svg' },
      { value: 'nerd', label: 'Nerd', note: 'Every day. Washed, natural, anaerobic — bring it on.', icon: 'assets/icons/level-nerd.svg' }
    ]
  },
  {
    id: 'brew',
    layout: 'grid',
    type: 'multi',
    helper: 'Pick all that apply. We’ll match the roast and format to your gear.',
    title: ['How do you make your coffee?'],
    options: [
      { value: 'espresso', label: 'Espresso machine', note: 'At home or in the office' },
      { value: 'capsules', label: 'Nespresso®', note: 'Original line machine' },
      { value: 'nogear', label: 'No gear at all', note: 'Office, travel, camping' },
      { value: 'filter', label: 'Filter', note: 'V60, Chemex, AeroPress' },
      { value: 'moka', label: 'Moka pot / French press', note: 'Stovetop or plunger' },
      { value: 'cold', label: 'I want a cold one now', note: 'Ready-to-drink cans' }
    ]
  },
  {
    id: 'milk',
    layout: 'rows',
    type: 'single',
    skipIf: onlyCans,
    helper: 'Some coffees shine with milk, others are best black.',
    title: ['Milk', 'or', 'no milk?'],
    options: [
      { value: 'milk', label: 'Usually with milk' },
      { value: 'black', label: 'Black, always' },
      { value: 'both', label: 'Depends on the mood' }
    ]
  },
  {
    id: 'flavour',
    layout: 'images',
    type: 'multi',
    max: 2,
    helper: 'Pick up to two. We’ll match them to the tasting notes.',
    title: ['Which flavours pull you in?'],
    options: [
      { value: 'choc', label: 'Chocolate, nuts, caramel', image: 'assets/flavours/chocolate.jpg' },
      { value: 'fruit', label: 'Berries & ripe fruit', image: 'assets/flavours/berries.jpg' },
      { value: 'floral', label: 'Florals, tea, citrus', image: 'assets/flavours/florals.jpg' },
      { value: 'wild', label: 'Something wild', image: 'assets/flavours/wild.jpg' }
    ]
  },
  {
    id: 'acidity',
    layout: 'rows',
    type: 'single',
    helper: 'From smooth and round to bright and juicy.',
    title: ['How about', 'acidity?'],
    options: [
      { value: 'low', label: 'Not my thing', note: 'Smooth, round, low acidity.' },
      { value: 'mid', label: 'A little is nice', note: 'Balanced and sweet.' },
      { value: 'high', label: 'The brighter, the better', note: 'Juicy, citrusy, sparkling.' }
    ]
  },
  {
    id: 'caffeine',
    layout: 'rows',
    type: 'single',
    skipIf: onlyCans,
    helper: 'Our decaf doesn’t taste like a compromise.',
    title: ['Caffeine', 'or decaf?'],
    options: [
      { value: 'yes', label: 'Caffeine, please' },
      { value: 'decaf', label: 'Decaf only' },
      { value: 'any', label: 'Doesn’t matter' }
    ]
  }
];

/* Экран загрузки перед результатом: строки появляются по очереди с галочкой */
window.TM_LOADING = {
  helper: 'Hold on, this takes a few seconds.',
  title: ['Brewing', 'your match'],
  steps: ['Reading your answers', 'Matching roast and format', 'Balancing acidity and flavour', 'Checking what’s on the bar']
};
