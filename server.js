const express = require('express');
const session = require('express-session');
const fetch = require('node-fetch');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('.'));

// Session setup
app.use(session({
  secret: process.env.SESSION_SECRET || 'gricius-secret-2025',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 8 * 60 * 60 * 1000 } // 8 hours
}));

// ===================== CONFIG (from environment variables) =====================
const APP_PASSWORD  = process.env.APP_PASSWORD  || 'Gricius2025';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const PORT          = process.env.PORT || 3000;

// ===================== MANUAL CONTENT (loaded once at startup) =====================
const MANUAL_CONTENT = `
GRICIUS LOGISTICS / VALTRANSA — VAIRUOTOJO VADOVAS 2025

ADMINISTRACIJOS TELEFONAI:
- Bendra pagalba Europa (112)
- Transporto planuotojas / Dispečeris: +370 656 66206
- Draudiminiai atvejai / ДТП vadybininkas: +370 656 69809
- Korteles ir kelių mokesčiai (Darius Gricius): +370 656 90811
- Planšetai / Telemetrija: +370 602 94000
- Vilkikų mechanikas (Rudys Paulius): +370 658 14901
- Vilkikų mechanikas (Robertas Žilys): +370 658 14200
- Puspriekabių mechanikas (Aivaras Ignatavičius): +370 667 39423
- Techninis skyrius: +370 637 69400
- HR (Nataliia Andriushchenko): +370 658 49162
- HR (Valerija Sulejeva): +370 656 01395
- HR (Skaidra Blaževičienė): +370 636 21833
- Mokymo centras (Saulius Mažrimas): +370 652 39045
- Mokymų vadybininkas (Jevgenij Burgan): +370 660 94905
- Juristas (Giedrius Raudys): +370 656 78557
- Prancūzija inspekcija RU/FR: +33 9 50 53 44 65
- Prancūzija inspekcija (kitas): +33 65148 2755

AVARIJA / ДТП (6.1-6.6):
1. Nedelsiant susisiekti su vadybininku (+370 656 66206)
2. Fotografuoti įvykio vietą, numerius, žalą
3. Pildyti Europrotokolo deklaraciją (visada turėti tuščius blankus)
4. DRAUDŽIAMA pasirašyti deklaraciją nesuprantama kalba
5. Policiją kviesti kai: abu nevadina kaltės / nukentėjo tretieji / yra sužeistų
6. Po avarijos - aiškinamasis raštas techninio skyriaus vadovui arba vadybininkui

GEDIMAS KELYJE:
1. Sustoti saugioje vietoje, įjungti avarines šviesas
2. Pranešti mechanikui ir vadybininkui
3. NEATLIKTI remonto savarankiškai
4. Per 1 valandą nuo grįžimo - remonto prašymas su gedimų sąrašu

PARKAVIMAS:
- Lietuva: DRAUDŽIAMA sustoti Klaipėda-Vievis be leidimo (vagystės pavojus)
- ES šalys: nemokamos aikštelės. Po poilsio tikrinti plombas, spynas, nelegalus
- NVS šalys: tik mokamos saugomos stovėjimo aikštelės
- Sustojus patikrinti ar nėra nusikabinęs priekabos nuo traktoriaus
- Jei įtariami nelegalai - pranešti vadybininkui ir kviesti policiją (112)

TACHOGRAFO REGLAMENTAS:
- Max vairavimas be pertraukos: 4h 30min
- Pertrauka: min 45min (arba 15+30min)
- Max dieninis vairavimas: 9h (2x/sav iki 10h)
- Max savaitinis vairavimas: 56h
- Dvi savaitės iš eilės: max 90h
- Dienos poilsis: min 11h (arba 3+9h)
- Savaitinis poilsis: min 45h
- Klaidos kodas 28: vairavimas be kortelės
- Klaidos kodas 56: reikia pertraukos

DOKUMENTAI REIDE:
- Vairuotojo pažymėjimas kat CE + 95 kodas
- Vairuotojo kortelė (galiojanti iki reido pabaigos)
- Pasas su visomis vizomis
- Medicininė pažyma + Makrono deklaracija
- A1 forma
- Įgaliojimai traktoriui ir puspriekabei (Lenkijai)
- HB ir H10 sertifikatai
- Prieš reidą: tuščios CMR formos, paletų lapai, prastovos lapai, treikerio lapas

CMR NAKLADINĖ:
- Privalomi grafai: 1-11, 16, 21, 23, 25
- Po iškrovimo gavėjas pildymas: 24 grafa (laikas, antspaudas, parašas)
- DRAUDŽIAMA taisyti be vadybininko leidimo
- Nuskenuoti ir siųsti vadybininkui po iškrovimo

TREIKERIO LAPAS:
- Pildomas kiekvieno perdavimo metu
- Žymėti: visi pažeidimai, kuras, moto valandos, komplektacija
- PRIVALOMI abu parašai: atiduodančio ir priimančio vairuotojo
- Po perdavimo - SMS vadybininkui su duomenimis
- 4 nuotraukos puspriekabės (priekis, galas, kairė, dešinė)

PALETŲ APSIKEITIMAS:
- Tik tarp euro paletų, nemazinti dažytų
- Paletas krauti tik parkinge, ne įmonės teritorijoje (max 30min)
- Privalomas antspauduotas A.Griciaus firmos lapas
- Viena paleta = 13-15 EUR
- Po apsimaino SMS vadybininkui

KROVINYS - PAKROVIMAS/IŠKROVIMAS:
- Tikrinti: CMR, Invoice, Packing List, sertifikatus
- Suskaičiuoti krovinį, tikrinti pakuotę, matuoti temperatūrą
- Tentinė puspriekabė: 16 diržų, 32 plastikiniai kampai, 32 guminiai kilimėliai
- Šaldytuvas: 2 štangos kiekvienai paletai
- DRAUDŽIAMA pasirašyti trūkumo/broko aktus be vadybininko leidimo
- Be vadybininko leidimo nepalikti iškrovimo vietos

VAISTŲ PERVEŽIMAS (GDP):
- Puspriekabė: švari, sausa, be kvapų
- Išvėsinti min 1 valandą prieš pakrovimą
- Temperatūra tikrinama 3 paletose: prie agregato, viduryje, prie durų
- Jei temperatūra neatitinka - NESIKRAUTI, pranešti vadybininkui
- Farmacijos kroviniai - tik saugomuose parkinguose
- Dokumentai saugomi 10 metų

KELIŲ MOKESČIAI:
- LT vinjetė SMS: LTD NUMERIS → +37066000120
- LV vinjetė SMS: LVD NUMERIS
- EE vinjetė SMS: EED NUMERIS
- Lenkija: DKV. Neveikia → e-TOLL PL programa
- Čekija: Myto. Neveikia → keisti AS24 Eurotrafic degalinėje
- Vokietija: Toll Collect. Neveikia → pirkti pirmoje Toll Collect degalinėje
- Austrija: GoBox. Neveikia → keisti AS24 Eurotrafic
- Belgija: SATELLIC/DKV - įjungti prieš įvažiuojant (žalias indikatorius)
- Liuksemburgas, NL, DK, SE: www.eurovignette.eu

PRANCŪZIJA - INSPEKCIJA:
- Vairuotojas turi turėti: SIPSI deklaraciją, A1 formą, darbo sutarties kopiją
- Problemų atveju skambinti: +33 9 50 53 44 65 (RU/FR)
- Rekomenduojama laikyti paskutinį CMR su kuriuo atvykote į Prancūziją

BANKO SĄSKAITA:
- Revolut/Citadele: programa iš App Store/Google Play + identifikacija (LT SIM)
- Paysera: www.paysera.lt → programa → identifikacija → 12 EUR (Maxima 13 kasa)
- Banko filialai: H.Manto g.21, Klaipėda | Taikos pr.32A, Klaipėda

ELGESYS ĮMONĖS TERITORIJOJE:
- Greitis: max 10 km/h
- Per 1 valandą: atiduoti dokumentus dispečeriui
- Gedimas: per 1 valandą pateikti remonto prašymą mechanikams
- Draudžiama: rūkyti ne tam skirtose vietose, alkoholis, blokuoti privažiavimus
- Alkoholis: >0.2 promilės = 500 EUR bauda + nušalinimas nuo reido
`;

// ===================== SYSTEM PROMPT BUILDER =====================
function buildSystemPrompt(customSituations) {
  const situationsText = customSituations && customSituations.length > 0
    ? '\n\nĮMONĖS PATVIRTINTOS SITUACIJOS IR ATSAKYMAI:\n' +
      customSituations.map((s, i) =>
        `--- Situacija ${i+1}: ${s.title} ---\n${s.answer}`
      ).join('\n\n')
    : '';

  return `Tu esi Gricius Logistics / Gricius Logistics patyręs vairuotojų konsultantas ir pagalbininkas. Turi 20 metų patirtį tarptautiniuose krovinių pervežimuose.

KALBA: Automatiškai atpažink klausimo kalbą ir atsakyk ta pačia kalba — lietuviškai, rusiškai arba angliškai. Niekada nemaišyk kalbų viename atsakyme.

PRIORITETAI (griežta tvarka):
1. Jei klausimas atitinka "Įmonės patvirtintas situacijas" — naudok TIK tą atsakymą, nekeisk jo
2. Jei situacijos nėra sąraše — atsakyk remdamasis vadovo turiniu ir savo patirtimi
3. Visada baik atsakymą su aktualiais kontaktais

ATSAKYMO STILIUS:
- Vairuotojas skaito telefonu kelyje — būk TRUMPAS ir KONKRETUS
- Pradėk nuo "KĄ DARYTI DABAR" (numeruoti žingsniai)
- Jei situacija pavojinga — pirmiausia saugumas
- Kontaktus rašyk aiškiai su numeriais

${situationsText}

VADOVO TURINYS:
${MANUAL_CONTENT}`;
}

// ===================== IN-MEMORY STORAGE =====================
// Custom situations (loaded from file or empty at start)
let customSituations = [];

// Active chat sessions: sessionId -> messages[]
const chatSessions = {};

// ===================== AUTH ROUTES =====================
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === APP_PASSWORD) {
    req.session.authenticated = true;
    req.session.sessionId = Date.now().toString() + Math.random().toString(36).slice(2);
    chatSessions[req.session.sessionId] = [];
    res.json({ ok: true });
  } else {
    res.status(401).json({ ok: false, error: 'Wrong password' });
  }
});

app.post('/api/logout', (req, res) => {
  if (req.session.sessionId) {
    delete chatSessions[req.session.sessionId];
  }
  req.session.destroy();
  res.json({ ok: true });
});

app.get('/api/auth-check', (req, res) => {
  res.json({ authenticated: !!req.session.authenticated });
});

// ===================== CHAT ROUTE =====================
app.post('/api/chat', async (req, res) => {
  if (!req.session.authenticated) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  if (!ANTHROPIC_KEY) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  const { message } = req.body;
  if (!message || !message.trim()) {
    return res.status(400).json({ error: 'Empty message' });
  }

  // Get or init session history
  const sid = req.session.sessionId;
  if (!chatSessions[sid]) chatSessions[sid] = [];

  // Add user message to history
  chatSessions[sid].push({ role: 'user', content: message.trim() });

  // Keep last 20 messages (10 exchanges) for context
  const history = chatSessions[sid].slice(-20);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 700,
        system: buildSystemPrompt(customSituations),
        messages: history
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    const reply = data.content.map(b => b.text || '').join('');

    // Add assistant reply to history
    chatSessions[sid].push({ role: 'assistant', content: reply });

    res.json({ reply });

  } catch (e) {
    console.error('API error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ===================== SITUATIONS MANAGEMENT (admin) =====================
app.get('/api/situations', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Not authenticated' });
  res.json({ situations: customSituations });
});

app.post('/api/situations', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Not authenticated' });
  const { situations } = req.body;
  if (!Array.isArray(situations)) return res.status(400).json({ error: 'Invalid data' });
  customSituations = situations;
  console.log(`Situations updated: ${situations.length} items`);
  res.json({ ok: true, count: situations.length });
});

// ===================== CLEAR SESSION HISTORY =====================
app.post('/api/clear-history', (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Not authenticated' });
  const sid = req.session.sessionId;
  if (sid) chatSessions[sid] = [];
  res.json({ ok: true });
});

// ===================== START =====================
app.listen(PORT, () => {
  console.log(`✅ Gricius Logistics Driver Assistant running on port ${PORT}`);
  console.log(`🔑 App password: ${APP_PASSWORD}`);
  console.log(`🤖 Anthropic API key: ${ANTHROPIC_KEY ? 'SET ✓' : 'NOT SET ✗'}`);
});
