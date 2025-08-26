/* ==========================
   HOME ENXUTA: só bolhas
   ========================== */

const statusEl = document.getElementById("status");
const board    = document.getElementById("bubbleBoard");

window.addEventListener("load", loadAndRender);

function todayISO(){
  const d = new Date(), off = d.getTimezoneOffset();
  return new Date(d - off*60000).toISOString().slice(0,10);
}

async function loadAndRender(){
  const date = todayISO();
  setStatus("Carregando jogos do dia…");
  try{
    const r = await fetch(`/api/footy?date=${date}`, { cache:"no-store" });
    const data = await r.json();

    let matches = (data?.matches || []).map(m => {
      const base = compactMatch(m);
      const pop  = popularityScore(m.home, m.away, m.leagueName, m.leagueCountry);
      return { ...base, pop, score: 0.5*base.bestProb + 0.5*pop };
    }).sort((a,b)=> b.score - a.score);

    // define um mínimo de área para acomodar as bolhas
    const rows = Math.ceil(Math.max(1, matches.length)/8);
    board.style.minHeight = `${Math.max(560, rows*190)}px`;

    renderBubbles(matches);
    setStatus(`Jogos: ${matches.length} • Fonte: ${(data?.source||"api").toUpperCase()}`);
  }catch(e){
    console.error(e);
    setStatus("Erro ao carregar.");
  }
}

function setStatus(t){ if(statusEl) statusEl.textContent = t; }

/* ============== transformação dos dados ============== */
function compactMatch(m){
  const id = m.fixtureId ?? Math.random();
  const label = m.label || `${m.home} vs ${m.away}`;
  let bestLabel="—", bestProb=.5;

  const x12 = m?.odds?.["1x2"];
  if (x12 && (x12.home||x12.draw||x12.away)){
    const hp=oddToProb(x12.home), dp=oddToProb(x12.draw), ap=oddToProb(x12.away);
    const s=(hp+dp+ap)||1; const nH=hp/s, nD=dp/s, nA=ap/s;
    bestProb = Math.max(nH,nD,nA);
    bestLabel = bestProb===nH?"Casa":bestProb===nA?"Fora":"Empate";
  } else {
    const ou=m?.odds?.["over_under_2_5"];
    if (ou&&(ou.over||ou.under)){
      const op=oddToProb(ou.over), up=oddToProb(ou.under);
      const s=(op+up)||1; const nO=op/s, nU=up/s;
      bestProb=Math.max(nO,nU); bestLabel = bestProb===nO?"Over 2.5":"Under 2.5";
    }
  }

  return {
    id, label, league: m.league, kickoff: m.kickoff,
    home:m.home, away:m.away, homeId:m.homeId, awayId:m.awayId,
    homeLogo:m.homeLogo, awayLogo:m.awayLogo,
    leagueName:m.leagueName, leagueCountry:m.leagueCountry,
    bestProb, bestLabel
  };
}
function oddToProb(o){ const n=Number(o); return (n&&n>0)?1/n:0; }

/* ========= popularidade (define tamanho das bolhas) ========= */
const POP_TEAMS={
 "Flamengo":1,"Palmeiras":1,"Corinthians":0.95,"São Paulo":0.95,"Santos":0.9,"Vasco":0.9,
 "Grêmio":0.88,"Internacional":0.88,"Atlético Mineiro":0.9,"Cruzeiro":0.88,"Fluminense":0.9,
 "Real Madrid":1,"Barcelona":1,"Atlético Madrid":0.92,"Manchester City":1,"Manchester United":1,
 "Liverpool":1,"Chelsea":0.95,"Arsenal":0.98,"Tottenham":0.9,"Bayern Munich":1,"Borussia Dortmund":0.95,
 "Paris Saint-Germain":1,"Marseille":0.85,"Juventus":0.98,"Inter":0.98,"Milan":0.98,"Benfica":0.9,
 "Porto":0.9,"Sporting CP":0.88
};
const POP_LEAGUES={
 "Serie A":0.9,"Brasileirão":0.9,"Brazil":0.9,"Premier League":1,"England":1,"La Liga":0.95,"Spain":0.95,
 "Bundesliga":0.93,"Germany":0.93,"Ligue 1":0.9,"France":0.9,"Serie A (ITA)":0.94,"Italy":0.94,
 "Primeira Liga":0.86,"Portugal":0.86,"CONMEBOL":0.9
};
function popularityScore(home, away, leagueName="", leagueCountry=""){
  const t1=POP_TEAMS[home]??0.5, t2=POP_TEAMS[away]??0.5; const teamAvg=(t1+t2)/2;
  const l1=POP_LEAGUES[leagueName]??0, l2=POP_LEAGUES[leagueCountry]??0; const leagueW=Math.max(l1,l2,0.5);
  return Math.max(0, Math.min(1, 0.6*teamAvg + 0.4*leagueW));
}

/* ====================== renderização das bolhas ====================== */
function renderBubbles(items){
  board.innerHTML="";
  const W=board.clientWidth, H=board.clientHeight;
  const scores=items.map(i=>i.score); const sMin=Math.min(...scores), sMax=Math.max(...scores);
  const minSize=70, maxSize=230, pad=6;
  const scale=(s)=> (sMax-sMin<1e-6? (minSize+maxSize)/2 : Math.round(minSize + (s-sMin)/(sMax-sMin)*(maxSize-minSize)));
  const placed=[];
  for(const m of items){
    const size=scale(m.score);
    const {left,top}=place(placed,size,W,H,pad);
    placed.push({left,top,size,m});
  }
  for(const b of placed){
    const el=document.createElement("div");
    el.className="bubble";
    el.style.width=el.style.height=`${b.size}px`;
    el.style.left=`${b.left}px`; el.style.top=`${b.top}px`;
    el.style.background=colorForProb(b.m.bestProb);

    const hhmm = b.m.kickoff ? new Date(b.m.kickoff).toLocaleTimeString([], {hour:'2-digit',minute:'2-digit'}) : "--:--";
    el.innerHTML = `
      <img class="logo" src="${b.m.homeLogo||""}" alt="${escapeHTML(b.m.home||"")}" />
      <img class="logo" src="${b.m.awayLogo||""}" alt="${escapeHTML(b.m.away||"")}" />
      <div>
        <div class="pct">${Math.round(b.m.bestProb*100)}%</div>
        <small class="label">${escapeHTML(b.m.label)}</small>
        <small>${hhmm}</small>
      </div>`;
    el.onclick = () => showModal(b.m);
    board.appendChild(el);
  }
}
function place(list, size, W, H, pad){
  for(let t=0;t<700;t++){
    const left = randInt(pad, Math.max(pad, W-size-pad));
    const top  = randInt(pad, Math.max(pad, H-size-pad));
    if(!list.some(it=>Math.hypot((left+size/2)-(it.left+it.size/2),(top+size/2)-(it.top+it.size/2)) < (size/2+it.size/2+pad)))
      return {left,top};
  }
  return {left:pad,top:pad};
}
function colorForProb(p){
  const t=Math.max(0,Math.min(1,p)); let r,g,b;
  if(t<=.5){const k=t/.5;r=lerp(231,241,k);g=lerp(76,196,k);b=lerp(60,15,k);}
  else {const k=(t-.5)/.5;r=lerp(241,46,k);g=lerp(196,204,k);b=lerp(15,113,k);}
  return `rgb(${r|0},${g|0},${b|0})`;
}
function lerp(a,b,t){return a+(b-a)*t}
function randInt(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function escapeHTML(s){return String(s||"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}

/* ========================= modal com análise ========================= */
async function showModal(m){
  const modal=document.createElement("div");
  modal.className="modal";
  modal.innerHTML=`
    <div class="modal-content">
      <h2>${escapeHTML(m.home)} vs ${escapeHTML(m.away)}</h2>
      <p><b>Data:</b> ${m.kickoff?new Date(m.kickoff).toLocaleString():""}</p>
      <p><b>Palpite:</b> ${escapeHTML(m.bestLabel)} (${Math.round(m.bestProb*100)}%)</p>
      <div id="analysis">Carregando análise (últimos 10 jogos)…</div>
      <button class="close">Fechar</button>
    </div>`;
  modal.querySelector(".close").onclick=()=>modal.remove();
  modal.onclick=(e)=>{ if(e.target===modal) modal.remove(); };
  document.body.appendChild(modal);

  try{
    const r = await fetch(`/api/history?home=${m.homeId}&away=${m.awayId}`, { cache:"no-store" });
    const d = await r.json();
    const h = d?.home||{}, a = d?.away||{}, z = d?.h2h||{};
    modal.querySelector("#analysis").innerHTML = `
      <div class="grid">
        <div><h3>${escapeHTML(m.home)}</h3>
          <p>${h.games||0} jogos: <b>${h.W||0}V ${h.D||0}E ${h.L||0}D</b></p>
          <p>Média gols: ${h.goalsForAvg??"-"} / ${h.goalsAgstAvg??"-"}</p>
          <p>Win rate: <b>${Math.round((h.winRate||0)*100)}%</b></p>
        </div>
        <div><h3>${escapeHTML(m.away)}</h3>
          <p>${a.games||0} jogos: <b>${a.W||0}V ${a.D||0}E ${a.L||0}D</b></p>
          <p>Média gols: ${a.goalsForAvg??"-"} / ${a.goalsAgstAvg??"-"}</p>
          <p>Win rate: <b>${Math.round((a.winRate||0)*100)}%</b></p>
        </div>
        <div><h3>H2H (últimos ${z.games||0})</h3>
          <p>Vitórias ${escapeHTML(m.home)}: <b>${z.homeW||0}</b></p>
          <p>Empates: <b>${z.draws||0}</b></p>
          <p>Vitórias ${escapeHTML(m.away)}: <b>${z.awayW||0}</b></p>
        </div>
      </div>`;
  }catch(e){
    modal.querySelector("#analysis").textContent = "Não foi possível carregar a análise (limite/erro da API).";
  }
}