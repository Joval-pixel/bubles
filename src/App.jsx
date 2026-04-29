import { useEffect, useMemo, useRef, useState } from "react";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const formatEv = (value) => {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "--";
  }

  return `${value > 0 ? "+" : ""}${value.toFixed(2).replace(".", ",")}`;
};

const formatMinute = (value) => `${Math.max(0, Math.round(value))}'`;
const formatOdd = (value) =>
  value && Number.isFinite(value) && value > 0 ? value.toFixed(2).replace(".", ",") : "--";
const formatPercent = (value) => `${((value || 0) * 100).toFixed(1).replace(".", ",")}%`;
const formatClock = (game) => (game?.isLive ? formatMinute(game.minute) : "PRE");
const formatKickoff = (value) =>
  value
    ? new Date(value).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";
const formatChance = (value) => `${Math.round((value || 0) * 100)}%`;

const getDisplaySize = (size, scaleMode) => {
  if (scaleMode === "compact") {
    return clamp(size * 0.8, 60, 244);
  }

  if (scaleMode === "boost") {
    return clamp(size * 1.08, 88, 300);
  }

  return clamp(size * 0.94, 72, 276);
};

const getFilterLabel = (statusFilter, rangeFilter) => {
  const statusMap = {
    all: "todos os jogos",
    live: "somente ao vivo",
    upcoming: "somente pre-jogo",
    strong: "probabilidade 60%+",
  };

  const rangeMap = {
    all: "sem limite",
    today: "somente hoje",
    top5: "top 5",
    top10: "top 10",
    top24: "top 24",
  };

  return `${statusMap[statusFilter] ?? "todos os jogos"} | ${rangeMap[rangeFilter] ?? "sem limite"}`;
};

const getSortLabel = (sortMode) => {
  const labelMap = {
    probability: "ordenado por probabilidade",
    odd: "ordenado por odds",
    kickoff: "ordenado por horario",
  };

  return labelMap[sortMode] ?? "ordenado por probabilidade";
};

const getSignal = (game) => {
  if (!game) {
    return {
      tone: "neutral",
      title: "Sem sinal",
      note: "Selecione uma bolha para ver a leitura do mercado.",
    };
  }

  if (game.isLive) {
    if ((game.probability || 0) >= 0.68) {
      return {
        tone: "good",
        title: "Favoritismo forte",
        note: "O mercado aponta um lado bem destacado neste jogo ao vivo.",
      };
    }

    if ((game.probability || 0) >= 0.52) {
      return {
        tone: "watch",
        title: "Jogo monitoravel",
        note: "Existe leitura favoravel, mas ainda com disputa relevante no confronto.",
      };
    }

    return {
      tone: "bad",
      title: "Leitura instavel",
      note: "O mercado esta mais espalhado e sem um favoritismo tao claro ao vivo.",
    };
  }

  if ((game.probability || 0) >= 0.7) {
    return {
      tone: "good",
      title: "Previsao forte",
      note: "Essa partida entra entre os maiores favoritismos do radar principal.",
    };
  }

  if ((game.probability || 0) >= 0.56) {
    return {
      tone: "watch",
      title: "Boa leitura",
      note: "Existe frente clara do lado selecionado, mas com margem menor que as lideres.",
    };
  }

  return {
    tone: "bad",
    title: "Jogo equilibrado",
    note: "As probabilidades estao mais distribuidas e o mercado nao forma uma lideranca forte.",
  };
};

const getLayoutPosition = (index, total, bounds, size) => {
  const width = Math.max(bounds.width || 0, 1360);
  const height = Math.max(bounds.height || 0, 860);
  const leftPadding = 28;
  const topPadding = 112;
  const bottomPadding = 56;
  const sideDockReserve = width > 1220 ? 336 : 28;
  const usableWidth = Math.max(440, width - leftPadding - sideDockReserve);
  const usableHeight = Math.max(420, height - topPadding - bottomPadding);
  const centerX = leftPadding + usableWidth / 2;
  const centerY = topPadding + usableHeight / 2;
  const angle = index * 2.399963229728653;
  const orbit = Math.sqrt(index + 1) * 72;
  const horizontalOrbit = orbit * 1.42;
  const verticalOrbit = orbit * 0.92;
  const jitterX = (((index * 19) % 27) - 13) * 2.2;
  const jitterY = (((index * 31) % 21) - 10) * 1.9;
  const x = centerX + Math.cos(angle) * horizontalOrbit + jitterX - size / 2;
  const y = centerY + Math.sin(angle) * verticalOrbit + jitterY - size / 2;

  return {
    x: clamp(x, leftPadding, leftPadding + usableWidth - size),
    y: clamp(y, topPadding, topPadding + usableHeight - size),
  };
};

const getTier = (probability) => {
  if (probability >= 0.66) {
    return "high";
  }

  if (probability >= 0.48) {
    return "medium";
  }

  return "low";
};

const createBubble = (game, existing, bounds, index, total) => {
  const bubbleStrength = clamp(game.bubbleValue ?? game.probability ?? 0, 0.08, 0.92);
  const size = clamp(68 + bubbleStrength * 244 + (game.isLive ? 14 : 0), 68, 284);
  const fallbackPosition = getLayoutPosition(index, total, bounds, size);

  return {
    ...game,
    tier: getTier(bubbleStrength),
    size,
    radius: size / 2,
    x: existing?.x ?? fallbackPosition.x,
    y: existing?.y ?? fallbackPosition.y,
    vx: existing?.vx ?? ((Math.random() - 0.5) * (0.52 + (index % 5) * 0.07) || 0.26),
    vy: existing?.vy ?? ((Math.random() - 0.5) * (0.5 + (index % 4) * 0.06) || -0.24),
  };
};

const moveBubbles = (items, bounds) => {
  const width = Math.max(bounds.width || 0, 1360);
  const height = Math.max(bounds.height || 0, 860);
  const leftPadding = 28;
  const topPadding = 112;
  const bottomPadding = 56;
  const sideDockReserve = width > 1220 ? 336 : 28;
  const maxX = width - sideDockReserve;
  const maxY = height - bottomPadding;

  const next = items.map((item) => {
    const bubble = {
      ...item,
      x: item.x + item.vx,
      y: item.y + item.vy,
    };

    if (bubble.x <= leftPadding || bubble.x >= maxX - bubble.size) {
      bubble.vx *= -1;
      bubble.x = clamp(bubble.x, leftPadding, maxX - bubble.size);
    }

    if (bubble.y <= topPadding || bubble.y >= maxY - bubble.size) {
      bubble.vy *= -1;
      bubble.y = clamp(bubble.y, top
