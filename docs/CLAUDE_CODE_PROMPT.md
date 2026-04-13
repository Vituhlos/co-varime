# Co vaříme? — Claude Code Prompt

## Kontext projektu
Vytvoř fullstack webovou aplikaci "Co vaříme?" — recipe discovery appka pro domácí použití. Česká domácnost 3 lidí (Jozífek, Zlatěna, Nelča). Appka běží jako Docker kontejner na Unraid serveru (192.168.1.114).

---

## Tech Stack
- **Frontend:** React + Vite, Tailwind CSS, Plus Jakarta Sans + Inter fonty, Material Symbols Outlined
- **Backend:** Node.js + Express
- **Databáze receptů:** Mealie REST API (lokální instance)
- **AI hledání:** Claude API (claude-sonnet-4-20250514) s web searchem
- **Produktová databáze:** Open Food Facts API (autocomplete v nákupním seznamu)
- **Realtime sync:** WebSocket (nákupní seznam)
- **Deployment:** Docker + docker-compose

---

## Design systém

### Barvy
```css
--background: #f7f9fb;
--on-surface: #191c1e;
--on-surface-variant: #414755;
--primary: #0058bc;
--secondary: #006e26;
--outline: #717786;
--surface-container-lowest: #ffffff;
--surface-container-low: #f2f4f6;
--surface-container: #eceef0;
--brand-gradient: linear-gradient(135deg, #32ADE6, #30D158);
```

### Glass card
```css
background: rgba(255, 255, 255, 0.55);
backdrop-filter: blur(32px) saturate(180%);
border: 1px solid rgba(255, 255, 255, 0.45);
border-radius: 24px;
```

### Background orby (na všech obrazovkách)
```html
<div style="position:fixed;top:-100px;left:-100px;width:400px;height:400px;background:#7dd3fc;filter:blur(80px);opacity:0.3;border-radius:50%;z-index:-1;"></div>
<div style="position:fixed;bottom:-150px;right:-100px;width:500px;height:500px;background:#d8b4fe;filter:blur(80px);opacity:0.3;border-radius:50%;z-index:-1;"></div>
```

### Logo (header)
```html
<span class="material-symbols-outlined" style="color:#007AFF;font-variation-settings:'FILL' 1;">restaurant_menu</span>
<span style="background:linear-gradient(135deg,#32ADE6,#30D158);-webkit-background-clip:text;-webkit-text-fill-color:transparent;font-weight:800;">Co vaříme?</span>
```

### Fonty
- Headlines: Plus Jakarta Sans (800, 700, 600)
- Body: Inter (400, 500, 600)
- Icons: Material Symbols Outlined (FILL 0-1)

---

## Obrazovky a funkce

### 1. Home Screen (`/`)
- **Dynamický pozdrav podle denní doby:**
  - 6-11h → "Dobré ráno! ☀️" / "Co dnes uvaříme?"
  - 11-14h → "Čas na oběd 🍽️" / "Co si dáme?"
  - 14-18h → "Dobré odpoledne 👋" / "Co vaříme k večeři?"
  - 18-23h → "Dobrý večer 🌙" / "Co k večeři?"
  - 23-6h → "Pozdní noc 🌙" / "Ještě vaříme?"
- **Voting karta** (zobrazí se když existuje aktivní návrh):
  - Thumbnail receptu + název + "Navrhl: Já"
  - Tlačítka 👍 "Chci to" (zelený) + 👎 "Nechci" (červený)
  - Iniciály J/Z/N se stavem hlasování (✅/❓)
  - X pro zavření karty
- **Vyhledávání:**
  - Input "INGREDIENCE NEBO NÁZEV" s ikonou search
  - Mood chips (flex-wrap): Maso 🥩 / Lehké 🥗 / Těstoviny 🍝 / Polévka 🍲 / Veggie 🥦 / Rychlé ⚡ / Na víkend 🎉 / Dezert 🍰
  - Vybraný chip = brand gradient + bílý text
  - CTA button "Najít recepty" — aktivní jen když je zadán vstup
- **Nedávno vařeno:** poslední 2 recepty z Mealie cooking logu (foto karta)

### 2. Results Screen (`/results`)
- Header s back buttonem + search query
- **Filter bar** (horizontálně scrollovatelný):
  - Čas: Vše / Do 30 min / Do 60 min
  - Porce: Pro 2 / Pro 4 / Pro rodinu
  - Typ: Vegetariánské
- **Recipe karty** (glass card, foto nahoře h-64):
  - Foto z receptu (nebo placeholder)
  - Název (bold)
  - ⏱ čas + obtížnost + zdroj (website)
  - "Nedávno vařeno" badge pokud byl recept vařen v posledních 7 dnech
  - Heart ikona pro oblíbené
- Zdroj dat: Claude API s web searchem — hledá české receptové weby

### 3. Detail Screen (`/recipe/:id`)
- **Hero foto** (full-width, 400px výška)
- Back button + heart button overlaid na foce
- **Title karta** (glass, přesahuje přes foto):
  - Zdroj webu (toprecepty.cz) — malý muted text
  - Název receptu (bold, velký)
- **Meta pills:** ⏱ čas / 👥 porce / ⭐ obtížnost
- **Škálování porcí:** tlačítka 2 / 4 / 6 / 8+ — výběr přepočítá ingredience
- **Ingredience** (checklist):
  - Každá ingredience = checkbox + název + množství (modré)
  - Zaškrtnuté = strikethrough + muted
- **Postup přípravy** (numbered steps):
  - Gradient číslovaný kruh + název kroku + popis
  - Timer tlačítko "⏱ X min" na pravé straně (pro kroky s čekáním)
- **CTA buttons:**
  - "🥄 Přidat do Mealie" — brand gradient (primární)
  - "▶ Začít vařit" — secondary
  - "🔗 Otevřít originál" — outline

### 4. Oblíbené Screen (`/oblibene`)
- Recepty z Mealie API (`GET /api/recipes`)
- Search bar "Hledej v uložených..."
- **"🔀 Překvap mě — náhodný recept"** button (glass style, shuffle ikona)
- Recipe karty stejné jako Results
- Každá karta zobrazuje "vařeno před X dny" pokud existuje v historii

### 5. Historie Screen (`/historie`)
- Cooking log z Mealie + lokální databáze
- Každý záznam: foto (malé, rounded) + název + datum + iniciály kdo vařil (J/Z/N barevné badge)
- Empty state: "Zatím žádná historie. Uvařte svůj první recept!"

### 6. Nákupní seznam Screen (`/nakupni-seznam`)
- Grouped checklist podle receptu (UPPERCASE label skupiny)
- Každá položka: checkbox + název + množství + trash ikona (delete)
- Zaškrtnuté = strikethrough + muted
- **FAB button** (bottom right, nad navbarem): brand gradient, "+" ikona
- **Bottom sheet panel** (po kliknutí FAB):
  - **Krok 1:** Input "Název položky..." + autocomplete z Open Food Facts API (3-4 návrhy s ikonkou + kategorií)
  - **Krok 2** (po výběru položky): Vybraná položka nahoře + Množství (− / číslo / +) + Jednotka chips (ks/g/kg/ml/l/bal) + Poznámka input
  - CTA "Přidat do seznamu"
- **"Vymazat nakoupené"** button dole (glass, červený text)
- WebSocket sync — reálný čas pro celou domácnost

### 7. Nastavení Screen (`/nastaveni`)
- Přístup přes ⚙️ ikona v headeru (top right)
- Back button + "Nastavení" title, bez bottom navu
- **Sekce "Domácnost":** členové (J/Z/N) s barevnou iniciálou + jménem + edit/delete + "Přidat člena"
- **Sekce "Připojení":** Mealie URL input + API klíč input + "Otestovat připojení" button
- **Sekce "Výchozí nastavení":** výchozí porce (2/4/6/8) + výchozí mood chip
- **Sekce "Vzhled":** light/dark mode toggle
- **Sekce "O aplikaci":** verze + GitHub odkaz
- Dole: "S láskou uvařeno v 2026" 😄

---

## Backend API endpointy

### Recipe Search
```
POST /api/search
Body: { query: string, moods: string[], filters: { time?: number, servings?: number, type?: string } }
→ Volá Claude API s web searchem
→ Vrací: [{ title, url, time, difficulty, servings, source, image, description, ingredients, steps }]
```

### Mealie integrace
```
GET  /api/mealie/recipes          → seznam uložených receptů
POST /api/mealie/recipes          → přidej recept (create-url endpoint)
GET  /api/mealie/shopping         → nákupní seznam
POST /api/mealie/shopping         → přidej položku
GET  /api/mealie/history          → cooking log
```

### Open Food Facts autocomplete
```
GET /api/products/search?q=mléko  → Open Food Facts API search
→ Vrací: [{ name, category, image }]
```

### Hlasování
```
POST /api/vote/propose            → navrhni recept domácnosti
POST /api/vote/:id                → hlasuj (👍/👎)
GET  /api/vote/active             → aktivní návrh
```

### WebSocket
```
ws://localhost:3000/ws
→ Sync nákupního seznamu v reálném čase
→ Events: item_added, item_checked, item_deleted, list_cleared
```

---

## Claude API integrace

```javascript
// Backend proxy — NIKDY nevystavuj API klíč frontendu
const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": process.env.ANTHROPIC_API_KEY,
    "anthropic-version": "2023-06-01"
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 4000,
    tools: [{ type: "web_search_20250305", name: "web_search" }],
    system: `Jsi asistent pro hledání receptů. Hledáš české recepty na internetu.
    Vždy vrať JSON pole receptů v tomto formátu:
    [{ "title": "", "url": "", "time": 30, "difficulty": "Lehké|Střední|Těžké", 
       "servings": 4, "source": "toprecepty.cz", "image": "", 
       "description": "", "ingredients": [{"name":"","amount":"","unit":""}],
       "steps": [{"title":"","description":"","timer":null}] }]
    Hledej výhradně na českých receptových webech (toprecepty.cz, vareni.cz, recepty.cz, apetit.cz).
    Vrať pouze validní JSON, žádný jiný text.`,
    messages: [{ role: "user", content: query }]
  })
});
```

---

## Mealie API konfigurace

```javascript
// config.js
const MEALIE_URL = process.env.MEALIE_URL || "http://192.168.1.114:9000";
const MEALIE_API_KEY = process.env.MEALIE_API_KEY;

// Import receptu z URL (nejjednodušší způsob)
await fetch(`${MEALIE_URL}/api/recipes/create-url`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${MEALIE_API_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ url: recipeUrl })
});
```

---

## Struktura projektu

```
co-varime/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.jsx          # Header + BottomNav + orby
│   │   │   ├── RecipeCard.jsx      # Karta receptu (results + oblíbené)
│   │   │   ├── GlassCard.jsx       # Základní glass card komponenta
│   │   │   ├── VotingCard.jsx      # Hlasovací karta na home
│   │   │   ├── TimerButton.jsx     # Timer v kroku přípravy
│   │   │   └── AddItemSheet.jsx    # Bottom sheet pro nákupní seznam
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── Results.jsx
│   │   │   ├── Detail.jsx
│   │   │   ├── Oblibene.jsx
│   │   │   ├── Historie.jsx
│   │   │   ├── NakupniSeznam.jsx
│   │   │   └── Nastaveni.jsx
│   │   ├── hooks/
│   │   │   ├── useWebSocket.js     # WS sync pro nákupní seznam
│   │   │   └── useMealie.js        # Mealie API calls
│   │   └── App.jsx
│   ├── index.html
│   └── vite.config.js
├── backend/
│   ├── routes/
│   │   ├── search.js               # Claude API search
│   │   ├── mealie.js               # Mealie proxy
│   │   ├── products.js             # Open Food Facts
│   │   └── vote.js                 # Hlasování
│   ├── websocket.js                # WS server
│   └── server.js
├── docker-compose.yml
└── .env.example
```

---

## Docker compose

```yaml
version: "3.8"
services:
  frontend:
    build: ./frontend
    ports:
      - "5173:5173"
  backend:
    build: ./backend
    ports:
      - "3000:3000"
    environment:
      - ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      - MEALIE_URL=${MEALIE_URL}
      - MEALIE_API_KEY=${MEALIE_API_KEY}
    volumes:
      - ./data:/app/data
```

---

## Důležité poznámky

1. **Mealie URL** je `http://192.168.1.114:9000` — lokální Unraid server
2. **Nikdy** nevystavuj API klíče frontendu — vše přes backend proxy
3. Appka běží jako **PWA** — přidej manifest.json a service worker
4. Všechny texty jsou **česky**
5. Bottom nav má 4 taby: Hledej (search) / Oblíbené (favorite) / Nákupní seznam (shopping_cart) / Historie (history)
6. Settings je dostupný přes ⚙️ v headeru, ne přes nav
7. WebSocket port 3001 pro realtime sync nákupního seznamu
8. Hlasování persists v lokální SQLite databázi (`/app/data/votes.db`)
9. Historie vaření kombinuje Mealie cooking log + lokální záznamy

---

## Reference design soubory — POVINNÉ

**KRITICKÁ INSTRUKCE:** Před psaním jakéhokoliv kódu si přečti VŠECHNY HTML soubory ve složkách a DESIGN.md. Design ze Stitche je závazný a musí být dodržen přesně:

- Každá obrazovka má svůj HTML soubor — implementuj ji tak aby vizuálně odpovídala 1:1
- Kopíruj přesné CSS třídy, barvy, spacing, komponenty a typografii z HTML souborů
- Dodržuj pravidla z DESIGN.md — zejména glass card styl, orby, brand gradient a typografii
- Neupravuj design podle vlastního uvážení — pokud něco není v HTML souborech, použij design systém z DESIGN.md
- Fonty: Plus Jakarta Sans + Inter + Material Symbols Outlined — načti je z Google Fonts stejně jako v HTML souborech

Složky s design soubory:
- `home_voting_feature/` → Home screen
- `results_4_tab_nav/` → Results screen  
- `detail_4_tab_nav/` → Detail screen
- `obl_ben_4_tab_nav/` → Oblíbené screen
- `historie_4_tab_nav/` → Historie screen
- `n_kupn_seznam_p_idat_krok_1/` + `n_kupn_seznam_p_idat_krok_2/` → Nákupní seznam screen
- `nastaven/` → Nastavení screen
- `lumina_culinary/DESIGN.md` → Kompletní design systém
