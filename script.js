(function () {
  const statusEl = document.getElementById('status');
  const gridEl   = document.getElementById('bubbles');
  const dateIn   = document.getElementById('date-input');
  const btn      = document.getElementById('refresh-btn');

  // Data padrão = hoje (UTC)
  const todayISO = new Date().toISOString().slice(0,10);
  dateIn.value = todayISO;

  btn.addEventListener('click', load);
  window.addEventListener('DOMContentLoaded', load);

  async function load(){
    const date = dateIn.value || todayISO;
    setStatus(`Carregando jogos de ${date}...`);
    gridEl.hidden = true;
    gridEl.innerHTML = '';

    try{
      const r = await fetch(`/api/footy?date=${date}`);
      const j = await r.json();

      if(!r.ok){
        throw new Error(j?.error || j?.message || 'Erro ao carregar');
      }

      const games = j.matches || j.fixtures || [];
      if (!games.length){
        setStatus('Nenhum jogo encontrado para a data.');
        return;
      }

      // Ordena por liga + horário
      games.sort((a,b) => (a.league?.name||'').localeCompare(b.league?.name||'') || (a.timestamp||0)-(b.timestamp||0));

      const frag = document.createDocumentFragment();
      for(const g of games){
        frag.appendChild(bubble(g));
      }
      gridEl.appendChild(frag);
      statusEl.textContent = '';
      gridEl.hidden = false;
    }catch(err){
      setStatus(`Falha ao carregar: ${err.message}`);
      console.error(err);
    }
  }

  function bubble(g){
    const el = document.createElement('article');
    el.className = 'bubble';

    const conf = confidenceScore(g); // 0..100
    const badge = document.createElement('div');
    badge.className = 'badge ' + (conf >= 70 ? 'ok' : conf >= 40 ? 'warn' : 'risk');
    badge.textContent = Math.round(conf);

    const teams = document.createElement('div');
    teams.className = 'teams';
    teams.innerHTML = `
      <div class="names">${safe(g.home?.name)} <small>vs</small> ${safe(g.away?.name)}</div>
      <div class="meta">${fmtLeague(g)} • ${fmtTime(g.timestamp)} • id:${g.id}</div>
    `;

    el.appendChild(badge);
    el.appendChild(teams);

    el.title = 'Clique para ver histórico (últ. 10 partidas + H2H)';
    el.style.cursor = 'pointer';
    el.addEventListener('click', async () => {
      try{
        const r = await fetch(`/api/history?home=${g.home?.id}&away=${g.away?.id}`);
        const j = await r.json();
        alert(renderHistory(j, g));
      }catch(e){
        alert('Não foi possível obter o histórico agora.');
      }
    });

    return el;
  }

  function confidenceScore(g){
    // Heurística simples: se existir probabilidade (odds normalizadas), usa; senão cai num 40-60 aleatório controlado
    const p = Number(g.marketProb || g.prob || g.confidence || 0);
    if(p > 0) return Math.max(1, Math.min(100, p));
    // fallback: levemente maior para ligas conhecidas
    const known = /Brazil|England|Spain|Italy|Germany|France|UEFA|CONMEBOL/i.test(`${g.league?.country} ${g.league?.name}`);
    return (known ? 60 : 45) + (g.id % 8 - 4) * 2; // pseudo-ruído estável
  }

  function fmtLeague(g){
    const l = g.league || {};
    return [l.country, l.name].filter(Boolean).join(' — ');
  }
  function fmtTime(ts){
    if(!ts) return '—';
    const d = new Date(ts*1000);
    return d.toLocaleString('pt-BR', {hour:'2-digit', minute:'2-digit'}) + 'h';
  }
  function safe(s){ return (s??'').replace(/[<>]/g,'') }

  function renderHistory(h, g){
    const home = g.home?.name || 'Casa';
    const away = g.away?.name || 'Fora';
    const s = [
      `${home} vs ${away}`,
      '',
      `Casa:  J=${h.home?.games??0}  W=${h.home?.W??0}  D=${h.home?.D??0}  L=${h.home?.L??0}`,
      `Fora:  J=${h.away?.games??0}  W=${h.away?.W??0}  D=${h.away?.D??0}  L=${h.away?.L??0}`,
      `H2H:   J=${h.h2h?.games??0}  Casa=${h.h2h?.homeW??0}  Empates=${h.h2h?.draws??0}  Fora=${h.h2h?.awayW??0}`
    ];
    return s.join('\n');
  }

  function setStatus(t){ statusEl.textContent = t; }
})();