import React, { useEffect, useMemo, useRef, useState } from "react";

const WIDGET_SPORTS = [
  { key: "football", label: "Football" },
  { key: "basketball", label: "Basketball" },
  { key: "baseball", label: "Baseball" },
  { key: "hockey", label: "Hockey" },
  { key: "rugby", label: "Rugby" },
  { key: "volleyball", label: "Volleyball" },
  { key: "handball", label: "Handball" },
];

const SPONSORS = [
  {
    label: "Patrocinador master",
    title: "Espaco premium",
    note: "Topo do radar da Copa 2026",
  },
  {
    label: "Odds parceiras",
    title: "Disponivel",
    note: "Cota principal por jogo",
  },
  {
    label: "Publicidade",
    title: "Cota lateral",
    note: "Marca visivel no mapa",
  },
];

const RADAR_INITIAL_LIMIT = 30;
const VALID_FILTERS = new Set(["best", "live", "goals", "btts"]);
const VALID_MODES = new Set(["today", "worldcup"]);
const VALID_VIEWS = new Set(["radar", "list"]);
const BRASILIA_TIMEZONE = "America/Sao_Paulo";
const BRASILIA_TIMEZONE_LABEL = "Horario de Brasilia";
const ROUTE_DEFAULTS = {
  "/": { mode: "today", filter: "best", view: "radar" },
  "/palpites-de-hoje": { mode: "today", filter: "best", view: "radar" },
  "/jogos-ao-vivo": { mode: "today", filter: "live", view: "radar" },
  "/lista-jogos-hoje": { mode: "today", filter: "best", view: "list" },
  "/palpites-gols": { mode: "today", filter: "goals", view: "radar" },
  "/ambas-marcam": { mode: "today", filter: "btts", view: "radar" },
  "/copa-2026": { mode: "worldcup", filter: "best", view: "radar" },
};

const getInitialSearchParam = (name, fallback) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  return new URLSearchParams(window.location.search).get(name) || fallback;
};

const getInitialRouteValue = (name, fallback) => {
  if (typeof window === "undefined") {
    return fallback;
  }

  const queryValue = new URLSearchParams(window.location.search).get(name);

  if (queryValue) {
    return queryValue;
  }

  const pathname = window.location.pathname.replace(/\/$/, "") || "/";
  return ROUTE_DEFAULTS[pathname]?.[name] || fallback;
};

function BublesLogo() {
  return (
    <span className="bubles-wordmark" aria-label="Bubles">
      <span className="logo-blue">B</span>
      <span className="logo-yellow">u</span>
      <span className="logo-green">b</span>
      <span className="logo-white">l</span>
      <span className="logo-blue">e</span>
      <span className="logo-yellow">s</span>
    </span>
  );
}

function AiHitLogo({ state = "pending", compact = false }) {
  const symbol = state === "miss" ? "X" : "V";

  return (
    <span
      aria-hidden="true"
      className={compact ? `ai-hit-logo is-${state} is-compact` : `ai-hit-logo is-${state}`}
    >
      {symbol}
    </span>
  );
}

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const formatChance = (value) => `${Math.round((value || 0) * 100)}%`;
const getPredictionChance = (game) =>
  clamp(Number(game?.displayProbability ?? game?.probability ?? 0), 0, 1);
const formatOdd = (value) =>
  value && Number.isFinite(value) && value > 0 ? value.toFixed(2).replace(".", ",") : "--";
const formatClock = (game) => {
  if (game?.isLive) {
    return `${Math.max(1, Math.round(game.minute || 1))}'`;
  }

  if (game?.isFinished) {
    return "FT";
  }

  return "PRE";
};

const hasScoreLine = (game) => {
  const score = String(game?.scoreLine || "").trim();
  return Boolean(score && score !== "Pre-jogo");
};

const formatScoreLine = (game) => {
  if (hasScoreLine(game)) {
    return game.scoreLine;
  }

  if (game?.isLive) {
    return "-- x --";
  }

  return "Pre-jogo";
};

const formatKickoff = (value) =>
  value
    ? new Date(value).toLocaleString("pt-BR", {
        timeZone: BRASILIA_TIMEZONE,
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--";

const formatKickoffTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString("pt-BR", {
        timeZone: BRASILIA_TIMEZONE,
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--";

const formatBrasiliaUpdateTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString("pt-BR", {
        timeZone: BRASILIA_TIMEZONE,
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      })
    : "--";

const getKickoffStamp = (game) => {
  const stamp = new Date(game?.commenceTime || "").getTime();
  return Number.isFinite(stamp) ? stamp : Number.MAX_SAFE_INTEGER;
};

const getGameStatusLabel = (game) => {
  if (game?.isLive) {
    return `Ao vivo ${formatClock(game)}`;
  }

  if (game?.isFinished) {
    return "Encerrado";
  }

  return "Pre-jogo";
};

const formatScoreContext = (game) => {
  if (game?.isLive) {
    return `Online agora, ${formatClock(game)}`;
  }

  if (game?.isFinished) {
    return "Resultado final";
  }

  return `Comeca em ${formatKickoff(game?.commenceTime)}`;
};

const translateBetText = (value) => {
  const text = String(value || "").trim();

  if (!text) {
    return "--";
  }

  return text
    .replace(
      /Nao combina ambas marcam com mais de 2\.5 gols/gi,
      "Evitar: ambos marcam + mais de 2,5 gols"
    )
    .replace(
      /Nao: ambas marcam \+ mais de 2[,.]5 gols/gi,
      "Evitar: ambos marcam + mais de 2,5 gols"
    )
    .replace(/Ambas marcam e mais de 2\.5 gols/gi, "Ambos marcam + mais de 2,5 gols")
    .replace(/Ambas marcam \+ mais de 2[,.]5 gols/gi, "Ambos marcam + mais de 2,5 gols")
    .replace(/vence e ambas nao marcam/gi, "vence e ambas NAO marcam")
    .replace(/\bMatch Winner\b/gi, "Resultado final")
    .replace(/\bWinner\b/gi, "Vencedor")
    .replace(/\bDouble Chance\b/gi, "Dupla chance")
    .replace(/\bBoth Teams To Score\b/gi, "Ambas marcam")
    .replace(/\bClean Sheet\b/gi, "Sem sofrer gol")
    .replace(/\bOver\b/gi, "Mais de")
    .replace(/\bUnder\b/gi, "Menos de")
    .replace(/\bYes\b/gi, "Sim")
    .replace(/\bNo\b/gi, "Nao")
    .replace(/\bDraw\b/gi, "Empate")
    .replace(/\bHome\b/gi, "Mandante")
    .replace(/\bAway\b/gi, "Visitante")
    .replace(/\bGoals\b/gi, "Gols")
    .replace(/\bOdd\b/gi, "Impar")
    .replace(/\bEven\b/gi, "Par");
};

const getBetHelpText = (value) => {
  const text = translateBetText(value).toLowerCase();

  if (
    (text.includes("evitar") || text.includes("nao deve acontecer")) &&
    (text.includes("ambos marcam") || text.includes("dois times marcam")) &&
    text.includes("+2,5")
  ) {
    return "Leitura simples: a IA nao recomenda essa combinada. Para bater, os dois times teriam que marcar e o jogo ter 3 gols ou mais.";
  }

  if ((text.includes("ambos marcam") || text.includes("dois times marcam")) && text.includes("+2,5")) {
    return "Para bater, os dois times precisam marcar e o jogo precisa ter 3 gols ou mais.";
  }

  if (text.includes("ambas marcam") || text.includes("dois times marcam")) {
    return "Para bater, mandante e visitante precisam fazer pelo menos 1 gol cada.";
  }

  if (text.includes("dupla chance")) {
    return "Para bater, voce tem dois resultados a favor: vitoria de um lado ou empate.";
  }

  if (text.includes("mais de")) {
    return "Para bater, o jogo precisa passar da linha de gols indicada.";
  }

  if (text.includes("menos de")) {
    return "Para bater, o jogo precisa terminar abaixo da linha de gols indicada.";
  }

  return "";
};

const getBeforeColon = (value, fallback = "--") => {
  const text = String(value || "").trim();

  if (!text) {
    return fallback;
  }

  return text.split(":")[0] || fallback;
};

const getBubbleMainLabel = (game) => {
  const pick = String(game?.displayPickLabel || game?.pickLabel || "").toLowerCase();
  const home = String(game?.homeTeam || "");
  const away = String(game?.awayTeam || "");

  if (home && pick.includes(home.toLowerCase())) {
    return home;
  }

  if (away && pick.includes(away.toLowerCase())) {
    return away;
  }

  if (pick.includes("empate") || pick.includes("draw")) {
    return "Empate";
  }

  return home || game?.game || "Jogo";
};

const parseScore = (game) => {
  const match = String(game?.scoreLine || "").match(/(\d+)\s*x\s*(\d+)/i);

  if (!match) {
    return null;
  }

  return {
    home: Number(match[1]),
    away: Number(match[2]),
  };
};

const getLineValue = (text) => {
  const match = String(text || "").replace(",", ".").match(/(\d+(?:\.\d+)?)/);
  return match ? Number(match[1]) : null;
};

const getAiHitState = (game) => {
  const score = parseScore(game);

  if (!game?.isFinished || !score) {
    return {
      state: "pending",
      label: "Em validacao",
      note: "O jogo ainda nao terminou para confirmar o palpite.",
    };
  }

  const homeWon = score.home > score.away;
  const awayWon = score.away > score.home;
  const draw = score.home === score.away;
  const totalGoals = score.home + score.away;
  const pickCode = String(game?.pickCode || "").toUpperCase();
  const pickText = `${game?.displayPickLabel || ""} ${game?.pickLabel || ""}`.toLowerCase();
  const homeText = String(game?.homeTeam || "").toLowerCase();
  const awayText = String(game?.awayTeam || "").toLowerCase();
  const hasHome = Boolean(homeText && pickText.includes(homeText));
  const hasAway = Boolean(awayText && pickText.includes(awayText));
  const hasDraw = pickText.includes("empate") || pickText.includes("draw");
  const isHomeOrDraw =
    pickCode === "1X" ||
    pickText.includes("1x") ||
    pickText.includes("mandante ou empate") ||
    pickText.includes("casa ou empate") ||
    (hasHome && hasDraw);
  const isAwayOrDraw =
    pickCode === "X2" ||
    pickText.includes("x2") ||
    pickText.includes("visitante ou empate") ||
    pickText.includes("fora ou empate") ||
    (hasAway && hasDraw);
  const isNoDraw =
    pickCode === "12" ||
    pickText.includes("12") ||
    pickText.includes("sem empate") ||
    pickText.includes("sem draw");
  let hit = null;

  if (isHomeOrDraw) {
    hit = homeWon || draw;
  } else if (isAwayOrDraw) {
    hit = awayWon || draw;
  } else if (isNoDraw) {
    hit = !draw;
  } else if (pickText.includes("ambas") || pickText.includes("both teams")) {
    hit = pickText.includes("nao") || pickText.includes("no")
      ? !(score.home > 0 && score.away > 0)
      : score.home > 0 && score.away > 0;
  } else if (pickText.includes("mais de") || pickText.includes("over")) {
    const line = getLineValue(pickText);
    hit = line === null ? null : totalGoals > line;
  } else if (pickText.includes("menos de") || pickText.includes("under")) {
    const line = getLineValue(pickText);
    hit = line === null ? null : totalGoals < line;
  } else if (pickCode === "1" || hasHome) {
    hit = homeWon;
  } else if (pickCode === "2" || hasAway) {
    hit = awayWon;
  } else if (pickCode === "X" || hasDraw) {
    hit = draw;
  }

  if (hit === null) {
    return {
      state: "pending",
      label: "Sem conferencia",
      note: "Este mercado precisa de dados extras para confirmar o acerto.",
    };
  }

  return hit
    ? {
        state: "hit",
        label: "IA acertou",
        note: "O resultado final bateu com a leitura principal.",
      }
    : {
        state: "miss",
        label: "IA errou!",
        note: "O resultado final nao confirmou o palpite principal.",
      };
};

const getTier = (probability) => {
  if (probability >= 0.45) {
    return "high";
  }

  return "low";
};

const EDGE_PADDING = 10;
const COLLISION_GAP = 12;
const COLLISION_PASSES = 14;
const COLLISION_PUSH = 0.72;
const DRIFT_INTERVAL_MS = 180;
const FRAME_STEP_LIMIT = 0.12;
const VELOCITY_LIMIT = 0.0022;
const BOUNCE_DAMPING = 0.74;
const COLLISION_DAMPING = 0.28;
const DEFAULT_BUBBLE_SCALE = "small";
const MOBILE_BOARD_WIDTH = 520;
const MOBILE_VELOCITY_LIMIT = 0.012;

const isMobileBounds = (bounds = {}) => (bounds.width || 0) > 0 && bounds.width <= MOBILE_BOARD_WIDTH;

const getCrowdFactor = (total = 0) => {
  if (total >= 110) {
    return 0.54;
  }

  if (total >= 80) {
    return 0.62;
  }

  if (total >= 55) {
    return 0.72;
  }

  if (total >= 32) {
    return 0.78;
  }

  if (total >= 24) {
    return 0.84;
  }

  return 1;
};

const limitVelocity = (value) => clamp(value, -VELOCITY_LIMIT, VELOCITY_LIMIT);
const limitMobileVelocity = (value) => clamp(value, -MOBILE_VELOCITY_LIMIT, MOBILE_VELOCITY_LIMIT);

const getInitialVelocity = (index, axis) => {
  const direction = axis === "x" ? (index % 2 ? 1 : -1) : (index % 3 ? 1 : -1);
  const base = axis === "x" ? 0.001 : 0.0008;
  const spread = axis === "x" ? (index % 7) * 0.00016 : (index % 5) * 0.00014;

  return limitVelocity(direction * (base + spread));
};

const getMobileVelocity = (index, axis) => {
  const direction = axis === "x" ? (index % 2 ? 1 : -1) : (index % 3 ? 1 : -1);
  const base = axis === "x" ? 0.0045 : 0.0035;
  const spread = axis === "x" ? (index % 5) * 0.0007 : (index % 4) * 0.00055;

  return limitMobileVelocity(direction * (base + spread));
};

const getGridMetrics = (total = 0, bounds = {}) => {
  const width = Math.max(bounds.width || 0, 320);
  const height = Math.max(bounds.height || 0, 560);
  const mobile = isMobileBounds(bounds);

  if (!mobile && total < 24) {
    return null;
  }

  const columns = mobile ? (width <= 380 ? 3 : 4) : width >= 1500 ? 7 : width >= 1200 ? 6 : width >= 920 ? 5 : 4;
  const rows = Math.max(1, Math.ceil(total / columns));
  const topOffset = mobile ? 108 : 92;
  const minSlotHeight = mobile ? 88 : 112;
  const layoutHeight = Math.max(height, topOffset + rows * minSlotHeight + EDGE_PADDING * 2);
  const slotWidth = (width - EDGE_PADDING * 2) / columns;
  const usableHeight = Math.max(rows * minSlotHeight, layoutHeight - topOffset - EDGE_PADDING * 2);
  const slotHeight = usableHeight / rows;
  const maxSize = Math.max(mobile ? 42 : 56, Math.min(slotWidth, slotHeight) - (mobile ? 20 : 28));

  return {
    columns,
    layoutHeight,
    maxSize,
    mobile,
    rows,
    slotHeight,
    slotWidth,
    topOffset,
    width,
  };
};

const getDisplaySize = (probability, scale, total = 0, bounds = {}) => {
  const crowdFactor = getCrowdFactor(total);
  const boardWidth = bounds.width || 1280;
  const boardFactor = boardWidth <= 420 ? 0.62 : boardWidth <= 760 ? 0.72 : boardWidth <= 1024 ? 0.86 : 1;
  const base = (48 + clamp(probability || 0.33, 0.05, 0.9) * 170) * crowdFactor * boardFactor;
  const metrics = getGridMetrics(total, bounds);
  const gridMaxSize = metrics?.maxSize || Number.POSITIVE_INFINITY;

  if (scale === "large") {
    return clamp(
      base * 1.1,
      boardWidth <= MOBILE_BOARD_WIDTH ? 46 : 58,
      Math.min(boardWidth <= MOBILE_BOARD_WIDTH ? 74 : 238, gridMaxSize)
    );
  }

  if (scale === "small") {
    return clamp(
      base * 0.78,
      boardWidth <= MOBILE_BOARD_WIDTH ? 38 : 42,
      Math.min(boardWidth <= MOBILE_BOARD_WIDTH ? 68 : 150, gridMaxSize)
    );
  }

  return clamp(
    base * 0.92,
    boardWidth <= MOBILE_BOARD_WIDTH ? 42 : 50,
    Math.min(boardWidth <= MOBILE_BOARD_WIDTH ? 72 : 198, gridMaxSize)
  );
};

const getInitialPosition = (index, total, bounds, size) => {
  const width = Math.max(bounds.width || 0, 320);
  const height = Math.max(bounds.height || 0, 560);
  const metrics = getGridMetrics(total, bounds);

  if (metrics) {
    const column = index % metrics.columns;
    const row = Math.floor(index / metrics.columns);
    const jitterX = metrics.mobile ? 0 : ((index % 3) - 1) * Math.min(10, metrics.slotWidth * 0.04);
    const jitterY = metrics.mobile ? 0 : (((index + 1) % 3) - 1) * Math.min(8, metrics.slotHeight * 0.05);
    const x = EDGE_PADDING + column * metrics.slotWidth + Math.max(0, (metrics.slotWidth - size) / 2) + jitterX;
    const y = metrics.topOffset + row * metrics.slotHeight + Math.max(0, (metrics.slotHeight - size) / 2) + jitterY;

    return {
      x: clamp(x, EDGE_PADDING, width - size - EDGE_PADDING),
      y: clamp(y, EDGE_PADDING, metrics.layoutHeight - size - EDGE_PADDING),
    };
  }

  const angle = index * 2.399963229728653;
  const orbit = Math.sqrt(index + 1) * (width > 900 ? 68 : width > 520 ? 44 : 30);
  const centerX = width / 2;
  const centerY = height / 2;
  const x = centerX + Math.cos(angle) * orbit * (width > 520 ? 1.68 : 1.08) - size / 2;
  const y = centerY + Math.sin(angle) * orbit * (width > 520 ? 1.08 : 1.28) - size / 2;

  return {
    x: clamp(x, 18, width - size - 18),
    y: clamp(y, 18, height - size - 18),
  };
};

const createBubble = (game, existing, bounds, index, total, scale) => {
  const size = getDisplaySize(game.bubbleValue ?? game.probability, scale, total, bounds);
  const mobile = isMobileBounds(bounds);
  const anchoredLayout = Boolean(getGridMetrics(total, bounds));
  const initialPosition = getInitialPosition(index, total, bounds, size);
  const position = anchoredLayout || mobile ? initialPosition : existing ?? initialPosition;

  return {
    ...game,
    anchorX: initialPosition.x,
    anchorY: initialPosition.y,
    anchoredLayout,
    size,
    radius: size / 2,
    tier: getTier(game.bubbleValue ?? game.probability),
    x: position.x,
    y: position.y,
    vx: mobile
      ? existing?.vx
        ? limitMobileVelocity(existing.vx)
        : getMobileVelocity(index, "x")
      : existing?.vx
        ? limitVelocity(existing.vx)
        : getInitialVelocity(index, "x"),
    vy: mobile
      ? existing?.vy
        ? limitMobileVelocity(existing.vy)
        : getMobileVelocity(index, "y")
      : existing?.vy
        ? limitVelocity(existing.vy)
        : getInitialVelocity(index, "y"),
  };
};

const resolveBubbleCollisions = (items, bounds, mobile = false) => {
  const width = Math.max(bounds.width || 0, 320);
  const height = Math.max(bounds.height || 0, 560);
  const next = items.map((item) => ({ ...item }));
  const limitCurrentVelocity = mobile ? limitMobileVelocity : limitVelocity;
  const impulse = mobile ? 0 : 0.00005;

  for (let pass = 0; pass < COLLISION_PASSES; pass += 1) {
    for (let index = 0; index < next.length; index += 1) {
      for (let compare = index + 1; compare < next.length; compare += 1) {
        const first = next[index];
        const second = next[compare];
        const dx = first.x + first.radius - (second.x + second.radius);
        const dy = first.y + first.radius - (second.y + second.radius);
        const distance = Math.hypot(dx, dy) || 1;
        const minDistance = first.radius + second.radius + COLLISION_GAP;

        if (distance >= minDistance) {
          continue;
        }

        const overlap = (minDistance - distance) * COLLISION_PUSH;
        const normalX = dx / distance;
        const normalY = dy / distance;
        const radiusTotal = first.radius + second.radius || 1;
        const firstPush = second.radius / radiusTotal;
        const secondPush = first.radius / radiusTotal;

        first.x = clamp(
          first.x + normalX * overlap * firstPush,
          EDGE_PADDING,
          width - first.size - EDGE_PADDING
        );
        first.y = clamp(
          first.y + normalY * overlap * firstPush,
          EDGE_PADDING,
          height - first.size - EDGE_PADDING
        );
        second.x = clamp(
          second.x - normalX * overlap * secondPush,
          EDGE_PADDING,
          width - second.size - EDGE_PADDING
        );
        second.y = clamp(
          second.y - normalY * overlap * secondPush,
          EDGE_PADDING,
          height - second.size - EDGE_PADDING
        );

        first.vx = limitCurrentVelocity((first.vx + normalX * impulse) * COLLISION_DAMPING);
        first.vy = limitCurrentVelocity((first.vy + normalY * impulse) * COLLISION_DAMPING);
        second.vx = limitCurrentVelocity((second.vx - normalX * impulse) * COLLISION_DAMPING);
        second.vy = limitCurrentVelocity((second.vy - normalY * impulse) * COLLISION_DAMPING);
      }
    }
  }

  return next;
};

const constrainBubbleToAnchor = (bubble, bounds, mobile = false) => {
  if (!bubble.anchoredLayout || !Number.isFinite(bubble.anchorX) || !Number.isFinite(bubble.anchorY)) {
    return bubble;
  }

  const width = Math.max(bounds.width || 0, 320);
  const height = Math.max(bounds.height || 0, bubble.anchorY + bubble.size + EDGE_PADDING);
  const drift = mobile ? 4 : Math.max(6, Math.min(12, bubble.size * 0.08));
  const minX = clamp(bubble.anchorX - drift, EDGE_PADDING, width - bubble.size - EDGE_PADDING);
  const maxX = clamp(bubble.anchorX + drift, EDGE_PADDING, width - bubble.size - EDGE_PADDING);
  const minY = clamp(bubble.anchorY - drift, EDGE_PADDING, height - bubble.size - EDGE_PADDING);
  const maxY = clamp(bubble.anchorY + drift, EDGE_PADDING, height - bubble.size - EDGE_PADDING);

  if (bubble.x <= minX || bubble.x >= maxX) {
    bubble.vx = (mobile ? limitMobileVelocity : limitVelocity)(bubble.vx * -0.6);
    bubble.x = clamp(bubble.x, Math.min(minX, maxX), Math.max(minX, maxX));
  }

  if (bubble.y <= minY || bubble.y >= maxY) {
    bubble.vy = (mobile ? limitMobileVelocity : limitVelocity)(bubble.vy * -0.6);
    bubble.y = clamp(bubble.y, Math.min(minY, maxY), Math.max(minY, maxY));
  }

  return bubble;
};

const moveBubbles = (items, bounds, step = 1) => {
  const width = Math.max(bounds.width || 0, 320);
  const height = Math.max(bounds.height || 0, 560);

  if (isMobileBounds(bounds)) {
    const safeStep = clamp(step, 0, 0.08);

    const next = items.map((item) => {
      const next = {
        ...item,
        x: item.x + limitMobileVelocity(item.vx) * safeStep,
        y: item.y + limitMobileVelocity(item.vy) * safeStep,
        vx: limitMobileVelocity(item.vx),
        vy: limitMobileVelocity(item.vy),
      };

      if (next.x <= EDGE_PADDING || next.x >= width - next.size - EDGE_PADDING) {
        next.vx = limitMobileVelocity(next.vx * -0.72);
        next.x = clamp(next.x, EDGE_PADDING, width - next.size - EDGE_PADDING);
      }

      if (next.y <= EDGE_PADDING || next.y >= height - next.size - EDGE_PADDING) {
        next.vy = limitMobileVelocity(next.vy * -0.72);
        next.y = clamp(next.y, EDGE_PADDING, height - next.size - EDGE_PADDING);
      }

      return constrainBubbleToAnchor(next, bounds, true);
    });

    return next.some((item) => item.anchoredLayout) ? next : resolveBubbleCollisions(next, bounds, true);
  }

  const safeStep = clamp(step, 0, FRAME_STEP_LIMIT);
  const next = items.map((item) => {
    const bubble = {
      ...item,
      x: item.x + item.vx * safeStep,
      y: item.y + item.vy * safeStep,
    };

    if (bubble.x <= EDGE_PADDING || bubble.x >= width - bubble.size - EDGE_PADDING) {
      bubble.vx = limitVelocity(bubble.vx * -BOUNCE_DAMPING);
      bubble.x = clamp(bubble.x, EDGE_PADDING, width - bubble.size - EDGE_PADDING);
    }

    if (bubble.y <= EDGE_PADDING || bubble.y >= height - bubble.size - EDGE_PADDING) {
      bubble.vy = limitVelocity(bubble.vy * -BOUNCE_DAMPING);
      bubble.y = clamp(bubble.y, EDGE_PADDING, height - bubble.size - EDGE_PADDING);
    }

    return constrainBubbleToAnchor(bubble, bounds);
  });

  return next.some((item) => item.anchoredLayout) ? next : resolveBubbleCollisions(next, bounds);
};

const getAiSummary = (game) => {
  if (game?.aiInsights?.headline) {
    return game.aiInsights.headline;
  }

  const leader = game?.marketOptions?.[0];
  const second = game?.marketOptions?.[1];
  const gap = Math.max(0, (leader?.probability || 0) - (second?.probability || 0));

  if (!leader) {
    return "Sem leitura completa ainda";
  }

  if (game?.confidence === "estimate") {
    return `Modelo visual favorece ${leader.label}`;
  }

  if (gap >= 0.16) {
    return `Mercado forte para ${leader.label}`;
  }

  return `Jogo competitivo, leve vantagem para ${leader.label}`;
};

const getAiScoreNumber = (game) => Number(game?.aiInsights?.score || 0);

const findMarketByCategory = (game, category) =>
  (game?.betMarkets || []).find((market) => market?.category === category && market?.leader);

const findBttsMarket = (game) =>
  (game?.betMarkets || []).find((market) => {
    const name = `${market?.name || ""} ${market?.leader?.label || ""}`.toLowerCase();
    return market?.leader && (name.includes("ambas") || name.includes("both teams"));
  });

const getBestMarket = (game) =>
  [...(game?.betMarkets || [])]
    .filter((market) => market?.leader)
    .sort(
      (left, right) =>
        (right.leader?.probability || 0) - (left.leader?.probability || 0) ||
        (right.confidence || 0) - (left.confidence || 0)
    )[0];

const getDisplayMarket = (game, activeFilter) => {
  if (activeFilter === "goals") {
    const market = findMarketByCategory(game, "Gols");
    return market?.leader
      ? {
          category: "Gols",
          name: market.name,
          label: market.leader.label,
          probability: market.leader.probability,
          odd: market.leader.odd,
        }
      : null;
  }

  if (activeFilter === "btts") {
    const market = findBttsMarket(game);
    return market?.leader
      ? {
          category: "Ambas marcam",
          name: market.name,
          label: market.leader.label,
          probability: market.leader.probability,
          odd: market.leader.odd,
        }
      : null;
  }

  if (activeFilter === "best") {
    const market = getBestMarket(game);

    if (market?.leader) {
      return {
        category: market.category || "Principal",
        name: market.name || "Melhor palpite",
        label: market.leader.label,
        probability: market.leader.probability,
        odd: market.leader.odd,
      };
    }
  }

  return {
    category: "Principal",
    name: "Melhor palpite",
    label: game?.pickLabel || "Palpite principal",
    probability: game?.probability || 0,
    odd: game?.oddHome || 0,
  };
};

const withDisplayMarket = (game, activeFilter) => {
  const market = getDisplayMarket(game, activeFilter);

  if (!market) {
    return null;
  }

  return {
    ...game,
    displayMarketCategory: market.category,
    displayMarketName: market.name,
    displayPickLabel: market.label,
    displayProbability: market.probability,
    displayOdd: market.odd,
  };
};

const getFilterTitle = (activeFilter, mode) => {
  if (activeFilter === "live") {
    return "Jogos ao vivo";
  }

  if (activeFilter === "goals") {
    return "Palpites de gols";
  }

  if (activeFilter === "btts") {
    return "Ambas marcam";
  }

  if (mode === "worldcup") {
    return "Melhores da Copa 2026";
  }

  return "Melhores palpites de hoje";
};

const getFilterSubtitle = (activeFilter) => {
  if (activeFilter === "best") {
    return "Poucas bolhas, melhores oportunidades primeiro.";
  }

  if (activeFilter === "live") {
    return "Somente jogos em andamento agora.";
  }

  if (activeFilter === "goals") {
    return "Mercados de gols mais faceis de conferir.";
  }

  if (activeFilter === "btts") {
    return "Jogos em que ambas marcam merece atencao.";
  }

  return "Mapa completo do radar.";
};

function WidgetsPage() {
  const [sport, setSport] = useState("football");
  const [widgetsReady, setWidgetsReady] = useState(false);
  const widgetKey = import.meta.env.VITE_API_FOOTBALL_WIDGET_KEY || "";
  const canRenderWidgets = Boolean(widgetKey && widgetsReady);

  useEffect(() => {
    let cancelled = false;

    const markReady = () => {
      if (!cancelled) {
        setWidgetsReady(true);
      }
    };

    if (typeof window === "undefined" || !window.customElements) {
      markReady();
      return () => {
        cancelled = true;
      };
    }

    if (window.customElements.get("api-sports-widget")) {
      markReady();
      return () => {
        cancelled = true;
      };
    }

    window.customElements.whenDefined("api-sports-widget").then(markReady).catch(markReady);

    const fallback = window.setTimeout(markReady, 2600);

    return () => {
      cancelled = true;
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div className="widgets-page">
      <header className="widgets-toolbar">
        <a className="widgets-brand" href="/">
          <BublesLogo />
        </a>

        <nav className="widgets-sports" aria-label="Esportes">
          {WIDGET_SPORTS.map((item) => (
            <button
              key={item.key}
              type="button"
              className={sport === item.key ? "chip-button is-active" : "chip-button"}
              onClick={() => setSport(item.key)}
            >
              {item.label}
            </button>
          ))}
        </nav>

        <a className="chip-link" href="/">
          Voltar ao radar
        </a>
      </header>

      {!widgetKey ? (
        <div className="widgets-warning">
          Configure <strong>VITE_API_FOOTBALL_WIDGET_KEY</strong> no Vercel para carregar os
          widgets oficiais.
        </div>
      ) : null}

      {widgetKey && !widgetsReady ? (
        <div className="widgets-warning">
          Carregando widgets oficiais da API-SPORTS...
        </div>
      ) : null}

      {canRenderWidgets ? (
        <api-sports-widget
          key={`config-${sport}`}
          data-type="config"
          data-sport={sport}
          data-key={widgetKey}
          data-lang="en"
          data-theme="grey"
          data-show-errors="true"
          data-show-logos="true"
          data-refresh="20"
          data-favorite="true"
          data-standings="true"
          data-tab="games"
          data-game-tab="statistics"
          data-target-league="#games-list"
          data-target-team="#team-content"
          data-target-game="#game-content"
          data-target-standings="#standings-content"
        />
      ) : null}

      <main className="widgets-grid">
        <section className="widgets-panel widgets-leagues">
          {canRenderWidgets ? (
            <api-sports-widget key={`leagues-${sport}`} data-type="leagues" data-sport={sport} />
          ) : (
            <div className="widgets-placeholder">Aguardando widgets...</div>
          )}
        </section>
        <section id="games-list" className="widgets-panel widgets-games">
          {canRenderWidgets ? (
            <api-sports-widget key={`games-${sport}`} data-type="games" data-sport={sport} />
          ) : (
            <div className="widgets-placeholder">Aguardando jogos...</div>
          )}
        </section>
        <aside className="widgets-side">
          <section id="standings-content" className="widgets-panel" />
          <section id="team-content" className="widgets-panel" />
          <section id="game-content" className="widgets-panel">
            {canRenderWidgets ? (
              <api-sports-widget key={`game-${sport}`} data-type="game" data-sport={sport} />
            ) : (
              <div className="widgets-placeholder">Selecione um jogo quando carregar.</div>
            )}
          </section>
        </aside>
      </main>
    </div>
  );
}

function BubblesWorldCup() {
  const boardRef = useRef(null);
  const animationRef = useRef(0);
  const lastFrameRef = useRef(0);
  const boundsRef = useRef({ width: 0, height: 0 });
  const [games, setGames] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("");
  const [message, setMessage] = useState("");
  const [debug, setDebug] = useState("");
  const [mode, setMode] = useState(() => {
    const initialMode = getInitialRouteValue("mode", "today");
    return VALID_MODES.has(initialMode) ? initialMode : "today";
  });
  const [filter, setFilter] = useState(() => {
    const initialFilter = getInitialRouteValue("filter", "best");
    return VALID_FILTERS.has(initialFilter) ? initialFilter : "best";
  });
  const [viewMode, setViewMode] = useState(() => {
    const initialView = getInitialRouteValue("view", "radar");
    return VALID_VIEWS.has(initialView) ? initialView : "radar";
  });
  const [radarLimit, setRadarLimit] = useState(RADAR_INITIAL_LIMIT);
  const [query, setQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [hoveredId, setHoveredId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTodayListOpen, setIsTodayListOpen] = useState(false);

  const openGameModal = (id) => {
    setSelectedId(id);
    setIsModalOpen(true);
  };

  const closeGameModal = () => {
    setIsModalOpen(false);
  };

  const openTodayList = () => {
    if (mode !== "today") {
      setMode("today");
      setFilter("best");
    }

    setIsTodayListOpen(true);
  };

  useEffect(() => {
    const syncBounds = () => {
      if (!boardRef.current) {
        return;
      }

      const rect = boardRef.current.getBoundingClientRect();
      boundsRef.current = {
        width: rect.width,
        height: rect.height,
      };
    };

    syncBounds();
    window.addEventListener("resize", syncBounds);

    return () => {
      window.removeEventListener("resize", syncBounds);
    };
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchGames = async (silent = false) => {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      try {
        const response = await fetch(`/api/games?mode=${mode}`, { cache: "no-store" });
        const payload = await response.json();
        const items = Array.isArray(payload?.games) ? payload.games : [];

        if (!mounted) {
          return;
        }

        setUpdatedAt(payload?.updatedAt || "");
        setMessage(payload?.message || "");
        setDebug(payload?.debug || "");
        setGames((current) => {
          const currentMap = new Map(current.map((item) => [item.id, item]));
          return moveBubbles(
            items.map((item, index) =>
              createBubble(
                item,
                currentMap.get(item.id),
                boundsRef.current,
                index,
                items.length,
                DEFAULT_BUBBLE_SCALE
              )
            ),
            boundsRef.current,
            0
          );
        });
        setSelectedId((current) =>
          items.some((item) => item.id === current) ? current : items[0]?.id ?? null
        );
      } catch (_error) {
        if (!mounted) {
          return;
        }

        setGames([]);
        setSelectedId(null);
        setMessage(mode === "today" ? "Falha ao carregar jogos de hoje" : "Falha ao carregar a Copa 2026");
        setDebug("Nao foi possivel consultar /api/games");
      } finally {
        if (!mounted) {
          return;
        }

        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchGames(false);
    const refreshMs = mode === "today" ? 60000 : 240000;
    const timer = window.setInterval(() => fetchGames(true), refreshMs);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [mode]);

  useEffect(() => {
    setSelectedId(null);
    setIsModalOpen(false);
  }, [mode]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const url = new URL(window.location.href);
    url.searchParams.set("mode", mode);
    url.searchParams.set("filter", filter);
    url.searchParams.set("view", viewMode);
    window.history.replaceState({}, "", `${url.pathname}${url.search}${url.hash}`);
  }, [filter, mode, viewMode]);

  useEffect(() => {
    setRadarLimit(RADAR_INITIAL_LIMIT);
  }, [filter, mode, query, viewMode]);

  useEffect(() => {
    if (!isModalOpen && !isTodayListOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setIsModalOpen(false);
        setIsTodayListOpen(false);
      }
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen, isTodayListOpen]);

  useEffect(() => {
    if (!games.length) {
      return undefined;
    }

    const animate = (timestamp = 0) => {
      if (!lastFrameRef.current) {
        lastFrameRef.current = timestamp;
      }

      const elapsed = timestamp - lastFrameRef.current;

      if (elapsed >= DRIFT_INTERVAL_MS) {
        const frameStep = elapsed / 16.67;
        setGames((current) => moveBubbles(current, boundsRef.current, frameStep));
        lastFrameRef.current = timestamp;
      }

      animationRef.current = window.requestAnimationFrame(animate);
    };

    lastFrameRef.current = 0;
    animationRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationRef.current);
      lastFrameRef.current = 0;
    };
  }, [games.length]);

  const filteredGames = useMemo(() => {
    const text = query.trim().toLowerCase();
    let items = [...games];

    if (text) {
      items = items.filter((game) =>
        `${game.game} ${game.round} ${game.venue} ${game.city} ${game.homeTeam} ${game.awayTeam} ${game.league} ${game.country}`
          .toLowerCase()
          .includes(text)
      );
    }

    if (filter === "live") {
      items = items.filter((game) => game.isLive);
    }

    items = items
      .map((game) => withDisplayMarket(game, filter))
      .filter(Boolean);

    items.sort(
      (left, right) =>
        Number(right.isLive) - Number(left.isLive) ||
        getAiScoreNumber(right) - getAiScoreNumber(left) ||
        (right.displayProbability || right.probability || 0) -
          (left.displayProbability || left.probability || 0) ||
        new Date(left.commenceTime || 0).getTime() -
          new Date(right.commenceTime || 0).getTime()
    );

    return items;
  }, [filter, games, query]);

  const chronologicalGames = useMemo(() => {
    const text = query.trim().toLowerCase();
    let items = [...games];

    if (text) {
      items = items.filter((game) =>
        `${game.game} ${game.round} ${game.venue} ${game.city} ${game.homeTeam} ${game.awayTeam} ${game.league} ${game.country}`
          .toLowerCase()
          .includes(text)
      );
    }

    if (filter === "live") {
      items = items.filter((game) => game.isLive);
    }

    items = items
      .map((game) => withDisplayMarket(game, filter))
      .filter(Boolean);

    items.sort(
      (left, right) =>
        getKickoffStamp(left) - getKickoffStamp(right) ||
        Number(right.isLive) - Number(left.isLive) ||
        (right.displayProbability || right.probability || 0) -
          (left.displayProbability || left.probability || 0)
    );

    return items;
  }, [filter, games, query]);

  const radarGames = useMemo(
    () => filteredGames.slice(0, radarLimit),
    [filteredGames, radarLimit]
  );

  const searchSuggestions = useMemo(() => {
    const text = query.trim().toLowerCase();

    if (!isSearchFocused || text.length < 2) {
      return [];
    }

    return games
      .filter((game) =>
        `${game.game} ${game.homeTeam} ${game.awayTeam} ${game.league} ${game.country}`
          .toLowerCase()
          .includes(text)
      )
      .slice(0, 6)
      .map((game) => withDisplayMarket(game, "best") || game);
  }, [games, isSearchFocused, query]);

  const selectedGame =
    filteredGames.find((game) => game.id === selectedId) ??
    games.find((game) => game.id === selectedId) ??
    filteredGames[0] ??
    games[0] ??
    null;
  const hoveredGame =
    radarGames.find((game) => game.id === hoveredId) ??
    filteredGames.find((game) => game.id === hoveredId) ??
    null;

  const todayListGames = useMemo(() => {
    if (mode !== "today") {
      return [];
    }

    return [...games].sort(
      (left, right) =>
        getKickoffStamp(left) - getKickoffStamp(right) ||
        Number(right.isLive) - Number(left.isLive) ||
        (right.probability || 0) - (left.probability || 0)
    );
  }, [games, mode]);

  const liveCount = games.filter((game) => game.isLive).length;
  const preCount = games.filter((game) => !game.isLive && !game.isFinished).length;
  const finishedCount = games.filter((game) => game.isFinished).length;
  const todayAiStats = useMemo(() => {
    const stats = todayListGames.reduce(
      (summary, game) => {
        const rowGame = withDisplayMarket(game, "best") || game;
        const hitState = getAiHitState(rowGame);

        if (hitState.state === "hit") {
          summary.hits += 1;
          summary.checked += 1;
        } else if (hitState.state === "miss") {
          summary.misses += 1;
          summary.checked += 1;
        } else {
          summary.pending += 1;
        }

        return summary;
      },
      { checked: 0, hits: 0, misses: 0, pending: 0 }
    );

    return {
      ...stats,
      hitRate: stats.checked ? stats.hits / stats.checked : 0,
      missRate: stats.checked ? stats.misses / stats.checked : 0,
    };
  }, [todayListGames]);
  const topGames = [...filteredGames]
    .sort(
      (left, right) =>
        getAiScoreNumber(right) - getAiScoreNumber(left) ||
        (right.displayProbability || right.probability || 0) -
          (left.displayProbability || left.probability || 0)
    )
    .slice(0, 5);
  const selectedOptions = selectedGame?.marketOptions ?? [];
  const selectedMarkets = selectedGame?.betMarkets ?? [];
  const aiInsights = selectedGame?.aiInsights ?? {};
  const aiWhy = Array.isArray(aiInsights.why) ? aiInsights.why : [];
  const aiChecklist = Array.isArray(aiInsights.checklist) ? aiInsights.checklist : [];
  const aiAvoidIf = Array.isArray(aiInsights.avoidIf) ? aiInsights.avoidIf : [];
  const aiBestMarkets = Array.isArray(aiInsights.bestMarkets) ? aiInsights.bestMarkets : [];
  const selectedHitState = selectedGame ? getAiHitState(selectedGame) : null;
  const topHitState = topGames[0] ? getAiHitState(topGames[0]) : null;
  const boardGamesCount = viewMode === "list" ? chronologicalGames.length : filteredGames.length;

  useEffect(() => {
    if (viewMode !== "radar" || !radarGames.length) {
      return;
    }

    const visibleIds = radarGames.map((game) => game.id);

    setGames((current) =>
      moveBubbles(
        current.map((game) => {
          const visibleIndex = visibleIds.indexOf(game.id);

          if (visibleIndex === -1) {
            return game;
          }

          const size = getDisplaySize(
            game.bubbleValue ?? game.probability,
            DEFAULT_BUBBLE_SCALE,
            visibleIds.length,
            boundsRef.current
          );
          const position = getInitialPosition(visibleIndex, visibleIds.length, boundsRef.current, size);

          return {
            ...game,
            anchorX: position.x,
            anchorY: position.y,
            anchoredLayout: true,
            size,
            radius: size / 2,
            x: position.x,
            y: position.y,
          };
        }),
        boundsRef.current,
        0
      )
    );
  }, [filter, query, radarGames.length, radarLimit, updatedAt, viewMode]);

  return (
    <div className="cup-shell">
      <header className="cup-toolbar">
        <a className="cup-brand" href="/">
          <BublesLogo />
          <strong className="brand-context">PALPITES</strong>
        </a>

        <div className="search-shell">
          <input
            className="cup-search"
            value={query}
            onBlur={() => window.setTimeout(() => setIsSearchFocused(false), 120)}
            onChange={(event) => setQuery(event.target.value)}
            onFocus={() => setIsSearchFocused(true)}
            placeholder="Buscar jogo, time ou campeonato"
            type="search"
          />

          {searchSuggestions.length ? (
            <div className="search-suggestions" role="listbox">
              {searchSuggestions.map((game) => (
                <button
                  className="search-suggestion"
                  key={game.id}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => {
                    setQuery(game.game);
                    setIsSearchFocused(false);
                    openGameModal(game.id);
                  }}
                  type="button"
                >
                  <strong>{game.game}</strong>
                  <span>
                    {getGameStatusLabel(game)} | {translateBetText(game.displayPickLabel || game.pickLabel)} |{" "}
                    {formatChance(game.displayProbability || game.probability)}
                  </span>
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <nav className="cup-controls mode-controls" aria-label="Filtros simples">
          <button
            className={mode === "today" && filter === "best" ? "chip-button is-active" : "chip-button"}
            onClick={() => {
              setMode("today");
              setFilter("best");
            }}
            type="button"
          >
            Melhores
          </button>
          <button
            className={filter === "live" ? "chip-button is-active" : "chip-button"}
            onClick={() => setFilter("live")}
            type="button"
          >
            Ao vivo {liveCount}
          </button>
          <button className="chip-button" onClick={openTodayList} type="button">
            Todos de hoje {mode === "today" ? games.length : ""}
          </button>
          <button
            className={filter === "goals" ? "chip-button is-active" : "chip-button"}
            onClick={() => setFilter("goals")}
            type="button"
          >
            Gols
          </button>
          <button
            className={filter === "btts" ? "chip-button is-active" : "chip-button"}
            onClick={() => setFilter("btts")}
            type="button"
          >
            Ambas marcam
          </button>
          <button
            className={mode === "worldcup" ? "chip-button is-active" : "chip-button"}
            onClick={() => {
              setMode("worldcup");
              setFilter("best");
            }}
            type="button"
          >
            Copa 2026
          </button>
        </nav>

        <nav className="cup-controls view-controls" aria-label="Visualizacao">
          <button
            className={viewMode === "radar" ? "chip-button is-active" : "chip-button"}
            onClick={() => setViewMode("radar")}
            type="button"
          >
            Radar
          </button>
          <button
            className={viewMode === "list" ? "chip-button is-active" : "chip-button"}
            onClick={() => setViewMode("list")}
            type="button"
          >
            Lista
          </button>
        </nav>

        <nav className="cup-controls compact" aria-label="Atalhos">
          <a className="chip-link" href="/widgets">
            Widgets
          </a>
        </nav>
      </header>

      <section className="simple-guide" aria-label="Resumo dos palpites">
        <article className="simple-guide-main">
          <div className="guide-kicker">
            <span>{getFilterTitle(filter, mode)}</span>
            <span className={topHitState ? `ai-hit-badge is-${topHitState.state}` : "ai-hit-badge is-pending"}>
              <AiHitLogo state={topHitState?.state || "pending"} compact />
              Acertos IA
            </span>
          </div>
          <h1>{topGames[0]?.game || "Radar de palpites"}</h1>
          <p>
            {topGames[0]
              ? `${translateBetText(topGames[0].displayPickLabel || topGames[0].pickLabel)} com ${formatChance(
                  topGames[0].displayProbability || topGames[0].probability
                )} de chance.`
              : "Assim que os jogos carregarem, os melhores palpites aparecem primeiro."}
          </p>
        </article>

        <article className="simple-guide-card">
          <span>Como usar</span>
          <strong>Escolha uma bolha</strong>
          <small>Clique para ver vencedor, dupla chance, gols e ambas marcam.</small>
        </article>

        <article className="simple-guide-card">
          <span>Lista completa</span>
          <strong>{mode === "today" ? `${games.length} jogos` : "Copa 2026"}</strong>
          <button type="button" onClick={openTodayList}>
            Ver todos
          </button>
        </article>
      </section>

      <section className="radar-stage">
        <main className="bubble-board" ref={boardRef}>
          <div className="board-grid" />
          <div className="board-status">
            <span>{getFilterTitle(filter, mode)}</span>
            <strong>
              {viewMode === "radar"
                ? `${radarGames.length} de ${filteredGames.length} jogos`
                : `${chronologicalGames.length} jogos em ordem`}
            </strong>
            <em>{getFilterSubtitle(filter)}</em>
            <small>
              {refreshing
                ? "Atualizando..."
                : updatedAt
                  ? `Atualizado as ${formatBrasiliaUpdateTime(updatedAt)} (${BRASILIA_TIMEZONE_LABEL})`
                  : debug}
            </small>
          </div>

          {loading ? (
            <div className="empty-state">
              <h2>{mode === "today" ? "Carregando jogos de hoje..." : "Carregando Copa 2026..."}</h2>
              <p>Buscando jogos, odds e estimativas.</p>
            </div>
          ) : null}

          {!loading && !boardGamesCount ? (
            <div className="empty-state">
              <h2>Sem jogos neste filtro</h2>
              <p>{debug || "Tente outro filtro no topo."}</p>
            </div>
          ) : null}

          {!loading && viewMode === "list" && chronologicalGames.length ? (
            <div className="radar-list-view">
              <div className="radar-list-head">
                <span>Hora BR</span>
                <span>Jogo</span>
                <span>Palpite</span>
                <span>Chance</span>
                <span>IA</span>
              </div>

              {chronologicalGames.map((game) => {
                const hitState = getAiHitState(game);

                return (
                  <button
                    className={selectedGame?.id === game.id ? "radar-list-row is-active" : "radar-list-row"}
                    key={game.id}
                    onClick={() => openGameModal(game.id)}
                    type="button"
                  >
                    <span className={game.isLive ? "list-time is-live" : "list-time"}>
                      {game.isLive ? formatClock(game) : formatKickoffTime(game.commenceTime)}
                      <small>{formatScoreLine(game)}</small>
                    </span>
                    <strong>
                      {game.game}
                      <small>{game.league}</small>
                    </strong>
                    <span className="prediction-summary">
                      <b>{translateBetText(game.displayPickLabel || game.pickLabel)}</b>
                    </span>
                    <em>{formatChance(game.displayProbability || game.probability)}</em>
                    <span className={`list-ai-hit is-${hitState.state}`}>
                      <AiHitLogo state={hitState.state} compact />
                      {hitState.label}
                    </span>
                  </button>
                );
              })}
            </div>
          ) : null}

          {!loading &&
            viewMode === "radar" &&
            radarGames.map((game) => {
              const hitState = getAiHitState(game);

              return (
                <button
                  aria-label={`Abrir previsoes de ${game.game}`}
                  className={
                    selectedGame?.id === game.id
                      ? `bubble is-${game.tier} is-selected`
                      : `bubble is-${game.tier}`
                  }
                  key={game.id}
                  onBlur={() => setHoveredId(null)}
                  onFocus={() => setHoveredId(game.id)}
                  onClick={() => openGameModal(game.id)}
                  onMouseEnter={() => setHoveredId(game.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onTouchStart={() => setHoveredId(game.id)}
                  style={{
                    width: `${game.size}px`,
                    height: `${game.size}px`,
                    transform: `translate(${game.x}px, ${game.y}px)`,
                  }}
                  title={game.game}
                  type="button"
                >
                  {hitState.state === "hit" ? <AiHitLogo state="hit" compact /> : null}
                  <span className="bubble-primary">{getBubbleMainLabel(game)}</span>
                  <strong>{formatChance(game.displayProbability || game.probability)}</strong>
                  {hasScoreLine(game) || game.isLive ? (
                    <span className={game.isLive ? "bubble-score-stack is-live" : "bubble-score-stack"}>
                      <span className="bubble-score">{formatScoreLine(game)}</span>
                      {game.isLive ? <span className="bubble-minute">{formatClock(game)} online</span> : null}
                    </span>
                  ) : null}
                </button>
              );
            })}

          {!loading && viewMode === "radar" && hoveredGame ? (
            <aside className="bubble-tooltip" aria-live="polite">
              <span>{getGameStatusLabel(hoveredGame)}</span>
              <strong>{hoveredGame.game}</strong>
              <p>{translateBetText(hoveredGame.displayPickLabel || hoveredGame.pickLabel)}</p>
              <div>
                <small>{formatChance(hoveredGame.displayProbability || hoveredGame.probability)} chance</small>
                <small>Odd {formatOdd(hoveredGame.displayOdd || hoveredGame.oddHome)}</small>
                <small>{formatScoreLine(hoveredGame)}</small>
              </div>
            </aside>
          ) : null}

          {!loading && viewMode === "radar" && filteredGames.length > radarGames.length ? (
            <div className="radar-actions">
              <button
                className="load-more-button"
                onClick={() => setRadarLimit((current) => current + RADAR_INITIAL_LIMIT)}
                type="button"
              >
                Carregar mais {Math.min(RADAR_INITIAL_LIMIT, filteredGames.length - radarGames.length)}
              </button>
            </div>
          ) : null}
        </main>
      </section>

      {isModalOpen && selectedGame ? (
        <div className="prediction-modal-backdrop" onClick={closeGameModal} role="presentation">
          <section
            aria-label={`Previsoes de ${selectedGame.game}`}
            aria-modal="true"
            className="prediction-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="prediction-modal-header">
              <div>
                <div className="modal-title-kicker">
                  <span>{selectedGame.isLive ? "Ao vivo" : "Melhor leitura da IA"}</span>
                  <span className={`ai-hit-badge is-${selectedHitState?.state || "pending"}`}>
                    <AiHitLogo state={selectedHitState?.state || "pending"} compact />
                    {selectedHitState?.label || "Em validacao"}
                  </span>
                </div>
                <h2>{selectedGame.game}</h2>
                <p>
                  {translateBetText(selectedGame.displayPickLabel || selectedGame.pickLabel)} |{" "}
                  {formatChance(selectedGame.displayProbability || selectedGame.probability)} |{" "}
                  Odd {formatOdd(selectedGame.displayOdd || selectedGame.oddHome)} |{" "}
                  {formatScoreLine(selectedGame)} | {formatClock(selectedGame)}
                </p>
              </div>

              <button className="modal-close-button" onClick={closeGameModal} type="button" aria-label="Fechar previsoes">
                x
              </button>
            </header>

            <div className="modal-summary-grid">
              <article>
                <span>Placar online</span>
                <strong>{formatScoreLine(selectedGame)}</strong>
                <small>{formatScoreContext(selectedGame)}</small>
              </article>
              <article>
                <span>Palpite principal</span>
                <strong>{translateBetText(selectedGame.displayPickLabel || selectedGame.pickLabel)}</strong>
                <small>
                  {getBetHelpText(selectedGame.displayPickLabel || selectedGame.pickLabel) ||
                    aiInsights.headline ||
                    getAiSummary(selectedGame)}
                </small>
              </article>
              <article>
                <span>Chance IA</span>
                <strong>{formatChance(selectedGame.displayProbability || selectedGame.probability)}</strong>
                <small>{aiInsights.main || "Chance estimada: aguardando dados."}</small>
              </article>
              <article className={`hit-summary-card is-${selectedHitState?.state || "pending"}`}>
                <span>Acertos IA</span>
                <strong>
                  <AiHitLogo state={selectedHitState?.state || "pending"} compact />
                  {selectedHitState?.label || "Em validacao"}
                </strong>
                <small>{selectedHitState?.note || "Aguardando conferencia do resultado."}</small>
              </article>
              <article>
                <span>Risco</span>
                <strong>{getBeforeColon(aiInsights.risk, "Risco medio")}</strong>
                <small>{aiInsights.risk || aiInsights.confidence || "Aguardando leitura completa."}</small>
              </article>
              <article>
                <span>Odd atual</span>
                <strong>{formatOdd(selectedGame.displayOdd || selectedGame.oddHome)}</strong>
                <small>{selectedGame.hasOdds ? "Odds oficiais" : "Estimativa visual"}</small>
              </article>
            </div>

            <section className="modal-ai-card primary-reading">
              <span>Leitura facil</span>
              <ul>
                <li>{aiInsights.result || "Resultado: sem dados suficientes neste momento."}</li>
                <li>{aiInsights.goals || "Gols: sem dados suficientes neste momento."}</li>
                <li>{aiInsights.btts || "Ambas marcam: sem dados suficientes neste momento."}</li>
                <li>{aiInsights.combo || "Combinada: sem dados suficientes neste momento."}</li>
                <li>{aiInsights.warning || "Use como apoio para analise. Nao existe aposta garantida."}</li>
              </ul>
            </section>

            <div className="modal-accordion-stack">
              <details className="modal-accordion">
                <summary>Checklist rapido</summary>
                <ul>
                  {(aiChecklist.length ? aiChecklist : ["Confira odd, placar e status antes de apostar."]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>

              <details className="modal-accordion">
                <summary>Por que verificar</summary>
                <ul>
                  {(aiWhy.length ? aiWhy : ["A IA ainda esta montando a leitura desse jogo."]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>

              <details className="modal-accordion">
                <summary>Evite se</summary>
                <ul>
                  {(aiAvoidIf.length ? aiAvoidIf : ["Evite se a leitura nao estiver clara."]).map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </details>

              <details className="modal-accordion">
                <summary>Melhores mercados para conferir</summary>
                <div className="accordion-cards">
                  {(aiBestMarkets.length ? aiBestMarkets : selectedMarkets.slice(0, 4).map((market) => ({
                    category: market.category,
                    market: market.name,
                    pick: market.leader?.label,
                    probability: market.leader?.probability,
                    odd: market.leader?.odd,
                    note: "",
                  }))).map((market) => (
                    <article className="ai-market-mini" key={`${market.category}-${market.market}-${market.pick}`}>
                      <span>{market.category}</span>
                      <strong>{translateBetText(market.pick)}</strong>
                      <small>
                        {formatChance(market.probability)} | Odd {formatOdd(market.odd)}
                      </small>
                      <em>{market.note || translateBetText(market.market)}</em>
                    </article>
                  ))}
                </div>
              </details>

              <details className="modal-accordion">
                <summary>Opcoes principais</summary>
                <div className="accordion-cards">
                  {selectedOptions.map((option) => (
                    <article
                      className={option.code === selectedGame.pickCode ? "option-card is-leader" : "option-card"}
                      key={option.code}
                    >
                      <span>{option.code}</span>
                      <strong>{translateBetText(option.label)}</strong>
                      <small>{formatChance(option.probability)} | Odd {formatOdd(option.odd)}</small>
                    </article>
                  ))}
                </div>
              </details>

              <details className="modal-accordion">
                <summary>Todos os mercados</summary>
                <div className="markets-grid modal-markets-grid">
                  {selectedMarkets.map((market) => (
                    <article className="market-card" key={`${market.id}-${market.name}`}>
                      <div className="market-card-head">
                        <span>{market.category}</span>
                        <strong>{translateBetText(market.name)}</strong>
                      </div>
                      <div className="market-options">
                        {(market.options || []).map((option) => (
                          <div className="market-option" key={`${market.id}-${option.label}`}>
                            <span>{translateBetText(option.label)}</span>
                            <strong>{formatChance(option.probability)}</strong>
                            <small>Odd {formatOdd(option.odd)}</small>
                          </div>
                        ))}
                      </div>
                    </article>
                  ))}
                </div>
              </details>

              <details className="modal-accordion">
                <summary>Outros jogos fortes deste filtro</summary>
                <div className="accordion-cards">
                  {topGames.map((game, index) => (
                    <button
                      className={selectedGame.id === game.id ? "top-pill is-active" : "top-pill"}
                      key={game.id}
                      onClick={() => setSelectedId(game.id)}
                      type="button"
                    >
                      <span>{index + 1}</span>
                      <strong>{game.game}</strong>
                      <small>{formatChance(game.displayProbability || game.probability)}</small>
                    </button>
                  ))}
                </div>
              </details>
            </div>
          </section>
        </div>
      ) : null}

      {isTodayListOpen ? (
        <div
          className="today-games-backdrop"
          onClick={() => setIsTodayListOpen(false)}
          role="presentation"
        >
          <section
            aria-label="Todos jogos de hoje"
            aria-modal="true"
            className="today-games-modal"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <header className="today-games-header">
              <div>
                <span>Lista completa</span>
                <h2>Todos jogos de hoje</h2>
                <p>
                  Horarios no {BRASILIA_TIMEZONE_LABEL}.
                  Clique em um jogo para abrir os palpites de IA.
                </p>
              </div>

              <button
                className="modal-close-button"
                onClick={() => setIsTodayListOpen(false)}
                type="button"
                aria-label="Fechar lista"
              >
                x
              </button>
            </header>

            <div className="today-games-stats">
              <article>
                <span>Total</span>
                <strong>{todayListGames.length}</strong>
              </article>
              <article>
                <span>Ao vivo</span>
                <strong>{liveCount}</strong>
              </article>
              <article>
                <span>Pre-jogo</span>
                <strong>{preCount}</strong>
              </article>
              <article>
                <span>Encerrados</span>
                <strong>{finishedCount}</strong>
              </article>
              <article className="ai-stat-card is-hit">
                <span>IA acertou</span>
                <strong>{formatChance(todayAiStats.hitRate)}</strong>
                <small>{todayAiStats.hits} de {todayAiStats.checked} conferidos</small>
              </article>
              <article className="ai-stat-card is-miss">
                <span>IA errou</span>
                <strong>{formatChance(todayAiStats.missRate)}</strong>
                <small>{todayAiStats.misses} de {todayAiStats.checked} conferidos</small>
              </article>
              <article className="ai-stat-card">
                <span>Em validacao</span>
                <strong>{todayAiStats.pending}</strong>
                <small>Ao vivo ou aguardando resultado</small>
              </article>
            </div>

            <div className="today-games-table-wrap">
              <table className="today-games-table">
                <thead>
                  <tr>
                    <th>Hora BR</th>
                    <th>Campeonato</th>
                    <th>Mandante</th>
                    <th>Placar</th>
                    <th>Visitante</th>
                    <th>Palpite IA</th>
                    <th>Chance</th>
                    <th>Selo IA</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {todayListGames.map((game) => {
                    const rowGame = withDisplayMarket(game, "best") || game;
                    const hitState = getAiHitState(rowGame);

                    return (
                      <tr
                        className={game.isLive ? "is-live-row" : ""}
                        key={game.id}
                        onClick={() => {
                          openGameModal(game.id);
                          setIsTodayListOpen(false);
                        }}
                      >
                        <td>
                          <strong>{game.isLive ? formatClock(game) : formatKickoffTime(game.commenceTime)}</strong>
                        </td>
                        <td>
                          <span>{game.league}</span>
                          <small>{game.country}</small>
                        </td>
                        <td>{game.homeTeam}</td>
                        <td className="score-cell">{formatScoreLine(game)}</td>
                        <td>{game.awayTeam}</td>
                        <td>
                          <strong>{translateBetText(rowGame.displayPickLabel || rowGame.pickLabel)}</strong>
                          <small>{getBetHelpText(rowGame.displayPickLabel || rowGame.pickLabel) || game.aiInsights?.action || "Verificar"}</small>
                        </td>
                        <td
                          className={
                            (rowGame.displayProbability || rowGame.probability) >= 0.45
                              ? "chance-high"
                              : "chance-low"
                          }
                        >
                          {formatChance(rowGame.displayProbability || rowGame.probability)}
                        </td>
                        <td>
                          <span className={`table-ai-hit is-${hitState.state}`}>
                            <AiHitLogo state={hitState.state} compact />
                            {hitState.label}
                          </span>
                        </td>
                        <td>{getGameStatusLabel(game)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {!loading && !todayListGames.length ? (
                <div className="today-games-empty">
                  <strong>Nenhum jogo de hoje retornado.</strong>
                  <span>{debug || message || "Tente atualizar novamente em alguns minutos."}</span>
                </div>
              ) : null}

              {loading ? (
                <div className="today-games-empty">
                  <strong>Carregando todos os jogos de hoje...</strong>
                  <span>Buscando horarios, placares e leitura IA.</span>
                </div>
              ) : null}
            </div>
          </section>
        </div>
      ) : null}

      <section className="sponsor-strip sponsor-strip-bottom" aria-label="Espacos comerciais">
        {SPONSORS.map((sponsor) => (
          <article className="sponsor-slot" key={sponsor.label}>
            <span>{sponsor.label}</span>
            <strong>{sponsor.title}</strong>
            <small>{sponsor.note}</small>
          </article>
        ))}
      </section>
    </div>
  );
}

export default function App() {
  const isWidgetsPage =
    typeof window !== "undefined" && window.location.pathname.startsWith("/widgets");

  return isWidgetsPage ? <WidgetsPage /> : <BubblesWorldCup />;
}
