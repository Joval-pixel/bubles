(function () {
  const elStatus = document.querySelector("#status");
  const elStage = document.querySelector("#stage");
  const elTooltip = document.querySelector("#tooltip");
  const elList = document.querySelector("#fixtures");
  const elPick = document.querySelector("#picks");
  const form = document.querySelector("#filters");
  const btn = document.querySelector("#btnLoad");
  const tabs = document.querySelectorAll(".tab");

  // -------- helpers --------
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmtDT = (iso) => new Date(iso).toLocaleString();
  function setStatus(msg){ if (elStatus) elStatus.textContent = msg || ""; }

  async function getJSON(url){
    const r = await fetch(url);
    let data=null; try{ data = await r.json(); }catch(_){}
    if(!r.ok){ const e=new Error(`HTTP ${r.status}`); e.data=data; throw e; }
    return data;
  }

  function parsePercent(v){
    if(typeof v !== "string") return NaN;
    return Number(v.replace("%","").trim());
  }

  function buildFootyQuery(){
    const fd = new FormData(form);
    const q = new URLSearchParams();
    const next = +(fd.get("next") || 20);
    q.set("next", clamp(next, 1, 40));
    const league = fd.get("league"); if (league) q.set("league", league);
    const season = fd.get("season"); if (season) q.set("season", season);
    const date = fd.get("date"); if (date) q.set("date", date);
    if (fd.get("live")) q.set("live","all");
    return q.toString();
  }

  // -------- dados + bolhas --------
  let bubbles = []; // {el,x,y,vx,vy,r,fixtureId,label,time,color,pct,homeCode,awayCode}

  async function loadAll(){
    try{
      setStatus("Carregando jogos…");
      btn.disabled = true;
      elStage.innerHTML = "";
      elList.innerHTML = "";
      elPick.innerHTML = "";

      const fixturesData = await getJSON(`/api/footy?${buildFootyQuery()}`);
      const fixtures = (fixturesData?.response || []).filter(f => f?.fixture && f?.teams?.home && f?.teams?.away);

      if(!fixtures.length){ setStatus("Nenhum jogo para os filtros."); return; }

      // Monta lista textual (lado direito)
      const frag = document.createDocumentFragment();
      fixtures.forEach(f => {
        const { id, date, venue } = f.fixture;
        const li = document.createElement("li");
        li.className = "item";
        li.innerHTML = `
          <div>
            <div><strong>${f.teams.home.name} x ${f.teams.away.name}</strong></div>
            <small>${f.league?.name || ""} • ${venue?.name || ""} • ${fmtDT(date)}</small>
          </div>`;
        li.addEventListener("click", () => loadPick(id, `${f.teams.home.name} x ${f.teams.away.name}`, fmtDT(date), f.league?.name));
        frag.appendChild(li);
      });
      elList.appendChild(frag);

      // Busca previsões com concorrência limitada para evitar rate limit
      setStatus("Calculando previsões…");
      const picks = await fetchPredictionsWithLimit(fixtures.map(f => f.fixture.id), 4);

      // Monta bolhas
      const stageRect = elStage.getBoundingClientRect();
      const W = stageRect.width, H = stageRect.height;
      bubbles = [];

      fixtures.forEach((f, idx) => {
        const p = picks.get(f.fixture.id) || null;
        const perHome = parsePercent(p?.predictions?.percent?.home);
        const perDraw = parsePercent(p?.predictions?.percent?.draw);
        const perAway = parsePercent(p?.predictions?.percent?.away);

        // fallback: se a API não devolver percentuais, assume 33/33/33
        const ph = isNaN(perHome) ? 33 : perHome;
        const pd = isNaN(perDraw) ? 34 : perDraw;
        const pa = isNaN(perAway) ? 33 : perAway;

        let color = "b-gray";
        let conf = pd; // empate por padrão
        let code = "DRAW";

        if (ph >= pa && ph >= pd){ color = "b-green"; conf = ph; code = "HOME"; }
        else if (pa >= ph && pa >= pd){ color = "b-red"; conf = pa; code = "AWAY"; }

        // raio proporcional à confiança (mín 26, máx 92)
        const r = Math.round(26 + (conf/100) * 66);

        const label = `${shortTeam(f.teams.home.name)} x ${shortTeam(f.teams.away.name)}`;
        const time = fmtDT(f.fixture.date);

        // posição inicial aleatória (evita bordas)
        const x = 40 + Math.random() * (W - 80);
        const y = 40 + Math.random() * (H - 80);
        const vx = (Math.random() * 0.8 - 0.4) * 0.6;
        const vy = (Math.random() * 0.8 - 0.4) * 0.6;

        const el = document.createElement("div");
        el.className = `bubble ${color} glow`;
        el.style.width = el.style.height = `${r*2}px`;
        el.style.left = `${x - r}px`;
        el.style.top = `${y - r}px`;
        el.innerHTML = `<div class="label"><span class="code">${label}</span><span class="pct">${conf.toFixed(0)}%</span></div>`;

        // tooltip
        el.addEventListener("mousemove", (ev) => showTip(ev.clientX, ev.clientY, tooltipText(f, conf, code)));
        el.addEventListener("mouseleave", hideTip);

        // click -> abre previsões detalhadas
        el.addEventListener("click", () => loadPick(f.fixture.id, `${f.teams.home.name} x ${f.teams.away.name}`, time, f.league?.name));

        elStage.appendChild(el);

        bubbles.push({ el, x, y, vx, vy, r, W, H });
      });

      setStatus("");
      startPhysics();

    }catch(e){
      console.error(e);
      setStatus("Erro ao carregar dados. Tente novamente.");
    }finally{
      btn.disabled = false;
    }
  }

  function shortTeam(name){
    // reduz nomes longos para caber na bolha
    return name.replace(/Clube de Regatas|Futebol Clube|Sociedade Esportiva|Associação|Esporte Clube/gi,"")
               .replace(/\s+/g," ").trim().slice(0,16);
  }

  function tooltipText(f, conf, code){
    const home = f.teams.home.name;
    const away = f.teams.away.name;
    const fav = code==="HOME" ? home : code==="AWAY" ? away : "Empate";
    return `${home} x ${away} — favorito: ${fav} (${conf.toFixed(0)}%)`;
  }

  function showTip(cx, cy, text){
    elTooltip.textContent = text;
    elTooltip.hidden = false;
    const { left, top } = elStage.getBoundingClientRect();
    elTooltip.style.left = `${cx - left}px`;
    elTooltip.style.top  = `${cy - top - 10}px`;
  }
  function hideTip(){ elTooltip.hidden = true; }

  async function fetchPredictionsWithLimit(ids, limit=4){
    const out = new Map();
    let i=0;
    async function worker(){
      while(i < ids.length){
        const my = i++;
        const id = ids[my];
        try{
          const d = await getJSON(`/api/picks?fixture=${id}`);
          out.set(id, d?.response?.[0] || null);
          // pequeno delay para aliviar rate limit
          await new Promise(r => setTimeout(r, 120));
        }catch(e){
          out.set(id, null);
        }
      }
    }
    const workers = Array.from({length:limit}, worker);
    await Promise.all(workers);
    return out;
  }

  // -------- física simples de bolhas --------
  let raf = null;
  function step(){
    const W = elStage.clientWidth;
    const H = elStage.clientHeight;

    for (let b of bubbles){
      // move
      b.x += b.vx;
      b.y += b.vy;

      // paredes
      if (b.x - b.r < 2){ b.x = b.r + 2; b.vx *= -1; }
      if (b.x + b.r > W-2){ b.x = W - b.r - 2; b.vx *= -1; }
      if (b.y - b.r < 2){ b.y = b.r + 2; b.vy *= -1; }
      if (b.y + b.r > H-2){ b.y = H - b.r - 2; b.vy *= -1; }

      // atrito leve
      b.vx *= 0.998;
      b.vy *= 0.998;
    }

    // colisões elásticas simples
    for (let i=0;i<bubbles.length;i++){
      for (let j=i+1;j<bubbles.length;j++){
        const a = bubbles[i], c = bubbles[j];
        const dx = c.x - a.x, dy = c.y - a.y;
        const dist = Math.hypot(dx, dy);
        const min = a.r + c.r + 2;
        if (dist < min){
          const nx = dx / (dist || 1), ny = dy / (dist || 1);
          const overlap = (min - dist) * 0.5;
          a.x -= nx * overlap; a.y -= ny * overlap;
          c.x += nx * overlap; c.y += ny * overlap;

          // troca componentes de velocidade no eixo de colisão (simples)
          const dvx = c.vx - a.vx, dvy = c.vy - a.vy;
          const p = dvx*nx + dvy*ny;
          if (p < 0){
            a.vx += p*nx; a.vy += p*ny;
            c.vx -= p*nx; c.vy -= p*ny;
          }
        }
      }
    }

    // aplica no DOM
    for (let b of bubbles){
      b.el.style.transform = `translate(${(b.x - b.r)|0}px, ${(b.y - b.r)|0}px)`;
    }

    raf = requestAnimationFrame(step);
  }
  function startPhysics(){ if (raf) cancelAnimationFrame(raf); raf = requestAnimationFrame(step); }

  // -------- previsões detalhadas --------
  async function loadPick(fixtureId, label, time, leagueName){
    try{
      setStatus(`Buscando previsões para ${label}…`);
      const data = await getJSON(`/api/picks?fixture=${fixtureId}`);
      const r = data?.response?.[0];
      const p = r?.predictions || {};
      const h2h = r?.h2h || [];

      elPick.innerHTML = `
        <div class="side-card" style="background:transparent;border:0;padding:0;">
          <h3 style="margin:0 0 6px 0">${label}</h3>
          <p><small>${leagueName || ""} • ${time}</small></p>
          <p><b>Vencedor provável:</b> ${p?.winner?.name || "—"}</p>
          <p><b>Probabilidades (H/D/A):</b> ${p?.percent?.home || "—"} / ${p?.percent?.draw || "—"} / ${p?.percent?.away || "—"}</p>
          <p><b>Ambas marcam:</b> ${p?.both_teams_to_score || "—"}</p>
          <p><b>Gols esperados:</b> ${p?.goals?.home ?? "—"} — ${p?.goals?.away ?? "—"}</p>
          <p><b>Conselho do modelo:</b> ${p?.advice || "—"}</p>
          <details>
            <summary>Últimos confrontos (H2H)</summary>
            <div style="margin-top:6px">
              ${h2h.slice(0,6).map(m=>{
                const h=m?.teams?.home?.name||"Casa", a=m?.teams?.away?.name||"Fora";
                const gh=m?.goals?.home??"-", ga=m?.goals?.away??"-";
                const d=m?.fixture?.date?new Date(m.fixture.date).toLocaleDateString():"";
                return `<div><small>${d} — ${h} ${gh} x ${ga} ${a}</small></div>`;
              }).join("") || "<small>Sem registros recentes.</small>"}
            </div>
          </details>
        </div>
      `;
      setStatus("");
    }catch(e){
      console.error(e);
      elPick.innerHTML = `<p class="err">Não foi possível obter previsões agora.</p>`;
      setStatus("");
    }
  }

  // -------- abas (bolhas/lista) --------
  tabs.forEach(t=>{
    t.addEventListener("click", ()=>{
      tabs.forEach(x=>x.classList.remove("active"));
      t.classList.add("active");
      const view=t.dataset.view;
      if(view==="lista"){
        document.querySelector(".stage-wrap").style.display="none";
        document.querySelector(".side .side-card:nth-child(2)").style.display="block";
      }else{
        document.querySelector(".stage-wrap").style.display="block";
        document.querySelector(".side .side-card:nth-child(2)").style.display="none";
      }
    });
  });
  // inicia mostrando bolhas e escondendo lista
  document.querySelector(".side .side-card:nth-child(2)").style.display="none";

  // -------- auto refresh --------
  let timer=null;
  function startAuto(){
    if(timer) clearInterval(timer);
    timer=setInterval(loadAll, 60000);
  }

  form.addEventListener("submit", (ev)=>{ ev.preventDefault(); loadAll(); startAuto(); });

  // primeira carga
  loadAll();
  startAuto();

  // ajuste de layout ao redimensionar
  new ResizeObserver(()=>{ /* recalcular limites */ }).observe(elStage);

})();
