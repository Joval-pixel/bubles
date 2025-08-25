# Bubles Stats — Bolhas com odds (API-Football via Vercel Function)

## Como rodar
1. Crie o projeto na Vercel e **adicione a env** `RAPIDAPI_KEY` (API‑Football/RapidAPI).
2. Suba estes arquivos (GitHub ou Vercel CLI).
3. A página inicial carrega fixtures do dia e odds via `/api/footy`.

## Estrutura
- `index.html`, `style.css`, `script.js` — front estático (Canvas das bolhas, paywall PIX simulado).
- `api/footy.js` — função serverless (proxy + cache 60s) que injeta sua `RAPIDAPI_KEY`.
