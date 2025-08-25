// =========================
// BUBLES Palpites - script
// =========================

const $ = (s) => document.querySelector(s);
const stage = $("#bubble-stage");

// -------------------------
// util
// -------------------------
async function fetchPicks() {
  const r = await fetch("/api/picks", { cache: "no-store" });
  if (!r.ok) throw new Error("Falha ao buscar /api/picks");
  return r.json();
}

function renderSummary(list) {
  const box = $("#last-update");
  if (box)
    box.textContent = `Atualizado: ${new Date().toLocaleTimeString(
      "pt-BR"
    )} — ${list.length} palpites`;
}

function colorFor(p) {
  // cor por mercado/seleção (ajuste como preferir)
  const conf = Math.max(0, Math.min(1, p.confidence ?? 0.6));
  const alpha = 0.6 + conf * 0.35;

  if ((p.market || "").toUpperCase() === "OU25") {
    return (p.selection || "").toUpperCase() === "OVER"
      ? `rgba(46,204,113,${alpha})` // verde
      : `rgba(231,76,60,${alpha})`; // vermelho
  }

  const sel = (p.selection || "").toUpperCase();
  if (sel === "HOME") return `rgba(46,204,113,${alpha})`; // verde
  if (sel === "AWAY") return `rgba(52,152,219,${alpha})`; // azul
  return `rgba(241,196,15,${alpha})`; // DRAW = amarelo
}

function radiusFor(p) {
  // 40–110px conforme confiança + nº de casas (bookmakers)
  const c = Math.max(0, Math.min(1, p.confidence ?? 0.6));
  const bk = Math.min(30, Math.max(5, p.bookmakers ?? 10));
  const base = 40 + c * 60;
  return Math.round(base + (bk - 10) * 1.0);
}

// -------------------------
// montagem das bolhas
// -------------------------
function mountBubbles(data) {
  if (!stage) return;
  stage.innerHTML = "";

  const W = stage.clientWidth || 700;
  const H = stage.clientHeight || 480;

  // tooltip flutuante
  const tip = document.createElement("div");
  tip.className = "tooltip";
  tip.style.display = "none";
  stage.appendChild(tip);

  // detalhes ao clicar
  const details = $("#details");

  // cria nós com posição/velocidade
  const nodes = data.map((p) => {
    const r = radiusFor(p);
    const x = Math.random() * (W - 2 * r) + r;
    const y = Math.random() * (H - 2 * r) + r;

    const el = document.createElement("div");
    el.className = "bubble";
    el.style.width = el.style.height = `${r * 2}px`;
    el.style.background = colorFor(p);
    el.style.left = `${x - r}px`;
    el.style.top = `${y - r}px`;
    el.innerHTML = `
      <div style="padding:6px;text-align:center;line-height:1.1">
        ${p.game?.split(" vs. ")[0] ?? "—"}
        <br><small>${(p.selection || "").toUpperCase()} ${(p.market || "").toUpperCase()}</small>
      </div>
    `;

    // tooltip no hover
    el.addEventListener("mousemove", (ev) => {
      tip.style.display = "block";
      tip.style.left = ev.pageX + 12 - stage.getBoundingClientRect().left + "px";
      tip.style.top = ev.pageY + 12 - stage.getBoundingClientRect().top + "px";
      tip.innerHTML = `
        <b>${p.game ?? ""}</b><br>
        <small>${[p.league, p.country].filter(Boolean).join(" — ")}</small><br>
        Mercado: <b>${p.market ?? "-"}</b> • Seleção: <b>${p.selection ?? "-"}</b><br>
        Odds: ${
          (p.market || "").toUpperCase() === "OU25"
            ? `Over ${p.odds_over ?? "-"} / Under ${p.odds_under ?? "-"}`
            : `H ${p.odds_home ?? "-"} / D ${p.odds_draw ?? "-"} / A ${p.odds_away ?? "-"}`
        }<br>
        Confiança: ${(p.confidence ?? 0).toFixed(2)}
      `;
    });
    el.addEventListener("mouseleave", () => {
      tip.style.display = "none";
    });

    // clique → painel de detalhes
    el.addEventListener("click", () => {
      if (!details) return;
      details.classList.add("show");
      details.innerHTML = `
        <div style="font-size:18px;font-weight:700">${p.game ?? ""}</div>
        <div style="opacity:.85">${[p.league, p.country].filter(Boolean).join(" — ")}</div>
        <div style="margin-top:6px">Data/Hora (BRT): ${p.datetime_brt ?? "-"}</div>
        <div>Mercado: <b>${p.market ?? "-"}</b> | Seleção: <b>${p.selection ?? "-"}</b></div>
        <div>Odds: ${
          (p.market || "").toUpperCase() === "OU25"
            ? `Over ${p.odds_over ?? "-"} / Under ${p.odds_under ?? "-"}`
            : `Home ${p.odds_home ?? "-"} / Draw ${p.odds_draw ?? "-"} / Away ${p.odds_away ?? "-"}`
        }</div>
        ${p.analysis_pt ? `<hr><div>${p.analysis_pt}</div>` : ""}
        ${p.option1 ? `<div style="margin-top:6px">Opção 1: <b>${p.option1}</b> — ${p.reason1 || ""}</div>` : ""}
        ${p.option2 ? `<div>Opção 2: <b>${p.option2}</b> — ${p.reason2 || ""}</div>` : ""}
      `;
      // rola a página até os detalhes no mobile
      details.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    stage.appendChild(el);

    // velocidade inicial aleatória
    return {
      el,
      r,
      x,
      y,
      vx: (Math.random() - 0.5) * 1.6,
      vy: (Math.random() - 0.5) * 1.6,
    };
  });

  // animação simples com rebote
  function tick() {
    for (const n of nodes) {
      n.x += n.vx;
      n.y += n.vy;

      // colisão com paredes (usando centro/raio)
      if (n.x - n.r < 0) {
        n.x = n.r;
        n.vx *= -1;
      } else if (n.x + n.r > W) {
        n.x = W - n.r;
        n.vx *= -1;
      }
      if (n.y - n.r < 0) {
        n.y = n.r;
        n.vy *= -1;
      } else if (n.y + n.r > H) {
        n.y = H - n.r;
        n.vy *= -1;
      }

      // atualização de posição (converte centro -> left/top)
      n.el.style.left = n.x - n.r + "px";
      n.el.style.top = n.y - n.r + "px";
    }
    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}

// -------------------------
// fluxo
// -------------------------
async function refresh() {
  try {
    $("#last-update").textContent = "Atualizando...";
    const picks = await fetchPicks();
    renderSummary(picks);
    mountBubbles(picks);
  } catch (e) {
    console.error(e);
    const box = $("#last-update");
    if (box) box.textContent = "Erro ao carregar";
  }
}

$("#btn-refresh")?.addEventListener("click", refresh);
window.addEventListener("load", refresh);
window.addEventListener("resize", () => {
  // re-render em resize para recalcular W/H e centralizar as bolhas
  refresh();
});
