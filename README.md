# Product Safety Games

Two educational browser games about **consumer product safety** — the products we buy in shops and online. Built for an EU/Malta context (CE marking, EU Safety Gate recalls, MCCAA) with a full **English / Maltese** language toggle.

| | Game | Ages | Style |
|---|---|---|---|
| 🧸⭐ | **Safety Stars** (`/game1`) | 4–6 | 2D tap-and-play arcade: spot dangers in rooms, sort toys into "safe" vs "tell a grown-up", catch only the safe toys. No reading required — includes spoken narration. |
| 🕵️🔎 | **Safety Detective** (`/game2`) | 8–12 | First-person 3D house (Three.js): inspect 12 products for CE marks, warning labels and EU contact details, scan the EU Safety Gate for recalls, then beat a dodgy online shop full of counterfeit listings. |

## What the games teach

- **Hazard spotting** — button batteries, small magnets, broken toys/small parts, cords, electrical items near water
- **Safety labels & age marks** — the CE mark, the "not for under 3" symbol, missing importer addresses, fake-looking marks
- **Recalls** — what the EU Safety Gate is, why a CE-marked product can still be recalled, and "stop using it & tell someone"
- **Safe buying online** — too-good-to-be-true prices, fake reviews, missing seller details, no CE/safety info

## Running locally

Everything is static — no build step.

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Deployment

Pushes to `main` (or the development branch) deploy automatically to **GitHub Pages** via `.github/workflows/pages.yml`. If the first deploy fails, enable Pages once in **Settings → Pages → Source: GitHub Actions**, then re-run the workflow.

## Structure

```
index.html            landing hub with language toggle
shared/i18n.js        shared EN/MT language handling (persisted in localStorage)
game1/                Safety Stars (ages 4–6) — vanilla JS + Canvas
game2/                Safety Detective (ages 8–12) — Three.js, ES modules
vendor/               vendored three.js (no CDN dependency)
```

> Maltese strings were machine-drafted and should be reviewed by a native speaker.
