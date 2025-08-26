// --- início enxuto: só bolhas + status ---
const statusEl  = document.getElementById("status");
const board     = document.getElementById("bubbleBoard");
const listEl    = document.getElementById("matchList"); // ok se não existir

window.addEventListener("load", loadAndRender);

function todayISO() {
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

    // ajusta altura conforme quantidade
    const rows = Math.ceil(matches.length / 8);
    board.style.minHeight = `${Math.max(560, rows*190)}px`;

    renderBubbles(matches);
    setStatus(`Jogos: ${matches.length} • Fonte: ${(data?.source||"api").toUpperCase()}`);
  }catch(e){
    console.error(e);
    setStatus("Erro ao carregar.");
  }
}

function setStatus(t){ if(statusEl) statusEl.textContent = t; }
// --- daqui pra baixo deixe tudo igual ao que já estava: compactMatch, popularityScore, renderBubbles, etc. ---