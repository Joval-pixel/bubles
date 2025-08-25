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
    const r = 40;
    const el = document.createElement('div');
    el.className = 'bubble';
    el.style.width = el.style.height = `${r*2}px`;
    el.style.background = 'rgba(46,204,113,0.7)';
    el.style.position = 'absolute';
    el.style.left = (Math.random()*(W-2*r))+'px';
    el.style.top  = (Math.random()*(H-2*r))+'px';
    el.style.display='flex';
    el.style.alignItems='center';
    el.style.justifyContent='center';
    el.style.color='#fff';
    el.innerHTML = p.selection;

    stage.appendChild(el);
  });
}

async function refresh(){
  try {
    const picks = await fetchPicks();
    renderSummary(picks);
    mountBubbles(picks);
  } catch(e){
    console.error(e);
    if ($('#last-update')) $('#last-update').textContent = 'Erro ao carregar';
  }
}

$('#btn-refresh')?.addEventListener('click', refresh);
window.addEventListener('load', refresh);
