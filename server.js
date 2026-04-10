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
3. Kontaktus rašyk TIK jei jie yra situacijos atsakyme arba vadove — niekada nesugalvok kontaktų

ATSAKYMO STILIUS:
- Vairuotojas skaito telefonu kelyje — būk TRUMPAS ir KONKRETUS
- Pradėk nuo "KĄ DARYTI DABAR" (numeruoti žingsniai)
- Jei situacija pavojinga — pirmiausia saugumas
- Kontaktus rašyk aiškiai su numeriais

DRAUDŽIAMA:
- Žodį "vadybininkas" rašyti su telefono numeriu — rašyk tik "informuoti vadybininką" be numerio, išskyrus kai numeris yra situacijos atsakyme
- Sugalvoti žodžius ar vietas kurių nėra vadove ("šėrimo vietos", "poilsio namai" ir pan.)
- Rašyti informaciją kurios nėra vadove — geriau "kreipkitės į vadybininką"
- Naudoti markdown simbolius (**tekstas**) — rašyti paprastai be žvaigždučių

PATVIRTINTOS SITUACIJOS IR ATSAKYMAI:
${situationsText}

VADOVO TURINYS:
${MANUAL_CONTENT}`;
}

// ===================== NFC DRIVERS DATABASE =====================
const NFC_DRIVERS = {
  '7F5752DA':'Ermek Uulu Nursultan','F3C0181B':'Kvitovskyi Oleh','3301001B':'Huliakevich Uladzislau',
  'C346901B':'Zhetigenov Khantenir','73C0B11B':'Abdurahmonzoda Anushervon','13EE8F1B':'Adaev Nurlan',
  '6F738CDA':'Issainov Nurgazy','B3857C25':'Liubashkou Yauheni','1463B3CE':'Tsolukovskiy Vitaliy',
  'D388DB19':'Vasilyeu Aleh','1324ED19':'Politika Viktor','1307241B':'Kovtun Oleh',
  '631AE11A':'Semeniuk Sergii','F3EA361B':'Rakhmatshoev Sirozhddin','23FC291B':'Bednyy Sergey',
  '23ACC81B':'Kozubaev Borubek','63EEAE1B':'Toroptsev Denys','035C3B1B':'Pohorielov Volodymyr',
  'B310FC1A':'Niiazaliev Almaz','5380351B':'Zulpuev Kairatbek','73F9E319':'Yakovenko Hryhoriy',
  'B335561B':'Krankouski Valdemar','5FE653DA':'Imomidin Bakirov','C3985D1B':'Zhobarov Abdimazhit',
  '73CEEF1A':'Zhyrgalbaev Maksatbek','13AAAA1B':'Klimovich Dzmitry','73983C1B':'Dedushov Viacheslav',
  '93BDAA1B':'Maisinovich Aliaksei','23933D1B':'Paradzin Dzmitry','A358E61A':'Ibadov Akbar',
  '0359E61A':'Kadyrov Nurlanbek','7385F01A':'Muzyka Ihar','AFFF8EDA':'Irmatov Jamshid',
  '638FED1A':'Zheenbekov Ruslanbek','436A3A1B':'Dzhumabaev Almaz','B37F631B':'Yeremko Mykhailo',
  'C3ECB21B':'Vasilenka Vitali','53D2F71A':'Sharipov Mirlan','F3ABBC1A':'Bozarov Bekzod',
  'F3245E1B':'Dubchak Vasyl','9356321B':'Shchyholiev Yurii','E3C9AE1B':'Makhammad Abdurakhmanov',
  '8F8B96DA':'Isakov Uchkun','6379B81B':'Jaloluddin Dovudov','E343E31A':'Manasov Ilichbek',
  '2F3C8CDA':'Zhumanaly Uulu Taalaibek','5357901B':'Chiriac Vadino','03A7EA1A':'Zeziulevich Aliaksei',
  'A3F6EF1A':'Kalantai Aliaksandr','93B7FB1A':'Siarheyeu Viktar','C3C3571B':'Kareu Anatoli',
  '734F431B':'Hluboki Vitali','93A7FF1A':'Paluyan Yauheni','531A2C1B':'Turdukulov Uson',
  'B31CFF1A':'Bolbat Andrei','837CE01A':'Lytvyn Ruslan','9370271B':'Piliuchenko Oleksandr',
  'BF5E68DA':'Galiauskas Gustas','CF998DDA':'Narynbekov Ermek','A37AF61A':'Kamalov Nurbek',
  '530A991B':'Ivashyn Yevhen','5FA595DA':'Telebaev Kubatbek','436A3D1B':'Huretski Siarhei',
  '432A431B':'Melisov Ulan','D328B61B':'Qosimov Alisher','E37FC71B':'Zakharchuk Serhii',
  '5387F51A':'Sipko Oleksii','03E9641B':'Samsonov Petro','539FF01A':'Derkachenko Artem',
  'A39CBE1B':'Salnikov Volodymyr','E32CDF1A':'Holovchenko Mykhailo','4382E119':'Turganbai Uulu Shabdan',
  'B353A71B':'Ravshanov Adham','F3208525':'Syniavskyi Oleksii','93AEFD1A':'Mamyrov Marat',
  '737F261B':'Sokol Yurii','B35AE31A':'Aparovich Andrei','C388B61B':'Makobriei Viacheslav',
  'BF9893DA':'Yakubov Farkhod','E37D5F1B':'Mamadzhanov Zamirbek','E3ABBC1A':'Khamrakulov Ilkhom',
  'A377591B':'Gustas Šadauskas','33D02F1B':'Švelnys Modestas','F28699F8':'Justas Mikužis',
  'BFB666DA':'Auškalnis Nojus','3393E61A':'Gustas Gaižauskas','720CA0F8':'Mindaugas Austynas',
  '42C3B7F8':'Antanaitienė Natalja','23BC5D1B':'Yerezhepov Daulen','9FA18FDA':'Abdivaliev Ibrakhim',
  '032A5E1B':'Abasov Cholponbek','93FF5E1B':'Dilshodjon Aliev','34C2D94C':'Kolbun Siarhei',
  '23A3ED1A':'Asirov Umarzhon','2390331B':'Mambetkaziev Adilet','63BE621B':'Kadyrkulov Ruslan',
  '938CF91A':'Baitov Semetei','5FF091DA':'Jamolidinov Fatkhullo','A3AD5F1B':'Chumachenko Mykola',
  '0F4454DA':'Lukashou Aliaksandr','B3F7351B':'Shyrynia Yurii','13453F1B':'Khlius Oleksandr',
  '6369B21B':'Sabaleuski Dzmitry','3386E81A':'Miklash Marek','E33A5E1B':'Labchuk Siarhei',
  'C314E71A':'Staryna Ihor','83C7F11A':'Zykau Vitali','A39FD11A':'Zapasnik Yauheni',
  'D367B01B':'Ali Kim','7363B01B':'Kostenko Ruslan','D3B65F1B':'Kazykenov Zhalgasbek',
  'B301BA1B':'Kozlenko Vitalii','636D431B':'Berezenko Vitalii','53B5D01A':'Sivachenko Serhii',
  'C3F5E01A':'Klimiankou Kiryl','63B8E71A':'Nikulin Andrei','C3733B1B':'Pavlov Vitalii',
  '3F1793DA':'Pavlenko Oleksandr','D3D0981B':'Basareuski Yauheni','234E231B':'Dakhno Serhii',
  'F371E21A':'Poltavskyi Serhii','93484F1B':'Kapitula Yurii','A396241B':'Jimsheleishvili Valerian',
  '8363E81A':'TIMUR ISMANOV','1F7F57DA':'Glazunovas Edgardas','8F1892DA':'LEONID KORNIICHUK',
  '1F7F63DA':'Didus Oleksandr','6FF065DA':'Druktenis Karolis','EF7C61DA':'Barannyk Sergii',
  '83E2341B':'Adanbaev Kyiazbek','F3D6551B':'Kudaiberdiev Dooronbek','AFAA8CDA':'Balkovyi Denys',
  '13A5EB1A':'Karagulov Akylbek','43BDD71A':'Seitbekov Nursultan','9392321B':'Lapko Andrei',
  '93D5FC1A':'Aripov Alisher','33F73A1B':'Boika Daniil','7372411B':'Myronenko Yevhenii',
  '736BCD1A':'Sheripbekov Nurakhmet','33AF7625':'Balotski Siarhei','D3E95F1B':'Mamataliev Bolot',
  '43E8D719':'Orynbayev Yerbol','23BAC01B':'Kurdziuk Dzmitry','FF6E68DA':'Syniavskyi Oleksii',
  '6F2B66DA':'Rybak Yauheni','73988425':'Oqilov Temur','33D3C71A':'Khukhrii Serhii',
  '43AA241B':'Kosatyi Viktor','83DAEE1A':'Derkach Oleksandr','2306F81A':'Ovsiannikov Serhii',
  '83E3F71A':'Khodjimamedov Samandar','9FCD8EDA':'Lozian Serhii','B324B41B':'Djavadov Saftar',
  '23C3F91A':'Bakasov Talantbek','7311511B':'Pikalov Yevhen','5339FA1A':'Baichoroev Narbek',
  'F31CFF1A':'Mehedyn Vadym','1305EA1A':'Kushubakov Nursultan','A300B81B':'Karimov Bekzada',
  '23EBFF1A':'Attokurov Erbol','639FDF1A':'Nurkulov Uygun','A3952E1B':'Asanbekov Chyngyz',
  'A399FB1A':'Latipov Bakhodirjon','5385E81A':'Khovdun Andrii','1FE066DA':'Norjigitov Alisher',
  'FF5E60DA':'Kozhoev Ernist','134A5F1B':'Nazarbekov Nursultan','3363E619':'Maleyev Oleg',
  'D3A3F71A':'Maleyev Yevgeniy','F358B71B':'Abakumov Vladyslav','8328FB1A':'Asanov Tagdyrali',
  '237D381B':'Malchanau Pavel','E3B3E71A':'Munguma Chomunorwa','DF128EDA':'Hamba Artwell',
  'D3DAEE1A':'Tezekbayev Daniyar','631E381B':'Bratsun Pavel','13BBE81A':'Rapylbekov Ilyas',
  '433B241B':'Akylbek-Uulu Kubatbek','13A15F1B':'Kuchma Oleksandr','F360FC1A':'Alanazarov Sanjar',
  '73A4911B':'Abykeev Kasymbek','83795F1B':'Kopylets Mykola','9F1967DA':'Melikuziev Aziz',
  '7386251B':'Benadysiuk Valery','B397CD1A':'Slozkin Iurii','F334091B':'Akmatbekov Rinat',
  '3FC163DA':'Ziyoev Mehroj','B3C3251B':'Dubyna Oleksandr','03B1EA1A':'Kadyrov Mykhtybek',
  'F31CE31A':'Polosmak Volodymyr','E3FBFF1A':'Zhiyengaliyev Ruslan','6395BC1B':'Boreiko Ihor',
  'C37A2E1B':'Bugaienko Ruslan','C3F1241B':'Harashchuk Dmytro','FFDB67DA':'Qobilov Naimjon',
  '7F5E6CDA':'Sulaimanov Khamza','2F0066DA':'Aliaksandr Lahunovich','83CE9125':'Henadzi Dysko',
  'A3AF541B':'Litviakou Aliaksandr','43E7271B':'Khaydarov Khurshid','B3A9FD1A':'Tulenov Marat',
  'A3A0911B':'Hryhencha Yauheni','B4B1B5CE':'Haurash Anton','73423E1B':'Pliantskovskyi Dmytro',
  'E3C6ED1A':'Hryzii Andrii','73B33C1B':'Hladin Oleksandr','B30AFF1A':'Tiakov Yevhen',
  '433BFA1A':'Daulet Rustem','130A391B':'Akazhanov Dauren','4339EF1A':'Lytvinov Ivan',
  '530A8A1B':'Bondarau Yury','43675D1B':'Kalinichenko Oleksandr','33DFF41A':'Obushenko Serhii',
  '93645F1B':'Kharkevich Ilya','63C4B91B':'Khasanov Rustam','3F6050DA':'Jonutis Pranas',
  'FFB08FDA':'Ruzmatov Muzaffar','A3E4F019':'Kalantai Pavel','43F81A1B':'Kostina Volodymyr',
  '83FF5E1B':'Pliakin Viktor','A316651B':'Nurov Batyr','83F7501B':'Aitmatov Nurkeldi',
  'E382251B':'Moskva Oleksandr','AF035FDA':'Shchepanouski Uladzimir','639E231B':'Pryt Mykola',
  'A3DDE71A':'Linchevskyi Viacheslav','DF7951DA':'Ulitsionak Mikhail','1369E61A':'Ferenets Valerii',
  '73893C1B':'Alieksieiev Volodymyr','F3FFAE1B':'Mashchenko Oleksandr','33A9FC1A':'Klemenko Vasyl',
  'E36A291B':'Arstanbekov Mirlanbek','F3A6EE1A':'Besarab Maksym','73443F1B':'Ubaidilla-Uulu Erlan',
  '83C6FD1A':'Metelytsia Kostiantyn','83F3271B':'Toktobaev Aman','032BCB1A':'Sechin Pavel',
  '23B2F31A':'Alieksieienko Sergii','9F0195DA':'Fedorov Ivan','23C05D1B':'Chicov Vitali',
  '633AB11B':'Zholdoshov Kamchybek','4385F51A':'Toktosunov Sabyrbek','73C3DF1A':'Ushakou Uladzimir',
  'F3F5FF1A':'Akmatov Edil','236CAE1B':'Tusupbekov Eldiiar','FF2D93DA':'Turgunov Kamil',
  '635DDC19':'Rahimov Bahodur','E354631B':'Abdullaev Muboshsher','CF6396DA':'Duban Andrii',
  'FF1B8DDA':'Ungarsinov Nurzhan','B3485E1B':'Cherepenia Andrii','A3C1211B':'Sobchenko Serhii',
  'B3CA581B':'Shlapa Vladyslav','D3AFFB1A':'Alamov Shahrom','E34BF71A':'Aliakhnovich Siarhei',
  '3372311B':'Hurin Mykhailo','7360AC1B':'Bondarenko Pavel','03C13A1B':'Pabudzei Andrei',
  'D3C5591B':'Vashurin Roman','532DCD1A':'Pecheniuk Oleh','1F6B8BDA':'Kanapelka Aleksandr',
  'A379E119':'Lizahubau Artur','53A8F71A':'Babych Valeriy','B3E1E01A':'Boimatov Yusuf',
  '536A261B':'Kapalbekov Askhat','B3A9FA1A':'Minaiev Borys','B33CFD1A':'Diadenko Eduard',
  '73D3E61A':'Husiev Vitalii','A3FA5F1B':'Herasimovich Kiryl','1303CD1A':'Tsurupa Oleh',
  '8F6496DA':'Chupilko Vladyslav','F3B6B71B':'Balakin Kostiantyn','5318DF19':'Dulin Oleksii',
  '1F168EDA':'Khrystyna Radvilė','0F1C44DA':'Zulolov Munir','4369F51A':'Zhunushaliev Belek',
  '3FF98DDA':'MARUF MUSURMONOV','352B0F43':'Grabys Laimonas','E304371B':'Stankus Tomas',
  '64493426':'Kononov Roman','E562CCEF':'Kalašinskas Julius','24A341FF':'Legeza Vitalij',
  '631F321B':'Zubkov Nikolay','7233A7FB':'Šarlauskas Viktoras','D4F335FF':'Balsys Vilmantas',
  '7233A7F8':'Šarlauskas Viktoras','8568E9EF':'Kačiušis Mindaugas','146C6426':'Jermakov Artiom',
  '24052B4B':'Ruginis Marius','5436E14C':'Zacharevič Edvinas','F355BE1B':'Blochinas Marekas',
  '74840ACF':'Paulikas Simonas','35DDF5EF':'Šiaučiūnas Vilius','035B431B':'Paulavičius Justas',
  '4578E9EF':'Songaila Žygimantas','AF058DDA':'Rakovich Vadzim','F33DE81A':'Sharai Vitali',
  '63DCBF1B':'Kravchuk Oleksandr','3300FB1A':'Husiev Oleksandr','43E4321B':'Cojuhari Stefan',
  '2379EA1A':'Shpytsia Dmytro','73815F1B':'Sukhotski Anatoli','330CCA1A':'Budnitski Artur',
  'C3E0E919':'Tsitovich Aliaksandr','A3CFDE1A':'Matusia Oleksii','1331BD1A':'Abdrakhmanov Arman',
  '33B3B91B':'Kudaiberdiev Kubanych','D3B92F1B':'Kulishov Ilya','8304241B':'Vakhobov Vahhob',
  '5389281B':'Sikoza Andrii','B307EB1A':'Kazhadub Uladzimir','0361E21A':'Ibragimov Akhmadillo',
  '2F8F46DA':'Omurzakov Zamir','A3742E1B':'Orozaliev Emilbek','23DCC51A':'Zerekidze Vitali',
  '0F7892DA':'Batkhan Zhanibek','4F5A95DA':'Kurukin Volodymyr','7340271B':'Dudnyk Ihor',
  '03B1C21A':'Mohyla Vitalii','B32B2D1B':'Kolodiazhnyi Ihor','43A9EC19':'Svidrytski Maksim',
  'D3B15F1B':'Tkachenko Vitalii','03F3AE1B':'Belahlazau Leanid','5F69A6DA':'Adaev Nurlan',
  'C3E6611B':'Aligulov Galym','D302E81A':'Karahiaur Yurii','53ACAE1B':'Repryntsev Roman',
  '3384351B':'Vdovtsov Dmytro','3316E21A':'Petrovskyi Andrii','4F6E8ADA':'Sulaimanov Muzaffarzhon',
  '039CB01B':'Kharytonov Oleksandr','8356C61B':'Lastouski Yury','3F646BDA':'Minchukou Aliaksandr',
  'FF6A8BDA':'Kazbek Maxutov','0FF9A2DA':'Kadyrov Aktilek','73E0CA1A':'Skrodenis Vidas',
  'C384E11A':'Kivėnas Robertas','E3FFC71A':'Boboev Nematkhuja','A3CE8B25':'Vorotnykov Oleksandr',
  '237EB01B':'Kalinichenko Yurii','536B231B':'Navaselski Aliaksandr','43054E1B':'Kaminski Uladzislau',
  '93FF2B1B':'Shamenov Askarbek','93365F1B':'Hryb Mikalai','7329431B':'Matniyazov Sanjar',
  '73374F1B':'Seifetdinov Stanislav','F3C88F25':'Strielka Vitalii','B38C3B1B':'Loboda Oleksii',
  '83B1F61A':'Muzraimov Mamaiusup','E33CB01B':'Karimov Zafar','738F8F1B':'Rakhmetov Yerbolat',
  '03B4AB1B':'Saubanov Vitalii','C3E8361B':'Benikas Saulius','5F0767DA':'Mayis Orujaliyev',
  '33573B1B':'Dailidė Raimondas','E3C0E31A':'Semionov Nikolaj','DFA48BDA':'Zakirov Nur',
  '7307B91B':'Jašmontas Alvydas','23575F1B':'Lavickas Vilmantas','C3DCA71B':'Uktveris Stasys',
  '3397D519':'Butylov Tomas','83C9351B':'Sabaliauskas Ramūnas','A3AC361B':'Puščius Tomas',
  'C3ABE01A':'Juraev Shokir','33B8E219':'Yarmukhamedov Shoin','4386421B':'Savitskyi Viktor',
  '9384401B':'Savienkov Volodymyr','730ADF19':'Reshetnik Oleksandr','5337AE1B':'Vasileuski Siarhei',
  'A3A22B1B':'Chernovskyi Andrii','8F98A6DA':'Sherzodjon Khushnazarov','C35AC61B':'Murodov Jamshed',
  'D373B11B':'Qurbonaliev Muhammadaziz','53C0FB1A':'Malevanchenko Serhii','C3F2AE1B':'Fedorov Yevhen',
  '23B9FC1A':'Sarymsakov Kubatbek','B3C02F1B':'Caunov Valerii','63ED031B':'Caunov Vladimir',
  '03FEF41A':'Šutas Alvydas','BFB750DA':'Baitov Samat','AF5D50DA':'Pavlo Chernyshov',
  'E328901B':'Maksymenko Rodion','D36CD119':'Rukavychko Andrii','537DBA1B':'Lysakov Serhii',
  'F336B31B':'Bilobaba Valerii','63F65F1B':'Matmusaev Taalaibek','2314E91A':'Slupskyi Viacheslav',
  'A352EA1A':'Petrov Dmytro','8364371B':'Zozulia Volodymyr','E3CF281B':'Sydykov Nurgen',
  'D3B0D01A':'Miraliyev Yerzhan','5FBD5FDA':'Pardaev Odil','3FB767DA':'Ahmad Dadabaev',
  'E32EAE1B':'Usov Oleksii','337C7525':'Abdiev Omadillo','43A9FC1A':'Satimbekov Kairatbek',
  '6FCD44DA':'Nurmashev Serik','BF2362DA':'Berikbossynov Bakytzhan','2F688CDA':'Dolzhenkov Ihor',
  '1310411B':'Darafeyeu Maksim','B3E1B01B':'Khodniev Ihor','9367331B':'Ruzmatov Tulkin',
  '5341CB1A':'Panasiuk Oleh','4392281B':'Lysou Mikita','33DED319':'Tymchenko Serhii',
  '437AB01B':'Solod Maksym','23A6FB1A':'Žibkus Rimantas','137F301B':'Khazhimatov Marufzhan',
  'D31EFC1A':'Enezarov Beishen','035CF71A':'Ismayilov Azat','4307FD1A':'Chervonenko Andrii',
  '63A8EA1A':'Cernous Victor','038EEE1A':'Bialuhin Andrei','A3205F1B':'Shapran Volodymyr',
  '83CD2F1B':'Skliaruk Oleksandr','DF5853DA':'Tsurko Aliaksei','83D9E11A':'Rakhimov Zhakhongir',
  'AF9E65DA':'Kos Andrii','B39B3F1B':'Fayozov Temurjon','A3DBEF19':'Grechykha Yaroslav',
  '033BFC1A':'Asanbekov Urmat','3F1D52DA':'Domchev Ihor','6FD269DA':'Dzhoroev Erbolot',
  '8F0455DA':'Ismayilli Elmir','0FBA65DA':'Matskul Dmytro','9FDCA6DA':'USMONOV SANJARBEK',
  'AF4852DA':'TUYAKBAEV KOMILJON','2344AE1B':'Šliauteris Rolandas','33E72A1B':'Ramonas Alvydas',
  '0F4367DA':'Ortikov Abduhalil',
};

// ===================== IN-MEMORY STORAGE =====================
const chatSessions = {};

// ===================== AUTH ROUTES =====================
app.post('/api/login', (req, res) => {
  const { password } = req.body;
  if (password === APP_PASSWORD) {
    req.session.authenticated = true;
    req.session.driverName = 'Admin';
    req.session.sessionId = Date.now().toString() + Math.random().toString(36).slice(2);
    chatSessions[req.session.sessionId] = [];
    res.json({ ok: true, name: 'Admin' });
  } else {
    res.status(401).json({ ok: false, error: 'Wrong password' });
  }
});

app.post('/api/nfc-login', (req, res) => {
  const { nfcId } = req.body;
  if (!nfcId) return res.status(400).json({ ok: false, error: 'No NFC ID' });
  const uid = nfcId.toUpperCase().trim();
  const driverName = NFC_DRIVERS[uid];
  if (driverName) {
    req.session.authenticated = true;
    req.session.driverName = driverName;
    req.session.nfcId = uid;
    req.session.sessionId = Date.now().toString() + Math.random().toString(36).slice(2);
    chatSessions[req.session.sessionId] = [];
    console.log(`NFC login: ${driverName} (${uid})`);
    res.json({ ok: true, name: driverName });
  } else {
    console.log(`NFC login FAILED: ${uid}`);
    res.status(401).json({ ok: false, error: 'NFC not recognized' });
  }
});

app.post('/api/logout', (req, res) => {
  if (req.session.sessionId) delete chatSessions[req.session.sessionId];
  req.session.destroy();
  res.json({ ok: true });
});

app.get('/api/auth-check', (req, res) => {
  res.json({ authenticated: !!req.session.authenticated, name: req.session.driverName || '' });
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
