const statusEl = document.querySelector('#status');
const dateEl   = document.querySelector('#date');
const reloadEl = document.querySelector('#reload');
const listEl   = document.querySelector('#bubbles');

// inicia com a data de hoje (UTC)
const todayIso = new Date().toISOString().slice(0, 10);
dateEl.value = todayIso;

reloadEl.addEventListener('click', () => loadFooty(dateEl.value));
document.addEventListener('DOMContentLoaded', () => loadFooty(dateEl.value));

async function loadFooty(iso) {
  try {
    listEl.innerHTML = '';
    statusEl.textContent = 'Carregando...';

    const r = await fetch(`/api/footy?date=${iso}`, { cache: 'no-store' });
    if (!r.ok) {
      const t = await r.text().catch(()=> '');
      throw new Error(`API /footy falhou: ${r.status} ${r.statusText} ${t}`);
    }
    const data = await r.json();

    if (!data || !Array.isArray(data.matches) || data.matches.length === 0) {
      statusEl.textContent = `Sem jogos para ${iso}.`;
      return;
    }

    statusEl.textContent = '';

    const frag = document.createDocumentFragment();
    for (const m of data.matches) {
      frag.appendChild(card(m));
    }
    listEl.appendChild(frag);
  } catch (err) {
    console.error(err);
    statusEl.textContent = `Erro ao carregar dados: ${err.message}`;
  }
}

function card(m) {
  const el = document.createElement('article');
  el.className = 'card';

  const conf = Math.round((m.confidence ?? 0) * 100); // 0..100
  const good  = conf >= 60;
  const badge = document.createElement('div');
  badge.className = `badge ${good ? 'good':'bad'}`;
  badge.textContent = conf ? conf+'%' : '--';

  const right = document.createElement('div');
  right.className = 'teams';
  const b = document.createElement('b');
  b.textContent = `${m.home.name} vs ${m.away.name}`;
  const meta = document.createElement('div');
  meta.className = 'meta';
  const dt = new Date(m.kickoff_ts*1000);
  meta.textContent = `${m.league.name} • ${dt.toLocaleString('pt-BR', { hour: '2-digit', minute:'2-digit' })}`;

  right.appendChild(b);
  right.appendChild(meta);

  el.appendChild(badge);
  el.appendChild(right);

  el.addEventListener('click', () => openHistory(m));
  return el;
}

async function openHistory(m) {
  const url = `/api/history?home=${m.home.id}&away=${m.away.id}`;
  try {
    statusEl.textContent = 'Carregando histórico...';
    const r = await fetch(url, { cache:'no-store' });
    const j = await r.json();
    console.log('HIST', j);
    statusEl.textContent = 'Histórico carregado (veja o console).';
  } catch (e) {
    console.error(e);
    statusEl.textContent = `Erro no histórico: ${e.message}`;
  }
}
