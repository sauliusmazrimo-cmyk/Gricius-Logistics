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

// ===================== CONFIG =====================
const APP_PASSWORD  = process.env.APP_PASSWORD  || 'Gricius2025';
const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY || '';
const PORT          = process.env.PORT || 3000;

// ===================== MANUAL CONTENT =====================
const MANUAL_CONTENT = `
VAIRUOTOJO VADOVAS 2025

ADMINISTRACIJOS TELEFONAI:
- Bendra pagalba Europa: 112
- Transporto planuotojas: +370 656 66206
- Draudiminiai atvejai / Žalų skyrius: +370 656 69809
- Korteles ir kelių mokesčiai (Darius Gricius): +370 656 90811
- Planšetai / Telemetrija: +370 602 94000
- Vilkikų mechanikas (Rudys Paulius): +370 658 14901
- Vilkikų mechanikas (Robertas Žilys): +370 658 14200
- Puspriekabių mechanikas (Aivaras Ignatavičius): +370 667 39423
- Techninis skyrius (24/7): +370 637 69400
- HR (Nataliia Andriushchenko): +370 658 49162
- HR (Khrystyna Radvilė): +370 656 01395
- HR (Skaidra Blaževičienė): +370 636 21833
- Vairuotojų darbo organizavimo vadovas (Saulius Mažrimas): +370 652 39045
- Mokymų vadybininkas (Jevgenij Burgan): +370 660 94905
- Mokymų vadybininkė (Vilma Rustamova): +370 659 05616
- Instruktorius (Kęstutis Mikelevičius): +370 650 26258
- Prancūzija inspekcija RU/FR: +33 9 50 53 44 65
- Prancūzija inspekcija (kitas): +33 65148 2755

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

DOKUMENTAI REISE:
- Vairuotojo pažymėjimas kat CE + 95 kodas
- Vairuotojo kortelė (galiojanti iki reiso pabaigos)
- Pasas su visomis vizomis (jei reikia)
- Medicininė pažyma
- A1 forma
- Įgaliojimai vilkikui ir puspriekabei (Lenkijai)
- HB ir H10 sertifikatai
- Prieš reisą: tuščios CMR formos, palečių lapai, prastovos lapai, puspriekabės lapas

CMR:
- Privalomi grafai: 1-11, 16, 21, 23, 25
- Po iškrovimo gavėjas pildymas: 24 grafa (laikas, antspaudas, parašas)
- DRAUDŽIAMA taisyti be vadybininko leidimo
- Nuskenuoti ir siųsti vadybininkui po iškrovimo

KELIŲ MOKESČIAI:
- LT vinjetė SMS: LTD NUMERIS → +37066000120
- LV vinjetė SMS: LVD NUMERIS → +37066000120
- EE vinjetė SMS: EED NUMERIS → +37066000120
- Lenkija, Čekija, Vokietija, Austrija, Belgija: DKV aparatas
- Liuksemburgas, NL, DK, SE: www.eurovignette.eu

PRANCŪZIJA - INSPEKCIJA:
- Turėti: SIPSI deklaraciją, A1 formą, darbo sutarties kopiją
- Problemų atveju: +33 9 50 53 44 65 (RU/FR)

ELGESYS ĮMONĖS TERITORIJOJE:
- Greitis: max 10 km/h
- Per 1 valandą: atiduoti dokumentus dispečeriui
- Alkoholis: >0.0 promilių = draudžiama
`;

// ===================== PATVIRTINTOS SITUACIJOS =====================
const CONFIRMED_SITUATIONS = [
  {
    title: "Eismo įvykis / Avarija",
    keywords: ["avarij", "eismo įvyk", "kontakt", "įbrėžim", "veidrodėl", "susidūrim", "авари", "дтп", "accident", "crash", "collision", "apgadint"],
    answer: `EISMO ĮVYKIS — KĄ DARYTI:

1. STOP → saugumas pirmiausia → įjungti avarines šviesas → išstatyti trikampį
2. Fotografuoti: abiejų transporto priemonių numeriai, žala, aplinka, kelio ženklai
3. Skambinti Žalų skyriui: +370 656 69809
4. Informuoti vadybininką nedelsiant
5. Pildyti eismo įvykio deklaraciją (Europrotokolas) — jei įmanoma
6. Jei ginčas dėl kaltės → kviesti policiją: 112
7. NEPALIKTI įvykio vietos be leidimo

SVARBU: Nepasirašyti deklaracijos nesuprantama kalba!
Jei radote jau apgadintą vilkiką/puspriekabę — fotografuoti ir nedelsiant informuoti vadybininką.

📞 Žalų skyrius: +370 656 69809
📞 Vadybininkas: +370 656 66206
🚨 Policija: 112`
  },
  {
    title: "Techninis gedimas kelyje",
    keywords: ["gedin", "padang", "varikl", "stabdž", "evakuator", "limp mode", "šaldytuv", "štang", "поломк", "шин", "двигател", "breakdown", "tyre", "engine", "brake", "prakiurus"],
    answer: `TECHNINIS GEDIMAS — KĄ DARYTI:

1. Sustoti saugioje vietoje → avarines šviesas → trikampis
2. Padaryti nuotraukas → užpildyti užklausą FM programoje
3. Informuoti vadybininką SMS arba skambučiu

PAGAL GEDIMO TIPĄ:
🔧 Padanga — jei galima: keisti vietoje. Jei ne: važiuoti iki artimiausio saugaus parkingo ir kviesti servisą
🔧 Variklio klaida / limp mode — Užklausa FM + SMS vadybininkui. Nevažiuoti per jėgą
🔧 Stabdžiai — leisti atvėsti, tikrinti apkrovą, informuoti mechaniką
🔧 Šaldytuvo gedimas — nedelsiant pranešti vadybininkui (krovinys gali būti sugadintas)
🔧 Dingo štangos — pranešti vadybininkui, nepakrauti krovinio be štangų

VISADA: foto + FM užklausa + klaidos kodas + info vadybai

📞 Rudys Paulius (vilkikai): +370 658 14901
📞 Robertas Žilys (vilkikai): +370 658 14200
📞 Aivaras Ignatavičius (ref/puspriekabės): +370 667 39423
📞 Techninis skyrius 24/7: +370 637 69400`
  },
  {
    title: "Vadybininkas nekelia ragelio / neatsiliepia",
    keywords: ["neatsiliepi", "nekelia", "negaliu susisiekti", "neranda", "не отвечает", "не берёт", "no answer", "vadybinink"],
    answer: `VADYBININKAS NEATSILIEPIA — KĄ DARYTI:

1. Skambinti 2–3 kartus su 2–3 min. pertrauka tarp skambučių
2. Parašyti žinutę vadybininkui (SMS arba FM programa)
3. Jei situacija nesudėtinga — veikti savarankiškai ir informuoti žinute
4. Jei reikia pagalbos → skambinti INSTRUKTORIAMS:

📞 Kęstutis Mikelevičius: +370 650 26258
📞 Jevgenij Burgan: +370 660 94905
📞 Vilma Rustamova: +370 659 05616`
  },
  {
    title: "ECO vairavimas / didelės kuro sąnaudos",
    keywords: ["kuro sąnaud", "eco", "ekonom", "degalai per daug", "вождение", "расход топлива", "fuel consumption", "eco driving", "vairavimo balas"],
    answer: `ECO VAIRAVIMAS — PATARIMAI:

Problemos priežastys: staigus stabdymas, važiavimas "ant jėgos", blogas vairavimo balas

SPRENDIMAI:
✅ Važiuoti iš inercijos — nenaudoti stabdžių kai nereikia
✅ Naudoti variklini stabdį
✅ Planuoti į priekį — matyti situaciją 300-500m į priekį
✅ Palaikyti pastovų greitį
✅ Naudoti vilkiko pagalbiklius (cruise control, predictive cruise)
✅ Vengti tuščiosios eigos ilgiau nei 3 min.

Jei pastebėjote per dideles kuro sąnaudas — užpildyti planšetėje formą "Serviso užklausa" ir laukti 3 darbo dienas.

📞 Instruktorius Jevgenij Burgan: +370 660 94905
📞 Darius Gricius (kuro kortelės): +370 656 90811`
  },
  {
    title: "Atlyginimas / mokėjimo sistema",
    keywords: ["atlyginim", "mokėjim", "alga", "išmok", "зарплат", "деньг", "salary", "payment", "pay"],
    answer: `ATLYGINIMAS — KĄ DARYTI:

1. Prieš darbą — aiškiai išsiaiškinti mokėjimo sistemą pas instruktorių
2. Nesutarimas dėl išmokėjimo — kreiptis į instruktorius:

📞 Vilma Rustamova: +370 659 05616
📞 Kęstutis Mikelevičius: +370 650 26258

3. Grįžus — kreiptis į apskaitos skyrių
4. Nepanikuoti — kalbėtis ramiai ir konstruktyviai`
  },
  {
    title: "Navigacija / GPS problemos",
    keywords: ["navigacij", "gps", "nuveda", "adresas", "koordinat", "навигац", "адрес", "navigation", "wrong address", "maps"],
    answer: `NAVIGACIJA — PATARIMAI:

Problemos: nuveda ne ten, nepritaikyta sunkvežimiams, neteisingos koordinatės

SPRENDIMAI:
✅ Naudoti TRUCK GPS: IGO (pigiausia ir geriausia), Sygic, Garmin
✅ NESIVADOVAUTI Google Maps — jis neskirtas sunkvežimiams!
✅ Vesti pilną adresą su pašto kodu
✅ Tikrinti nustatymus (svoris, aukštis, plotis)
✅ Turėti atsarginį planą (spausdintas maršrutas)
✅ Jei klaida adrese — informuoti vadybininką ir paprašyti pagalbos

📞 Vadybininkas: +370 656 66206`
  },
  {
    title: "Kuras / degalai",
    keywords: ["kur", "degal", "prisipilti", "kortel", "топлив", "заправк", "fuel", "card", "tank"],
    answer: `KURAS — KĄ DARYTI:

PILTI LAIKU — neleisti bakui ištuštėti!

JEIGU PROBLEMOS:
✅ Įsitikinti kad esate degalinėje iš įmonės patvirtinto sąrašo
✅ Mokėti kortele iš programos (ne grynais)
✅ Nelaikyti PIN kodo kartu su kortele
✅ Jei per didelės kuro sąnaudos — užpildyti "Serviso užklausą" planšetėje, laukti 3 darbo dienas

KURO VAGYSTĖ:
→ Informuoti vadybininką
→ Dirbti toliau, policijos nelaukti

📞 Darius Gricius (kuro ir kelių kortelės): +370 656 90811`
  },
  {
    title: "Kelių mokesčiai / aparatai neveikia",
    keywords: ["kelių mokest", "aparatas", "vinjeta", "toll", "дорог", "виньет", "аппарат", "dkv", "неработает"],
    answer: `KELIŲ MOKESČIAI — PROBLEMOS IR SPRENDIMAI:

VINJETĖS SMS formatas:
• LT: LTD [vilkiko numeris] → siųsti: +37066000120
• LV: LVD [vilkiko numeris] → siųsti: +37066000120
• EE: EED [vilkiko numeris] → siųsti: +37066000120

DKV APARATAS (Lenkija, Čekija, Vokietija, Austrija, Belgija):
→ Jei neveikia — informuoti vadybininką
→ Lenkija: atsisiųsti e-TOLL PL programą kaip atsarginį variantą

TIKRINTI MARŠRUTĄ prieš važiuojant!
Naudoti truck navigaciją — ne Google Maps!

📞 Darius Gricius: +370 656 90811`
  },
  {
    title: "Parkingai / stovėjimas",
    keywords: ["parking", "stovėjim", "vietos nėra", "nesaug", "stoti", "парковк", "стоянк", "parking full", "no parking"],
    answer: `PARKINGAI — PATARIMAI:

SVARBU: Europos parkingai ne visada saugūs — naudoti vagysčių žemėlapį!

SPRENDIMAI:
✅ Planuoti stovėjimą iš anksto
✅ Rinktis pramonines zonas (PROM ZONES) — žemėlapyje įjungti Topografinį foną
✅ Naudoti apps: Truck Parking Europe, SNAP
✅ Geriau mokamas saugus nei nemokamas pavojingas
✅ Jei viršijote laiką — tęsti iki pirmos galimos vietos

JEIGU VIRŠIJOTE LAIKĄ:
1. Tęsti važiavimą iki pirmos galimos sustojimo vietos
2. Pasidaryti spausdinį ir parašyti priežastį (vardas, pavardė, kortelės nr., laikas)
3. Saugoti spaustinius 56 dienas

📞 Vadybininkas: +370 656 66206`
  },
  {
    title: "Darbo laikas / tachografas",
    keywords: ["darbo laikas", "viršijim", "tachograf", "reglament", "poilsis", "перерыв", "отдых", "рабочее время", "driving time", "rest", "tacho"],
    answer: `DARBO LAIKAS — TAISYKLĖS:

REGLAMENTAS (561/2006):
• Max vairavimas be pertraukos: 4h 30min
• Pertrauka: min 45min (arba 15+30min)
• Max dienos vairavimas: 9h (2x/sav. iki 10h)
• Max savaitės vairavimas: 56h
• Dvi savaitės: max 90h
• Dienos poilsis: min 11h
• Savaitinis poilsis: min 45h

SVARBU:
→ Vairuotojas PATS atsakingas už darbo laiką — ne vadybininkas
→ Planuotis ir derintis iš anksto su vadybininku
→ Jei viršijote — pasidaryti spausdinį ir parašyti priežastį

PAGALBOS kreiptis į instruktorius:
📞 Kęstutis Mikelevičius: +370 650 26258
📞 Jevgenij Burgan: +370 660 94905
📞 Vilma Rustamova: +370 659 05616`
  },
  {
    title: "Krovinio problemos",
    keywords: ["krovin", "pakraut", "perkrov", "pažeist", "neprileidž", "груз", "перегруз", "повреждён", "cargo", "overload", "damaged"],
    answer: `KROVINIO PROBLEMOS — KĄ DARYTI:

PRIEŠ PAKROVIMĄ:
✅ Tikrinti CMR, Invoice, Packing List, sertifikatus
✅ Suskaičiuoti krovinį, tikrinti pakuotę, matuoti temperatūrą

JEIGU BLOGAI PAKRAUTAS:
→ NEVAŽIUOTI — informuoti vadybininką
→ Fotografuoti prieš ir po pakrovimo
→ Fiksuoti pastabas CMR

JEIGU NEPRILEIDŽIA PRIE PAKROVIMO/IŠKROVIMO:
→ Informuoti vadybininką nedelsiant
→ Nepalikti vietos be vadybininko leidimo

PERKROVA:
→ Jei svoris per didelis — NEVAŽIUOTI, informuoti vadybininką
→ Max ES: 40t bendra, 11.5t ašiai

📞 Vadybininkas: +370 656 66206`
  },
  {
    title: "Vagystės / nelegalai",
    keywords: ["vagyst", "nelegali", "kuro vagyst", "lipa", "nelegal", "krovinio vagyst", "кража", "нелегал", "theft", "stowaway", "stolen"],
    answer: `VAGYSTĖS / NELEGALAI — KĄ DARYTI:

NELEGALAI PUSPRIEKABĖJE:
🚨 NEATIDARINĖTI puspriekabės pats
🚨 Nedelsiant skambinti vadybininkui
🚨 Kviesti policiją: 112
→ Stebėti aplinką ypač: FR, BE, UK

KURO VAGYSTĖ:
→ Informuoti vadybininką
→ Dirbti toliau, policijos nelaukti
→ Nelaikyti PIN kodo kartu su kortele

KROVINIO VAGYSTĖ:
→ STOP, nesiliesti prie nieko
→ Kviesti policiją: 112
→ Nedelsiant informuoti vadybininką ir Žalų skyrių

PREVENCIJA:
✅ Tikrinti plombas ir balną po kiekvieno sustojimo
✅ Naudoti vagysčių žemėlapį
✅ Rinktis saugius, apšviestus parkingus

📞 Vadybininkas: +370 656 66206
📞 Žalų skyrius: +370 656 69809
🚨 Policija: 112`
  },
  {
    title: "Inspekcija / policija tikrinimas",
    keywords: ["inspekcij", "policij", "tikrinimas", "dokumentų patikr", "bauda", "инспекц", "полиц", "проверк", "inspection", "police", "check"],
    answer: `INSPEKCIJA / POLICIJA — KĄ DARYTI:

1. Iškart informuoti vadybininką
2. Duoti TIK tai ko prašo — ne daugiau
3. Būti mandagiam ir ramiam
4. NEAIŠKINTI kur atliko kassavaitinį poilsį — vairuotojas to daryti NEPRIVALO (Reg. 165/2014 Art. 34)

DOKUMENTAI KURIUOS GALI PRAŠYTI:
• Vairuotojo pažymėjimas + 95 kodas
• Tachografo kortelė
• Pasas / asmens dokumentas
• CMR ir krovinio dokumentai
• Transporto priemonės dokumentai

PRANCŪZIJA:
→ Turėti SIPSI deklaraciją, A1 formą, darbo sutarties kopiją
→ Problemos: +33 9 50 53 44 65

📞 Vadybininkas: +370 656 66206`
  },
  {
    title: "Oro sąlygos / blogas oras",
    keywords: ["ledas", "rūkas", "potvyn", "vėjas", "sniegas", "slysta", "blogos sąlygos", "лёд", "туман", "снег", "ice", "fog", "snow", "wind", "weather"],
    answer: `BLOGOS ORO SĄLYGOS — KĄ DARYTI:

PIRMIAUSIA SAUGUMAS:
✅ Sumažinti greitį iki SAUGAUS — ne pagal leistiną ženklą
✅ Padidinti atstumą iki priekyje važiuojančio (min. 4-5 sekundės)
✅ Vengti staigių veiksmų: stabdymo, akceleracijos, vairo sukimo
✅ Naudoti tinkamas šviesas (artimosios; rūko žibintai jei reikia)

PAGAL ORO SĄLYGAS:
🧊 Ledas — max atsargumas, variklinis stabdis, jokio staigaus stabdymo
🌫️ Rūkas — artimosios šviesos + rūko žibintai, labai mažas greitis
💨 Stiprus vėjas — laikyti vairą tvirtai, ypač atsargiai pro tiltus
🌊 Potvynis — NEVAŽIUOTI per vandenį jei nežinomas gylis

JEIGU NESAUGU → STOTI ir laukti
→ Tikrinti vietinius įspėjimus (weather apps)
→ Informuoti vadybininką

📞 Vadybininkas: +370 656 66206`
  },
  {
    title: "Sveikata / trauma / blogai jaučiasi",
    keywords: ["sveikat", "traum", "silpnumas", "blogai jaučias", "liga", "skauda", "здоровь", "травм", "плохо", "болит", "health", "sick", "injury", "pain", "ill", "nuovarg"],
    answer: `SVEIKATOS PROBLEMOS — KĄ DARYTI:

🚨 JEI NEGALI VAIRUOTI → STOTI NEDELSIANT

1. Sustoti saugioje vietoje
2. Įjungti avarines šviesas
3. Kviesti pagalbą: 112 (veikia visoje ES)
4. Informuoti vadybininką — bet kokiu paros metu

PAGAL SITUACIJĄ:
🤕 Trauma (lipant, tvirtinant krovinį) → 112 + vadybininkas
😵 Staigus silpnumas / galvos svaigimas → STOTI, 112, vadybininkas
😴 Nuovargis → PRIVALOMA sustoti ir pailsėti — nevairuoti per jėgą!

SVARBU: Nedirbti per jėgą — tai pavojinga ir tau, ir kitiems!
Visais atvejais informuoti vadybininką bet kokiu paros metu.

🚨 Pagalba Europa: 112
📞 Vadybininkas: +370 656 66206`
  },
  {
    title: "Puspriekabės keitimas / perkabinimas",
    keywords: ["perkabinimas", "puspriekab", "keičiam", "perduodam", "priimam", "трейлер", "прицеп", "trailer", "handover", "exchange trailer"],
    answer: `PUSPRIEKABĖS KEITIMAS — KĄ DARYTI:

1. Užpildyti FM programoje perkabinimo informaciją
2. Pažymėti VISKĄ: visi pažeidimai (išoriniai ir vidiniai), kuras, moto valandos, komplektacija
3. PRIVALOMI abu parašai: atiduodančio ir priimančio vairuotojo
4. Padaryti 4 nuotraukas: priekis, galas, kairė, dešinė → siųsti per planšetą
5. Parašyti SMS vadybininkui: "Priekaba [numeris] priimta, kuras [X]L, moto val. [X], lapas užpildytas"

KOMPLEKTACIJA TIKRINTI:
✅ Min. 4 štangos kroviniui tvirtinti
✅ Spyna
✅ Atsarginis ratas
✅ TIR kabelis (jei taikoma)

📞 Vadybininkas: +370 656 66206`
  }
];

// ===================== SYSTEM PROMPT =====================
function buildSystemPrompt() {
  const situationsText = CONFIRMED_SITUATIONS.map((s, i) =>
    `--- SITUACIJA ${i+1}: ${s.title} ---\n${s.answer}`
  ).join('\n\n');

  return `Tu esi Gricius Logistics patyręs vairuotojų konsultantas ir pagalbininkas. Turi 20 metų patirtį tarptautiniuose krovinių pervežimuose.

KALBA: Automatiškai atpažink klausimo kalbą ir atsakyk ta pačia kalba — lietuviškai, rusiškai arba angliškai. Niekada nemaišyk kalbų viename atsakyme.

PRIORITETAI:
1. Jei klausimas atitinka bet kurią iš "PATVIRTINTŲ SITUACIJŲ" — naudok TIK tą atsakymą, nekeisk jo
2. Jei situacijos nėra sąraše — atsakyk remdamasis vadovo turiniu ir savo patirtimi
3. Visada baik atsakymą su aktualiais kontaktais

ATSAKYMO STILIUS:
- Vairuotojas skaito telefonu kelyje — būk TRUMPAS ir KONKRETUS
- Pradėk nuo "KĄ DARYTI DABAR" (numeruoti žingsniai)
- Jei situacija pavojinga — pirmiausia saugumas
- Kontaktus rašyk aiškiai su numeriais

PATVIRTINTOS SITUACIJOS IR ATSAKYMAI:
${situationsText}

VADOVO TURINYS:
${MANUAL_CONTENT}`;
}

// ===================== IN-MEMORY STORAGE =====================
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
  if (req.session.sessionId) delete chatSessions[req.session.sessionId];
  req.session.destroy();
  res.json({ ok: true });
});

app.get('/api/auth-check', (req, res) => {
  res.json({ authenticated: !!req.session.authenticated });
});

// ===================== CHAT ROUTE =====================
app.post('/api/chat', async (req, res) => {
  if (!req.session.authenticated) return res.status(401).json({ error: 'Not authenticated' });
  if (!ANTHROPIC_KEY) return res.status(500).json({ error: 'API key not configured on server' });

  const { message } = req.body;
  if (!message || !message.trim()) return res.status(400).json({ error: 'Empty message' });

  const sid = req.session.sessionId;
  if (!chatSessions[sid]) chatSessions[sid] = [];

  chatSessions[sid].push({ role: 'user', content: message.trim() });
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
        max_tokens: 800,
        system: buildSystemPrompt(),
        messages: history
      })
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `API error ${response.status}`);
    }

    const data = await response.json();
    const reply = data.content.map(b => b.text || '').join('');
    chatSessions[sid].push({ role: 'assistant', content: reply });
    res.json({ reply });

  } catch (e) {
    console.error('API error:', e.message);
    res.status(500).json({ error: e.message });
  }
});

// ===================== CLEAR HISTORY =====================
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
  console.log(`📋 Loaded ${CONFIRMED_SITUATIONS.length} confirmed situations`);
});
