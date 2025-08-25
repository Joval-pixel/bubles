# BUBLES — Palpites em Bolhas (Futebol)

## O que é
Interface de **bolhas interativas** para palpites de futebol, com tamanho por **confiança** e cor pela **tendência** do mercado/seleção. Detalhes do palpite em painel (PT/EN), pronto para área de assinantes.

## Como publicar na Vercel
1. Adicione os arquivos deste repo. 
2. Em **Settings → Environment Variables**, crie `RAPIDAPI_KEY` (sua chave da API‑Football via RapidAPI).
3. Deploy (Static + Functions). As rotas da pasta `/api` viram endpoints serverless.

## Endpoints
- `GET /api/picks` — **mock** de palpites diários em `data/picks-sample.json`. (Troque por seu pipeline de IA.)
- `GET /api/footy?path=/v3/fixtures&date=YYYY-MM-DD` — proxy para API‑Football (com cache 60s).

## Onde colocar o seu prompt/IA
- Gere diariamente um JSON com a estrutura de `data/picks-sample.json` usando o **prompt** fornecido (PT/EN).
- Salve o arquivo com os palpites do dia e sirva em `/api/picks` (ou substitua a função para buscar de um banco).

## Estrutura do objeto de palpite
```json
{
  "fixtureId": 123,
  "game": "Time A vs. Time B",
  "league": "Premier League",
  "country": "England",
  "datetime_brt": "2025-08-25 16:00",
  "market": "OU25 | 1X2",
  "selection": "OVER|UNDER|HOME|DRAW|AWAY",
  "odds_over": 1.85, "odds_under": 2.00,   // para OU25
  "odds_home": 1.95, "odds_draw": 3.60, "odds_away": 3.50, // para 1X2
  "pOver": 0.54, "pUnder": 0.46,           // OU25 normalizado (sem vig)
  "pHome": 0.47, "pDraw": 0.25, "pAway": 0.28, // 1X2 normalizado
  "bookmakers": 18,
  "confidence": 0.72,                       // 0–1, define tamanho da bolha
  "analysis_pt": "texto (conforme prompt)",
  "analysis_en": "text (same content in English)",
  "recent": "Time A (3V,2E); Time B (4V,1D)",
  "h2h": "resumo H2H",
  "stats": "xG/xGA, chutes, posse, escanteios…",
  "squad": "lesões/suspensões",
  "option1": "Aposta recomendada 1", "reason1": "Justificativa 1",
  "option2": "Aposta recomendada 2", "reason2": "Justificativa 2"
}
```

## Observações
- Este projeto **não faz scraping**. Dados reais vêm de API licenciada.
- O painel de assinantes é simples (PIX **simulado**). Integração Pix real pode ser adicionada com webhook.
