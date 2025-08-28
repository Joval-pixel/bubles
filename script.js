// ------ utils ------
const $ = (q) => document.querySelector(q);
const graph = $('#graph');
const stats = $('#stats');
const modal = $('#modal');
const mTitle = $('#mTitle');
const mBody = $('#mBody');
const fmtTime = (iso) => new Date(iso).toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'});
const todayISO = () => new Date().toISOString().slice(0,10);

// estado
const state = { items: [], date: todayISO() };
$('#dateInput').value = state.date;
$('#mClose').onclick = () => modal.close();

// -------- core: probabilidade a partir das odds -----------
function impliedFrom1x2(odds) {
  // odds: { home, draw, away } (decimais)
  if (!odds) return null;
  const H = Number(odds.home), D = Number(odds.draw), A = Number(odds.away);
  if (!(H>1) || !(D>1) || !(A>1)) return null;

  // probabilidade implícita (sem vigorish): 1/odd
  const pH = 1/H, pD = 1/D, pA = 1/A;
  const sum = pH + pD + pA;
  if (sum <= 0) return null;

  // normaliza para 1
  const nH = pH / sum, nD = pD / sum, nA = pA / sum;
  const best = Math.max(nH, nD, nA);
  const pick = best === nH ? 'Casa' : best === nA ? 'Fora' : 'Empate';

  return {
    norm: { home: nH, draw: nD, away: nA },
    best, pick
  };
}

// fallback simples quando não houver odds
function fallbackProb() {
  return { norm: {home: 0.34, draw: 0.32, away: 0.34}, best: 0.34, pick: 'Casa' };
}

// -------- carregar e desenhar ----------
async function loadAndDraw(){
  graph.innerHTML = '<div class="loading">Carregando…</div>';
  try{
    const r = await fetch(`/api/footy?date=${state.date}`, { cache:'no-store' });
    const data = await r.json();
    const list = (data.matches || []).map(m => {
      const calc = impliedFrom1x2(m?.odds?.['1x2']) || fallbackProb();
      return {
        ...m,
        _probBest: calc.best,       // 0..1
        _pick: calc.pick,           // "Casa" | "Empate" | "Fora"
        _probs: calc.norm           // {home,draw,away}
      };
    }).sort((a,b)=> (b._probBest - a._probBest));

    state.items = list;
    drawBubbles(list);
    stats.innerHTML = `<b>Jogos:</b> ${list.length} &nbsp;|&nbsp; <b>Data:</b> ${data.date || state.date}`;
  }catch(err){
    graph.innerHTML = `<div class="loading" style="color:#ff8899">Erro: ${String(err)}</div>`;
  }
}

function drawBubbles(list){
  graph.innerHTML = '';

  // funções de apresentação
  const sizeFor = (p) => {
    // 30..120 px conforme confiança
    return Math.round(30 + Math.max(0, Math.min(1, p)) * 90);
  };
  const colorFor = (p) => {
    // verde -> azul -> amarelo -> vermelho (faixas)
    if (p >= 0.66) return 'radial-gradient(circle at 30% 30%, #32ffcc, #128b6d)'; // muito alta
    if (p >= 0.58) return 'radial-gradient(circle at 30% 30%, #5cf1ff, #116b8b)'; // alta
    if (p >= 0.52) return 'radial-gradient(circle at 30% 30%, #ffe082, #c98a1a)'; // média
    return 'radial-gradient(circle at 30% 30%, #ff9aa2, #9b1d2d)';               // baixa
  };

  // layout em linhas
  let x=18, y=18, lineH=0;
  const W = graph.clientWidth || 1000;
  const pad = 14;

  for (const m of list){
    const r = sizeFor(m._probBest);

    if (x + r + pad > W) { x = 18; y += lineH + pad; lineH = 0; }
    lineH = Math.max(lineH, r);

    const el = document.createElement('div');
    el.className = 'bubble';
    el.style.position = 'absolute';
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = el.style.height = `${r}px`;
    el.style.background = colorFor(m._probBest);

    const time = m.kickoff ? fmtTime(m.kickoff) : '--:--';

    // escudos (se existirem)
    const logos = `
      <div style="display:flex;justify-content:center;gap:6px;margin-bottom:4px">
        ${m.home?.logo ? `<img src="${m.home.logo}" alt="" style="width:22px;height:22px;border-radius:50%">` : ''}
        ${m.away?.logo ? `<img src="${m.away.logo}" alt="" style="width:22px;height:22px;border-radius:50%">` : ''}
      </div>`;

    el.innerHTML = `
      <div class="label">
        ${logos}
        <div style="font-weight:700">${m.home?.name || 'Casa'} vs ${m.away?.name || 'Fora'}</div>
        <div style="opacity:.85">${m.league || ''} • ${time}</div>
        <div style="margin-top:4px;opacity:.9">Confiança: ${(m._probBest*100).toFixed(0)}% • Palpite: ${m._pick}</div>
        ${renderOdds(m)}
      </div>
    `;

    el.onclick = ()=> openMatchModal(m);
    el.onpointerdown = ()=> el.style.transform='scale(.98)';
    el.onpointerup = ()=> el.style.transform='scale(1)';
    graph.appendChild(el);

    x += r + pad;
  }
}

function renderOdds(m){
  const o = m?.odds?.['1x2'] || null;
  if (!o) return '';
  const fmt = (n)=> (typeof n==='number' ? n.toFixed(2) : (n ?? '-'));
  return `
    <div style="margin-top:6px;font-size:11px;opacity:.9">
      1x2: <b>${fmt(o.home)}</b> / <b>${fmt(o.draw)}</b> / <b>${fmt(o.away)}</b>
      ${o.bookmaker ? ` • ${o.bookmaker}` : ''}
    </div>
  `;
}

// -------- modal com histórico ----------
async function openMatchModal(m){
  const hId = m?.home?.id, aId = m?.away?.id;
  mTitle.textContent = `${m?.home?.name || 'Casa'} vs ${m?.away?.name || 'Fora'} — ${m.league || ''}`;
  mBody.textContent = 'Carregando análise…';
  modal.showModal();

  if (!hId || !aId){
    mBody.textContent = 'IDs de times ausentes para consulta de histórico.';
    return;
  }
  try{
    const r = await fetch(`/api/history?home=${hId}&away=${aId}`, { cache:'no-store' });
    const j = await r.json();
    mBody.textContent = JSON.stringify(j, null, 2);
  }catch(e){
    mBody.textContent = 'Falha ao carregar histórico: ' + String(e);
  }
}

// -------- listeners ----------
$('#refreshBtn').onclick = () => {
  state.date = $('#dateInput').value || todayISO();
  loadAndDraw();
};

// primeiro load
loadAndDraw();
