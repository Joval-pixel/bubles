// === util ===
const $ = sel => document.querySelector(sel);
const stage = $('#bubble-stage');

async function fetchPicks() {
  const r = await fetch('/api/picks', { cache: 'no-store' });
  if (!r.ok) throw new Error('Falha ao buscar /api/picks');
  return r.json();
}

function colorFor(p){
  // cor por mercado/seleção (quanto maior a confiança, mais “viva”)
  const conf = Math.max(0, Math.min(1, p.confidence ?? 0.6));
  const alpha = 0.55 + conf*0.35;
  if (p.market === 'OU25') {
    return p.selection === 'OVER'
      ? `rgba(46, 204, 113, ${alpha})`    // verde
      : `rgba(231, 76, 60, ${alpha})`;    // vermelho
  }
  // 1X2
  if (p.selection === 'HOME') return `rgba(46, 204, 113, ${alpha})`;
  if (p.selection === 'AWAY') return `rgba(52, 152, 219, ${alpha})`;
  return `rgba(241, 196, 15, ${alpha})`;  // DRAW
}

function radiusFor(p){
  // raio em px: base 28–96 controlado por confidence (0–1) e bookmakers
  const c = Math.max(0, Math.min(1, p.confidence ?? 0.6));
  const bk = Math.min(30, Math.max(5, p.bookmakers ?? 10));
  const base = 28 + c*55;
  return Math.round(base + (bk-10)*0.9);
}

// === física super simples ===
function simulate(bubbles, W, H){
  const kBounce = 0.9;
  const kCenter = 0.002;
  const repel = 0.7;

  for (let step=0; step<2; step++){ // 2 iterações por frame
    for (let i=0;i<bubbles.length;i++){
      const a = bubbles[i];
      // gravidade pro centro
      a.vx += (W/2 - a.x) * kCenter;
      a.vy += (H/2 - a.y) * kCenter;

      // colisão entre círculos
      for (let j=i+1;j<bubbles.length;j++){
        const b = bubbles[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.hypot(dx,dy) || 0.01;
        const minDist = a.r + b.r + 2;
        if (dist < minDist){
          const ux = dx/dist, uy = dy/dist;
          const overlap = (minDist - dist) * repel;
          a.x -= ux*overlap/2; a.y -= uy*overlap/2;
          b.x += ux*overlap/2; b.y += uy*overlap/2;
        }
      }

      // atualização
      a.x += a.vx; a.y += a.vy;
      a.vx *= 0.92; a.vy *= 0.92;

      // paredes
      if (a.x - a.r < 0){ a.x = a.r; a.vx = Math.abs(a.vx)*kBounce; }
      if (a.x + a.r > W){ a.x = W - a.r; a.vx = -Math.abs(a.vx)*kBounce; }
      if (a.y - a.r < 0){ a.y = a.r; a.vy = Math.abs(a.vy)*kBounce; }
      if (a.y + a.r > H){ a.y = H - a.r; a.vy = -Math.abs(a.vy)*kBounce; }
    }
  }
}

// === renderização ===
function mountBubbles(data){
  stage.innerHTML = '';
  const W = stage.clientWidth, H = stage.clientHeight;

  // tooltip
  const tip = document.createElement('div');
  tip.className = 'tooltip'; tip.style.display='none';
  stage.appendChild(tip);

  const nodes = data.map((p,i) => {
    const r = radiusFor(p);
    const el = document.createElement('div');
    el.className = 'bubble';
    el.style.width = el.style.height = `${r*2}px`;
    el.style.background = colorFor(p);
    el.style.border = '1px solid rgba(255,255,255,.08)';
    el.style.left = `${Math.random()*(W - 2*r) + r}px`;
    el.style.top  = `${Math.random()*(H - 2*r) + r}px`;

    // conteúdo da bolha (times + mercado)
    el.innerHTML = `
      <div style="text-align:center; line-height:1.1">
        ${p.game.split(' vs. ')[0]}<br/>
        <small>${p.selection} ${p.market}</small>
      </div>
    `;

    // tooltip (hover)
    el.addEventListener('mousemove', (ev)=>{
      tip.style.display='block';
      tip.style.left = (ev.offsetX + el.offsetLeft + 12) + 'px';
      tip.style.top  = (ev.offsetY + el.offsetTop  + 12) + 'px';
      tip.innerHTML = `
        <b>${p.game}</b><br/>
        <small>${p.league}${p.country ? ' — '+p.country : ''}</small><br/>
        Mercado: <b>${p.market}</b> • Seleção: <b>${p.selection}</b><br/>
        Odds: ${
          p.market==='OU25'
            ? `Over ${p.odds_over ?? '-'} / Under ${p.odds_under ?? '-'}`
            : `H ${p.odds_home ?? '-'} / D ${p.odds_draw ?? '-'} / A ${p.odds_away ?? '-'}`
        }<br/>
        Confiança: ${(p.confidence??0).toFixed(2)}
      `;
    });
    el.addEventListener('mouseleave', ()=>{ tip.style.display='none'; });

    // clique → painel de detalhes
    el.addEventListener('click', ()=>{
      const box = $('#details');
      box.classList.add('show');
      box.innerHTML = `
        <div style="font-size:18px; font-weight:700">${p.game}</div>
        <div style="opacity:.8">${p.league}${p.country? ' — '+p.country:''}</div>
        <div style="margin-top:6px">Data/Hora (BRT): ${p.datetime_brt ?? '-'}</div>
        <div>Mercado: <b>${p.market}</b> | Seleção: <b>${p.selection}</b></div>
        <div>Odds: ${
          p.market==='OU25'
            ? `Over ${p.odds_over ?? '-'} / Under ${p.odds_under ?? '-'}`
            : `Home ${p.odds_home ?? '-'} / Draw ${p.odds_draw ?? '-'} / Away ${p.odds_away ?? '-'}`
        }</div>
        ${p.analysis_pt ? `<hr/><div>${p.analysis_pt}</div>` : ''}
        ${p.option1 ? `<div style="margin-top:6px">Opção 1: <b>${p.option1}</b> — ${p.reason1||''}</div>`:''}
        ${p.option2 ? `<div>Opção 2: <b>${p.option2}</b> — ${p.reason2||''}</div>`:''}
      `;
    });

    stage.appendChild(el);
    return {
      el, p, r,
      x: parseFloat(el.style.left), y: parseFloat(el.style.top),
      vx: (Math.random()-.5)*2, vy:(Math.random()-.5)*2
    };
  });

  // animação
  function tick(){
    simulate(nodes, W, H);
    for (const n of nodes){
      n.el.style.left = (n.x - n.r) + 'px';
      n.el.style.top  = (n.y - n.r) + 'px';
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

function renderSummary(list){
  $('#last-update').textContent =
    `Atualizado: ${new Date().toLocaleTimeString('pt-BR')} — ${list.length} palpites`;
}

// === fluxo ===
async function refresh() {
  try {
    $('#last-update').textContent = 'Atualizando...';
    const picks = await fetchPicks();
    renderSummary(picks);
    mountBubbles(picks);
  } catch (e) {
    $('#last-update').textContent = 'Erro ao carregar palpites';
    console.error(e);
  }
}

document.getElementById('btn-refresh')?.addEventListener('click', refresh);
window.addEventListener('load', refresh);
window.addEventListener('resize', ()=>{ refresh(); }); // re-render ao redimensionar
