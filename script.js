const $ = sel => document.querySelector(sel);
const stage = $('#bubble-stage');

async function fetchPicks() {
  const r = await fetch('/api/picks', { cache: 'no-store' });
  if (!r.ok) throw new Error('Falha ao buscar /api/picks');
  return r.json();
}

function renderSummary(list){
  const box = $('#last-update');
  if (box) box.textContent =
    `Atualizado: ${new Date().toLocaleTimeString('pt-BR')} — ${list.length} palpites`;
}

function mountBubbles(data){
  if (!stage) return;
  stage.innerHTML = '';

  const W = stage.clientWidth || 600;
  const H = stage.clientHeight || 400;

  data.forEach(p=>{
    // tamanho proporcional à confiança
    const conf = p.confidence ? p.confidence : 0.5;
    const r = 40 + conf*60; // raio entre 40 e 100

    // cor: verde se "OVER" ou vitória mandante, vermelho se "UNDER" ou visitante
    let bg = 'rgba(46,204,113,0.8)'; // verde
    if (p.selection?.toUpperCase().includes('UNDER') || p.selection?.toUpperCase().includes('AWAY')) {
      bg = 'rgba(231,76,60,0.85)'; // vermelho
    }

    const el = document.createElement('div');
    el.className = 'bubble';
    el.style.width = el.style.height = `${r*2}px`;
    el.style.background = bg;

    // posição inicial
    el.style.left = (Math.random()*(W-2*r))+'px';
    el.style.top  = (Math.random()*(H-2*r))+'px';

    el.innerHTML = `<div>${p.selection}</div>`;

    stage.appendChild(el);

    // movimento aleatório
    let dx = (Math.random() - 0.5) * 2;
    let dy = (Math.random() - 0.5) * 2;

    function animate(){
      let x = parseFloat(el.style.left);
      let y = parseFloat(el.style.top);
      if (isNaN(x) || isNaN(y)) return;

      x += dx; y += dy;

      // colisão com bordas
      if (x < 0 || x > W-2*r) dx *= -1;
      if (y < 0 || y > H-2*r) dy *= -1;

      el.style.left = Math.max(0, Math.min(W-2*r, x)) + 'px';
      el.style.top  = Math.max(0, Math.min(H-2*r, y)) + 'px';

      requestAnimationFrame(animate);
    }
    animate();
  });
}

async function refresh(){
  try {
    const picks = await fetchPicks();
    renderSummary(picks);
    mountBubbles(picks);
  } catch(e){
    console.error(e);
    const box = $('#last-update');
    if (box) box.textContent = 'Erro ao carregar';
  }
}

$('#btn-refresh')?.addEventListener('click', refresh);
window.addEventListener('load', refresh);
