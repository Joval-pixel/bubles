async function fetchPicks() {
  const r = await fetch('/api/picks', { cache: 'no-store' });
  if (!r.ok) throw new Error('Falha ao buscar /api/picks');
  return r.json();
}

function renderPicks(list) {
  const box = document.getElementById('picks-today');
  if (!box) return;

  if (!Array.isArray(list) || list.length === 0) {
    box.innerHTML = '<p>Sem palpites publicados para hoje.</p>';
    return;
  }

  const html = list.map(p => `
    <div class="pick">
      <div><strong>${p.game}</strong> — <em>${p.league}${p.country ? ' ('+p.country+')' : ''}</em></div>
      <div>${p.datetime_brt ? 'Data/Hora (BRT): '+p.datetime_brt : ''}</div>
      <div>Mercado: <b>${p.market}</b> | Seleção: <b>${p.selection}</b></div>
      <div>
        Odds: ${
          p.market === 'OU25'
            ? `Over ${p.odds_over ?? '-'} / Under ${p.odds_under ?? '-'}`
            : `Home ${p.odds_home ?? '-'} / Draw ${p.odds_draw ?? '-'} / Away ${p.odds_away ?? '-'}`
        }
      </div>
      ${p.analysis_pt ? `<div style="margin-top:6px">${p.analysis_pt}</div>` : ''}
      ${p.option1 ? `<div style="margin-top:6px">Opção 1: <b>${p.option1}</b> — ${p.reason1 || ''}</div>` : ''}
      ${p.option2 ? `<div>Opção 2: <b>${p.option2}</b> — ${p.reason2 || ''}</div>` : ''}
      <hr/>
    </div>
  `).join('');

  box.innerHTML = html;
}

async function refresh() {
  const stamp = document.getElementById('last-update');
  try {
    stamp.textContent = 'Atualizando...';
    const picks = await fetchPicks();
    stamp.textContent = `Atualizado: ${new Date().toLocaleTimeString('pt-BR')} — ${picks.length} palpites`;
    renderPicks(picks);
  } catch (e) {
    stamp.textContent = 'Erro ao carregar palpites';
    document.getElementById('picks-today').innerHTML =
      `<p style="color:#f55">Erro: ${e.message}</p>`;
  }
}

document.getElementById('btn-refresh')?.addEventListener('click', refresh);
window.addEventListener('load', refresh);
