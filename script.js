(function () {
  const elStatus = document.querySelector("#status");
  const elList = document.querySelector("#fixtures");
  const elPick = document.querySelector("#picks");
  const form = document.querySelector("#filters");
  const btn = document.querySelector("#btnLoad");

  // Util
  function setStatus(msg) { if (elStatus) elStatus.textContent = msg || ""; }
  const fmtDT = (iso) => new Date(iso).toLocaleString();

  async function getJSON(url) {
    const r = await fetch(url);
    // tenta ler json mesmo em erro para mostrar detalhe
    let data = null;
    try { data = await r.json(); } catch (_) {}
    if (!r.ok) {
      const err = new Error(`HTTP ${r.status}`);
      err.data = data;
      throw err;
    }
    return data;
  }

  // Monta query da /api/footy a partir do form
  function buildQuery() {
    const fd = new FormData(form);
    const q = new URLSearchParams();
    const next = +(fd.get("next") || 20);
    if (next) q.set("next", Math.min(Math.max(next, 1), 50));
    const league = fd.get("league"); if (league) q.set("league", league);
    const season = fd.get("season"); if (season) q.set("season", season);
    const date = fd.get("date"); if (date) q.set("date", date);
    if (fd.get("live")) q.set("live", "all");
    return q.toString();
  }

  async function loadFixtures() {
    try {
      setStatus("Carregando jogos…");
      btn.disabled = true;
      elList.innerHTML = "";
      elPick.innerHTML = "";

      const query = buildQuery();
      const data = await getJSON(`/api/footy${query ? "?" + query : ""}`);

      const fixtures = (data?.response || [])
        .map(x => x && x.fixture ? x : null)
        .filter(Boolean);

      if (!fixtures.length) {
        setStatus("Nenhum jogo encontrado para os filtros.");
        return;
      }

      setStatus("");
      const frag = document.createDocumentFragment();

      fixtures.forEach(item => {
        const { id, date, venue, status } = item.fixture;
        const home = item.teams?.home;
        const away = item.teams?.away;
        const league = item.league;

        const li = document.createElement("li");
        li.className = "item";
        li.innerHTML = `
          <span class="flag">${league?.flag ? `<img src="${league.flag}" alt="flag">` : ""}</span>
          <div style="flex:1 1 auto;">
            <div class="teams">${home?.name || "Casa"} x ${away?.name || "Fora"}</div>
            <small>${league?.name || ""} • ${venue?.name || ""} • ${fmtDT(date)} • ${status?.long || ""}</small>
          </div>
        `;
        li.addEventListener("click", () => loadPick(id, `${home?.name || "Casa"} x ${away?.name || "Fora"}`, fmtDT(date), league?.name));
        frag.appendChild(li);
      });

      elList.appendChild(frag);

    } catch (e) {
      console.error(e);
      setStatus(`Erro ao carregar jogos. ${e?.data?.message || ""}`);
      // Fallback simples
      elList.innerHTML = `<li class="item"><div>Sem dados no momento. Tente novamente em 1 minuto.</div></li>`;
    } finally {
      btn.disabled = false;
    }
  }

  async function loadPick(fixtureId, label, time, leagueName) {
    try {
      setStatus(`Buscando previsões para ${label}…`);
      elPick.innerHTML = "";

      const data = await getJSON(`/api/picks?fixture=${fixtureId}`);
      const r = data?.response?.[0];

      const pred = r?.predictions || {};
      const compare = r?.h2h || [];

      const card = document.createElement("div");
      card.className = "card";
      card.innerHTML = `
        <h3>${label}</h3>
        <p><small>${leagueName || ""} • ${time}</small></p>

        <p><b>Vencedor provável:</b> ${pred?.winner?.name || "—"}</p>
        <p><b>Probabilidades (H/D/A):</b> ${pred?.percent?.home || "—"} / ${pred?.percent?.draw || "—"} / ${pred?.percent?.away || "—"}</p>
        <p><b>Ambas marcam:</b> <span class="pill ${/yes/i.test(pred?.both_teams_to_score||"") ? "yes" : "no"}">${pred?.both_teams_to_score || "—"}</span></p>
        <p><b>Gols esperados:</b> ${pred?.goals?.home ?? "—"} — ${pred?.goals?.away ?? "—"}</p>
        <p><b>Conselho do modelo:</b> ${pred?.advice || "—"}</p>

        <details>
          <summary>Histórico (H2H)</summary>
          <div>${compare.slice(0, 5).map(m => {
            const h = m?.teams?.home?.name || "Casa";
            const a = m?.teams?.away?.name || "Fora";
            const gh = m?.goals?.home ?? "-";
            const ga = m?.goals?.away ?? "-";
            const d  = m?.fixture?.date ? new Date(m.fixture.date).toLocaleDateString() : "";
            return `<div><small>${d} — ${h} ${gh} x ${ga} ${a}</small></div>`;
          }).join("") || "<small>Sem registros recentes.</small>"}</div>
        </details>
      `;

      elPick.appendChild(card);
      setStatus("");

    } catch (e) {
      console.error(e);
      setStatus("Erro ao carregar previsões.");
      elPick.innerHTML = `<p class="err">Não foi possível obter picks para este jogo agora. Tente novamente mais tarde.</p>`;
    }
  }

  // auto-refresh suave a cada 60s (respeita cache s-maxage da Vercel)
  let timer = null;
  function startAutoRefresh(){
    if (timer) clearInterval(timer);
    timer = setInterval(loadFixtures, 60000);
  }

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    loadFixtures();
    startAutoRefresh();
  });

  // primeira carga
  loadFixtures();
  startAutoRefresh();
})();
