# Gricius Logistics Driver Assistant

AI pagalbininkas vairuotojams — Gricius Logistics

## Kaip paleisti Railway.app

### 1 žingsnis — GitHub
1. Eik į **github.com** ir sukurk naują repository (pvz. `gricius-assistant`)
2. Įkelk visus šiuos failus į repository

### 2 žingsnis — Railway
1. Eik į **railway.app** ir prisijunk (galima per GitHub)
2. Spausk **"New Project"** → **"Deploy from GitHub repo"**
3. Pasirink savo repository
4. Railway automatiškai aptiks Node.js ir paleis

### 3 žingsnis — Environment Variables (SVARBIAUSIA)
Railway → tavo projektas → **Variables** → pridėk:

| Kintamasis | Reikšmė |
|------------|---------|
| `ANTHROPIC_API_KEY` | sk-ant-... (tavo Anthropic raktas) |
| `APP_PASSWORD` | Tavo pasirinktas slaptažodis vairuotojams |
| `SESSION_SECRET` | Bet koks atsitiktinis tekstas (pvz. `gricius-xyz-2025`) |

### 4 žingsnis — Domain
Railway → **Settings** → **Domains** → **Generate Domain**
Gausite nuorodą tipo: `gricius-assistant.up.railway.app`

Tą nuorodą duokite vairuotojams!

## Situacijų valdymas (ateityje)
Situacijas galima pridėti per API:
```
POST /api/situations
{ "situations": [{ "title": "Sprogo padanga", "answer": "1. Ramiai..." }] }
```

## Techninė informacija
- Node.js + Express
- Anthropic Claude Haiku (greitas, pigus)
- Session-based auth (8 val. sesija)
- Pokalbio istorija per sesiją
