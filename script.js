(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  const dateInput = $('#dateInput');
  const reloadBtn = $('#reloadBtn');
  const statusEl = $('#status');
  const bubblesEl = $('#bubbles');

  // Data padrão = hoje (UTC ISO yyyy-mm-dd)
  const todayISO = new Date().toISOString().slice(0,10);
  dateInput.value = todayISO;

  reloadBtn.addEventListener('click', load);

  window.addEventListener('DOMContentLoaded', () => {
    console.log('DOM pronto');
    load();
  });

  async function load() {
    const date = dateInput.value || todayISO;
    statusEl.textContent = 'Carregando…';
    bubblesEl.innerHTML = '';

    try {
      const res = await fetch(`/api/footy?date=${date}`);
      const json = await res.json();

      // Espera um array "matches" com odds -> probabilidade
      const matches = json?.matches ?? [];

      if (!Array.isArray(matches) || matches.length === 0) {
        statusEl.textContent = 'Sem jogos hoje (ou sem API KEY).';
        return;
      }

      // Ordenar por maior probabilidade (para bolha maior/verde)
      matches.sort((a,b) => (b.bestProb ?? 0) - (a.bestProb ?? 0));

      for (const m of matches) {
        const card = renderBubble(m);
        bubblesEl.appendChild(card);
      }

      statusEl.textContent = `${matches.length} jogo(s) encontrado(s). Clique numa bolha para ver detalhes.`;
    } catch (err) {
      console.error(err);
      statusEl.textContent = 'Erro ao carregar jogos.';
    }
  }

  function renderBubble(m) {
    const div = document.createElement('article');
    div.className = 'bubble-card';

    const title = `${m.home?.name ?? '—'} vs ${m.away?.name ?? '—'}`;
    const when = new Date(m.kickoff ?? Date.now()).toLocaleString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const prob = Math.round((m.bestProb ?? 0) * 100);
    const size = scale(prob, 0, 100, 80, 160); // px
    const cls = prob >= 60 ? 'green' : 'gray';
    const pick = m.bestPick ?? '—';

    div.innerHTML = `
      <div class="bubble-head">
        <div>${title}</div>
        <div class="bubble-sub">${when}</div>
      </div>
      <div class="circle ${cls}" style="--size:${size}px">${prob}%</div>
      <div class="bubble-sub">Palpite: <strong>${pick}</strong></div>
    `;

    // clique abre resumo /api/history
    div.addEventListener('click', async () => {
      const homeId = m.home?.id, awayId = m.away?.id;
      if (!homeId || !awayId) return;
      try {
        const r = await fetch(`/api/history?home=${homeId}&away=${awayId}`);
        const j = await r.json();
        alert([
          `Últimos jogos (casa): W${j.home?.W} D${j.home?.D} L${j.home?.L}`,
          `Últimos jogos (fora): W${j.away?.W} D${j.away?.D} L${j.away?.L}`,
          `H2H: casa ${j.h2h?.homeW} x empates ${j.h2h?.draws} x fora ${j.h2h?.awayW}`
        ].join('\n'));
      } catch(e) {
        alert('Sem histórico disponível.');
      }
    });

    return div;
  }

  function scale(v, inMin, inMax, outMin, outMax) {
    const t = Math.max(inMin, Math.min(inMax, v));
    return outMin + (outMax - outMin) * ((t - inMin) / (inMax - inMin));
  }
})();