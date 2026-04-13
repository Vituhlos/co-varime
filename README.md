<div align="center">

# 🍳 Co vaříme?

**Rodinná appka pro hledání receptů, plánování vaření a nákupní seznam.**  
Postavená pro domácnost Jozífek · Zlatěna · Nelča — běží lokálně na Unraid serveru.

[![Docker](https://img.shields.io/badge/Docker-ready-2496ED?logo=docker&logoColor=white)](https://www.docker.com/)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)

</div>

---

## ✨ Co umí

| Funkce | Popis |
|--------|-------|
| 🔍 **AI hledání** | Hledá recepty na českých webech přes Claude API s web searchem |
| 🗳️ **Hlasování** | Navrhni recept celé domácnosti, každý hlasuje 👍/👎 |
| 📋 **Nákupní seznam** | Reálný čas sync přes WebSocket pro celou domácnost |
| ❤️ **Oblíbené** | Recepty uložené v Mealie, přístupné odkudkoli |
| 📖 **Historie** | Přehled co se vařilo a kdo vařil |
| ⚙️ **Nastavení z UI** | Mealie URL, API klíče — vše nastavitelné přímo v appce |
| 📱 **PWA** | Instalovatelná na telefon, funguje offline |

---

## 🚀 Rychlý start (Unraid)

### 1. Přes Community Applications
Vyhledej **„Co vaříme"** v CA store a nainstaluj. Port výchozí: **3335**.

### 2. Ručně přes Docker Compose

```bash
# Stáhni projekt
git clone https://github.com/Vituhlos/co-varime.git
cd co-varime

# Sestav a spusť
docker-compose up -d --build
```

Appka běží na `http://UNRAID-IP:3335`

### 3. První spuštění

Po instalaci otevři appku a jdi do **⚙️ Nastavení**:
1. Zadej **Mealie URL** (např. `http://192.168.1.114:9000`)
2. Zadej **Mealie API klíč** (vygeneruj v Mealie → Profil → API Tokens)
3. Zadej **Anthropic API klíč** (z [console.anthropic.com](https://console.anthropic.com))
4. Klikni **Uložit**

> API klíče se ukládají na server do `/app/data/config.json`, nikdy nejsou viditelné v prohlížeči.

---

## 🗂️ Struktura dat

```
/app/data/          ← mapuj na /mnt/user/appdata/co-varime
  config.json       ← Mealie URL, API klíče, nastavení
  votes.db          ← SQLite databáze hlasování
```

---

## 🧱 Tech Stack

```
Frontend                    Backend
─────────────────────       ──────────────────────────
React 18 + Vite             Node.js 20 + Express
Tailwind CSS                WebSocket (ws)
React Router v6             better-sqlite3 (hlasování)
Plus Jakarta Sans + Inter   
Material Symbols Outlined   

Integrace
──────────────────────────────────────────
Mealie REST API    → ukládání receptů, nákupní seznam, historie
Claude API         → AI hledání receptů s web searchem
Open Food Facts    → autocomplete v nákupním seznamu
```

---

## 📱 Obrazovky

| Obrazovka | Route |
|-----------|-------|
| Domů (hledání + hlasování) | `/` |
| Výsledky hledání | `/results` |
| Detail receptu | `/recipe/:id` |
| Oblíbené (z Mealie) | `/oblibene` |
| Historie vaření | `/historie` |
| Nákupní seznam | `/nakupni-seznam` |
| Nastavení | `/nastaveni` |

---

## 🛠️ Vývoj lokálně

```bash
# Frontend
cd frontend
npm install
npm run dev      # http://localhost:5173

# Backend (v druhém terminálu)
cd backend
npm install
DATA_DIR=./data node server.js   # http://localhost:3000
```

Frontend automaticky proxy-uje `/api/*` na backend.

---

## 🐳 Docker

```bash
# Build
docker build -t co-varime .

# Spustit (port 3335)
docker run -d \
  --name co-varime \
  -p 3335:3000 \
  -v /mnt/user/appdata/co-varime:/app/data \
  --restart unless-stopped \
  co-varime
```

---

<div align="center">

S láskou uvařeno v 2026 🍳  
Jozífek · Zlatěna · Nelča

</div>
