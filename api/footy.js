// /api/footy.js
const BASE = 'https://api-football-v1.p.rapidapi.com/v3';

module.exports = async (req, res) => {
  try {
    const key = process.env.RAPIDAPI_KEY || '';
    const headers = key ? {
      'X-RapidAPI-Key': key,
      'X-RapidAPI-Host': 'api-football-v1.p.rapidapi.com'
    } : {};

    // data no formato YYYY-MM-DD
    const iso = (req.query?.date && /^\d{4}-\d{2}-\d{2}$/.test(req.query.date))
      ? req.query.date
      : new Date().toISOString().slice(0,10);

    if (!key) {
      // Sem chave → não quebra o front
      return res.status(200).json({ source:'api', date: iso, matches: [] });
    }

    const url = `${BASE}/fixtures?date=${iso}&timezone=UTC`;
    const r = await fetch(url, { headers });
    const j = await r.json();

    if (!r.ok) {
      const msg = j?.message || j?.errors?.[0] || 'Erro API';
      return res.status(500).json({ source:'api', error: msg });
    }

    const matches = (j.response || []).map(x => {
      const fx = x.fixture || {};
      const lg = x.league || {};
      const t  = x.teams  || {};
      return {
        id: fx.id,
        timestamp: fx.timestamp,
        league: { id: lg.id, name: lg.name, country: lg.country, season: lg.season },
        home: { id: t.home?.id, name: t.home?.name, logo: t.home?.logo },
        away: { id: t.away?.id, name: t.away?.name, logo: t.away?.logo }
        // marketProb / prob podem ser acrescentadas se você ativar endpoint de odds
      };
    });

    return res.status(200).json({ source:'api', date: iso, matches });
  } catch(err) {
    return res.status(500).json({ source:'api', error: String(err?.message || err) });
  }
};