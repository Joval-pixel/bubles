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

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const formatChance = (value) => `${Math.round((value || 0) * 100)}%`;
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
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--";

const formatKickoffTime = (value) =>
  value
    ? new Date(value).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      })
    : "--";

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
    .replace(/\bCorners\b/gi, "Escanteios")
    .replace(/\bCards\b/gi, "Cartoes")
    .replace(/\bGoals\b/gi, "Gols")
    .replace(/\bOdd\b/gi, "Impar")
    .replace(/\bEven\b/gi, "Par");
};

const getBeforeColon = (value, fallback = "--") => {
  const text = String(value || "").trim();

  if (!text) {
    return fallback;
  }

  return text.split(":")[0] || fallback;
};

const getTier = (probability) => {
  if (probability >= 0.45) {
    return "high";
  }

  return "low";
};

const EDGE_PADDING = 14;
const COLLISION_GAP = 20;
const COLLISION_PASSES = 9;
const DRIFT_INTERVAL_MS = 48;
const FRAME_STEP_LIMIT = 1.55;
const VELOCITY_LIMIT = 0.082;
const BOUNCE_DAMPING = 0.74;
const COLLISION_DAMPING = 0.88;
const DEFAULT_BUBBLE_SCALE = "small";

const getCrowdFactor = (total = 0) => {
  if (total >= 110) {
    return 0.64;
  }

  if (total >= 80) {
    return 0.72;
  }

  if (total >= 55) {
    return 0.82;
  }

  if (total >= 32) {
    return 0.92;
  }

  return 1;
};

const limitVelocity = (value) => clamp(value, -VELOCITY_LIMIT, VELOCITY_LIMIT);

const getInitialVelocity = (index, axis) => {
  const direction = axis === "x" ? (index % 2 ? 1 : -1) : (index % 3 ? 1 : -1);
  const base = axis === "x" ? 0.035 : 0.028;
  const spread = axis === "x" ? (index % 7) * 0.006 : (index % 5) * 0.005;

  return limitVelocity(direction * (base + spread));
};

const getDisplaySize = (probability, scale, total = 0) => {
  const crowdFactor = getCrowdFactor(total);
  const base = (48 + clamp(probability || 0.33, 0.05, 0.9) * 170) * crowdFactor;

  if (scale === "large") {
    return clamp(base * 1.1, 58, 238);
  }

  if (scale === "small") {
    return clamp(base * 0.78, 42, 150);
  }

  return clamp(base * 0.92, 50, 198);
};

const getInitialPosition = (index, total, bounds, size) => {
  const width = Math.max(bounds.width || 0, 1280);
  const height = Math.max(bounds.height || 0, 660);
  const angle = index * 2.399963229728653;
  const orbit = Math.sqrt(index + 1) * (width > 900 ? 68 : 48);
  const centerX = width / 2;
  const centerY = height / 2;
  const x = centerX + Math.cos(angle) * orbit * 1.68 - size / 2;
  const y = centerY + Math.sin(angle) * orbit * 1.08 - size / 2;

  return {
    x: clamp(x, 18, width - size - 18),
    y: clamp(y, 18, height - size - 18),
  };
};

const createBubble = (game, existing, bounds, index, total, scale) => {
  const size = getDisplaySize(game.bubbleValue ?? game.probability, scale, total);
  const position = existing ?? getInitialPosition(index, total, bounds, size);

  return {
    ...game,
    size,
    radius: size / 2,
    tier: getTier(game.bubbleValue ?? game.probability),
    x: position.x,
    y: position.y,
    vx: existing?.vx ? limitVelocity(existing.vx) : getInitialVelocity(index, "x"),
    vy: existing?.vy ? limitVelocity(existing.vy) : getInitialVelocity(index, "y"),
  };
};

const moveBubbles = (items, bounds, step = 1) => {
  const width = Math.max(bounds.width || 0, 1280);
  const height = Math.max(bounds.height || 0, 660);
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

    return bubble;
  });

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

        const overlap = minDistance - distance;
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

        first.vx = limitVelocity((first.vx + normalX * 0.012) * COLLISION_DAMPING);
        first.vy = limitVelocity((first.vy + normalY * 0.012) * COLLISION_DAMPING);
        second.vx = limitVelocity((second.vx - normalX * 0.012) * COLLISION_DAMPING);
        second.vy = limitVelocity((second.vy - normalY * 0.012) * COLLISION_DAMPING);
      }
    }
  }

  return next;
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
