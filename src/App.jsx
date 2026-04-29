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
      bubble.y = clamp(bubble.y, topPadding, maxY - bubble.size);
    }

    return bubble;
  });

  for (let index = 0; index < next.length; index += 1) {
    for (let compare = index + 1; compare < next.length; compare += 1) {
      const first = next[index];
      const second = next[compare];
      const dx = first.x + first.radius - (second.x + second.radius);
      const dy = first.y + first.radius - (second.y + second.radius);
      const distance = Math.hypot(dx, dy) || 1;
      const minDistance = first.radius + second.radius + 10;

      if (distance >= minDistance) {
        continue;
      }

      const overlap = minDistance - distance;
      const normalX = dx / distance;
      const normalY = dy / distance;

      first.x += normalX * (overlap * 0.5);
      first.y += normalY * (overlap * 0.5);
      second.x -= normalX * (overlap * 0.5);
      second.y -= normalY * (overlap * 0.5);

      const tempVx = first.vx;
      const tempVy = first.vy;
      first.vx = second.vx * 0.98;
      first.vy = second.vy * 0.98;
      second.vx = tempVx * 0.98;
      second.vy = tempVy * 0.98;
    }
  }

  return next;
};

export default function App() {
  const boardRef = useRef(null);
  const animationRef = useRef(0);
  const boundsRef = useRef({ width: 0, height: 0 });

  const [bubbles, setBubbles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("");
  const [debugMessage, setDebugMessage] = useState("");
  const [serverMessage, setServerMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [rangeFilter, setRangeFilter] = useState("top24");
  const [sortMode, setSortMode] = useState("probability");
  const [bubbleScale, setBubbleScale] = useState("compact");

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
    let isMounted = true;

    const fetchGames = async (silent = false) => {
      if (!silent) {
        setLoading(true);
      } else {
        setRefreshing(true);
      }

      try {
        const response = await fetch("/api/games", {
          cache: "no-store",
        });

        const payload = await response.json();
        const items = Array.isArray(payload?.games) ? payload.games : [];

        if (!isMounted) {
          return;
        }

        setUpdatedAt(payload?.updatedAt ?? "");
        setDebugMessage(payload?.debug ?? "");
        setServerMessage(payload?.message ?? "");
        setBubbles((current) => {
          const currentMap = new Map(current.map((item) => [item.id, item]));
          return items.map((item, index) =>
            createBubble(item, currentMap.get(item.id), boundsRef.current, index, items.length)
          );
        });

        setSelectedId((current) =>
          items.some((item) => item.id === current) ? current : items[0]?.id ?? null
        );
      } catch (_error) {
        if (!isMounted) {
          return;
        }

        setBubbles([]);
        setSelectedId(null);
        setUpdatedAt("");
        setDebugMessage("Falha ao consultar /api/games");
        setServerMessage("");
      } finally {
        if (!isMounted) {
          return;
        }

        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchGames(false);
    const timer = window.setInterval(() => {
      fetchGames(true);
    }, 120000);

    return () => {
      isMounted = false;
      window.clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (!bubbles.length) {
      return undefined;
    }

    const animate = () => {
      setBubbles((current) => moveBubbles(current, boundsRef.current));
      animationRef.current = window.requestAnimationFrame(animate);
    };

    animationRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(animationRef.current);
    };
  }, [bubbles.length]);

  const filteredBubbles = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    let items = [...bubbles];

    if (query) {
      items = items.filter((item) => {
        const haystack = `${item.game} ${item.league} ${item.bestBookmaker}`.toLowerCase();
        return haystack.includes(query);
      });
    }

    if (statusFilter === "live") {
      items = items.filter((item) => item.isLive);
    } else if (statusFilter === "upcoming") {
      items = items.filter((item) => !item.isLive);
    } else if (statusFilter === "strong") {
      items = items.filter((item) => (item.probability || 0) >= 0.6);
    }

    if (rangeFilter === "top5") {
      items = [...items]
        .sort(
          (left, right) =>
            (right.bubbleValue ?? right.probability ?? 0) -
            (left.bubbleValue ?? left.probability ?? 0)
        )
        .slice(0, 5);
    } else if (rangeFilter === "top10") {
      items = [...items]
        .sort(
          (left, right) =>
            (right.bubbleValue ?? right.probability ?? 0) -
            (left.bubbleValue ?? left.probability ?? 0)
        )
        .slice(0, 10);
    } else if (rangeFilter === "top24") {
      items = [...items]
        .sort(
          (left, right) =>
            (right.bubbleValue ?? right.probability ?? 0) -
            (left.bubbleValue ?? left.probability ?? 0)
        )
        .slice(0, 24);
    } else if (rangeFilter === "today") {
      const today = new Date().toLocaleDateString("pt-BR");
      items = items.filter((item) => {
        if (!item.commenceTime) {
          return false;
        }

        return new Date(item.commenceTime).toLocaleDateString("pt-BR") === today;
      });
    }

    if (sortMode === "probability") {
      items.sort(
        (left, right) =>
          (right.bubbleValue ?? right.probability ?? 0) -
          (left.bubbleValue ?? left.probability ?? 0)
      );
    } else if (sortMode === "odd") {
      items.sort((left, right) => right.oddHome - left.oddHome);
    } else if (sortMode === "kickoff") {
      items.sort(
        (left, right) =>
          new Date(left.commenceTime || 0).getTime() - new Date(right.commenceTime || 0).getTime()
      );
    } else {
      items.sort((left, right) => (right.ev ?? -999) - (left.ev ?? -999));
    }

    return items;
  }, [bubbles, rangeFilter, searchTerm, sortMode, statusFilter]);

  const renderedBubbles = useMemo(
    () =>
      filteredBubbles.map((item) => {
        const displaySize = getDisplaySize(item.size, bubbleScale);

        return {
          ...item,
          size: displaySize,
          radius: displaySize / 2,
        };
      }),
    [bubbleScale, filteredBubbles]
  );

  useEffect(() => {
    if (!filteredBubbles.length) {
      return;
    }

    const visibleIds = filteredBubbles.map((item) => item.id);
    const nextSizes = new Map(
      filteredBubbles.map((item) => [item.id, getDisplaySize(item.size, bubbleScale)])
    );

    setBubbles((current) =>
      current.map((item) => {
        const visibleIndex = visibleIds.indexOf(item.id);

        if (visibleIndex === -1) {
          return item;
        }

        const nextSize = nextSizes.get(item.id) ?? item.size;
        const nextPosition = getLayoutPosition(
          visibleIndex,
          visibleIds.length,
          boundsRef.current,
          nextSize
        );

        return {
          ...item,
          x: nextPosition.x,
          y: nextPosition.y,
        };
      })
    );
  }, [bubbleScale, rangeFilter, searchTerm, sortMode, statusFilter, updatedAt, bubbles.length]);

  const topGames = useMemo(
    () =>
      [...filteredBubbles]
        .sort(
          (left, right) =>
            (right.bubbleValue ?? right.probability ?? 0) -
            (left.bubbleValue ?? left.probability ?? 0)
        )
        .slice(0, 5),
    [filteredBubbles]
  );

  const selectedGame =
    renderedBubbles.find((item) => item.id === selectedId) ??
    topGames.find((item) => item.id === selectedId) ??
    topGames[0] ??
    renderedBubbles[0] ??
    null;

  const liveCount = bubbles.filter((item) => item.isLive).length;
  const upcomingCount = bubbles.filter((item) => !item.isLive).length;
  const strongCount = bubbles.filter((item) => (item.probability || 0) >= 0.6).length;
  const hasAnyGames = bubbles.length > 0;
  const emptyMessage = hasAnyGames ? "Sem jogos para este filtro" : "Sem jogos ao vivo";
  const hasLiveGames = filteredBubbles.some((item) => item.isLive);
  const badgeLabel = hasLiveGames ? "Ao vivo" : filteredBubbles.length ? "Proximos" : "Radar";
  const headlineText = hasLiveGames
    ? "Jogos ao vivo e grandes mercados"
    : "Partidas fortes em destaque";
  const filterLabel = getFilterLabel(statusFilter, rangeFilter);
  const sortLabel = getSortLabel(sortMode);
  const selectedSignal = getSignal(selectedGame);
  const bestChanceGame = filteredBubbles[0] ?? null;
  const sourceLabel = bubbles[0]?.source ?? "API-Football";
  const nextKickoffLabel = bestChanceGame?.commenceTime
    ? formatKickoff(bestChanceGame.commenceTime)
    : "--";
  const leadChanceLabel = bestChanceGame ? formatChance(bestChanceGame.probability) : "--";

  return (
    <div className="app-shell">
      <div className="glow glow-left" />
      <div className="glow glow-right" />

      <section className="control-deck">
        <div className="control-brand">
          <div className="brand-dot" />
          <strong>BUBLES RADAR</strong>
        </div>

        <div className="control-search">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Pesquisar jogo, liga ou casa"
            aria-label="Pesquisar jogos"
          />
        </div>

        <div className="control-cluster">
          <button
            type="button"
            className={statusFilter === "all" ? "chip-button is-active" : "chip-button"}
            onClick={() => setStatusFilter("all")}
          >
            Todos {bubbles.length}
          </button>
          <button
            type="button"
            className={statusFilter === "live" ? "chip-button is-active" : "chip-button"}
            onClick={() => setStatusFilter("live")}
          >
            Ao vivo {liveCount}
          </button>
          <button
            type="button"
            className={statusFilter === "upcoming" ? "chip-button is-active" : "chip-button"}
            onClick={() => setStatusFilter("upcoming")}
          >
            Pre {upcomingCount}
          </button>
          <button
            type="button"
            className={statusFilter === "strong" ? "chip-button is-active" : "chip-button"}
            onClick={() => setStatusFilter("strong")}
          >
            60%+ {strongCount}
          </button>
        </div>

        <div className="control-cluster">
          <button
            type="button"
            className={rangeFilter === "all" ? "chip-button is-alt is-active" : "chip-button is-alt"}
            onClick={() => setRangeFilter("all")}
          >
            Tudo
          </button>
          <button
            type="button"
            className={rangeFilter === "today" ? "chip-button is-alt is-active" : "chip-button is-alt"}
            onClick={() => setRangeFilter("today")}
          >
            Hoje
          </button>
          <button
            type="button"
            className={rangeFilter === "top5" ? "chip-button is-alt is-active" : "chip-button is-alt"}
            onClick={() => setRangeFilter("top5")}
          >
            Top 5
          </button>
          <button
            type="button"
            className={rangeFilter === "top10" ? "chip-button is-alt is-active" : "chip-button is-alt"}
            onClick={() => setRangeFilter("top10")}
          >
            Top 10
          </button>
          <button
            type="button"
            className={rangeFilter === "top24" ? "chip-button is-alt is-active" : "chip-button is-alt"}
            onClick={() => setRangeFilter("top24")}
          >
            Top 24
          </button>
        </div>

        <div className="control-cluster">
          <button
            type="button"
            className={sortMode === "probability" ? "chip-button is-neutral is-active" : "chip-button is-neutral"}
            onClick={() => setSortMode("probability")}
          >
            Chance
          </button>
          <button
            type="button"
            className={sortMode === "odd" ? "chip-button is-neutral is-active" : "chip-button is-neutral"}
            onClick={() => setSortMode("odd")}
          >
            Odds
          </button>
          <button
            type="button"
            className={sortMode === "kickoff" ? "chip-button is-neutral is-active" : "chip-button is-neutral"}
            onClick={() => setSortMode("kickoff")}
          >
            Hora
          </button>
        </div>

        <div className="control-cluster">
          <button
            type="button"
            className={bubbleScale === "compact" ? "icon-button is-active" : "icon-button"}
            onClick={() => setBubbleScale("compact")}
            aria-label="Bolhas compactas"
          >
            S
          </button>
          <button
            type="button"
            className={bubbleScale === "smart" ? "icon-button is-active" : "icon-button"}
            onClick={() => setBubbleScale("smart")}
            aria-label="Bolhas normais"
          >
            M
          </button>
          <button
            type="button"
            className={bubbleScale === "boost" ? "icon-button is-active" : "icon-button"}
            onClick={() => setBubbleScale("boost")}
            aria-label="Bolhas ampliadas"
          >
            L
          </button>
        </div>
      </section>

      <div className="toolbar-summary">
        <span>{filterLabel}</span>
        <span>{sortLabel}</span>
        <span>{filteredBubbles.length} resultados visiveis</span>
      </div>

      <section className="market-stage">
        <div className="stage-board" ref={boardRef}>
          <div className="board-grid" />

          <div className="stage-topbar">
            <div className="stage-copy">
              <span className="badge">{badgeLabel}</span>
              <h1>Bubles Live Radar</h1>
              <p>
                Todas as partidas fortes ficam na tela principal e as maiores bolhas mostram as
                maiores probabilidades.
              </p>
            </div>

            <div className="stage-metrics">
              <article className="stage-chip">
                <span>Radar agora</span>
                <strong>{filteredBubbles.length || 0}</strong>
                <small>{liveCount ? `${liveCount} ao vivo` : "sem live agora"}</small>
              </article>
              <article className="stage-chip">
                <span>Maior chance</span>
                <strong>{leadChanceLabel}</strong>
                <small>{bestChanceGame ? bestChanceGame.game : "aguardando eventos"}</small>
              </article>
              <article className="stage-chip">
                <span>Fonte</span>
                <strong>{sourceLabel}</strong>
                <small>
                  {updatedAt
                    ? `Atualizado as ${new Date(updatedAt).toLocaleTimeString("pt-BR")}`
                    : emptyMessage}
                </small>
              </article>
            </div>
          </div>

          <div className="board-hud">
            <div className="board-hud-copy">
              <span className="section-kicker">Radar principal</span>
              <h2>{headlineText}</h2>
              <p>
                {serverMessage && serverMessage !== "ok"
                  ? serverMessage
                  : "O mapa principal prioriza os jogos mais importantes e deixa as laterais apenas como apoio."}
              </p>
            </div>

            <div className="board-hud-side">
              <article className="hud-card">
                <span>{refreshing ? "Atualizando" : "Sincronizado"}</span>
                <strong>{liveCount ? `${liveCount} ao vivo` : "Sem live agora"}</strong>
                <small>
                  {nextKickoffLabel !== "--" ? `Proximo foco ${nextKickoffLabel}` : emptyMessage}
                </small>
              </article>

              <div className="legend">
                <span className="legend-item is-high">alto</span>
                <span className="legend-item is-medium">medio</span>
                <span className="legend-item is-low">baixo</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="empty-state">
              <h3>Carregando radar...</h3>
              <p>Buscando livescores, probabilidades e cotacoes.</p>
            </div>
          ) : null}

          {!loading && !renderedBubbles.length ? (
            <div className="empty-state">
              <h3>{emptyMessage}</h3>
              <p>
                Se nao houver jogos compativeis com os filtros atuais ou a API limitar as
                consultas, o radar mostra esta mensagem.
              </p>
              {debugMessage ? <small className="debug-note">{debugMessage}</small> : null}
            </div>
          ) : null}

          {!loading &&
            renderedBubbles.map((bubble) => (
              <button
                key={bubble.id}
                type="button"
                className={
                  selectedId === bubble.id
                    ? `bubble is-${bubble.tier} is-selected`
                    : `bubble is-${bubble.tier}`
                }
                style={{
                  width: `${bubble.size}px`,
                  height: `${bubble.size}px`,
                  transform: `translate(${bubble.x}px, ${bubble.y}px)`,
                }}
                onClick={() => setSelectedId(bubble.id)}
              >
                <small className="bubble-game">{bubble.game}</small>
                <strong>{formatChance(bubble.probability)}</strong>
                <span>
                  {bubble.isLive
                    ? `${bubble.pickCode} | ${formatClock(bubble)} | ${bubble.scoreLine}`
                    : `${bubble.pickCode} | Odd ${formatOdd(bubble.oddHome)}`}
                </span>
              </button>
            ))}

          <aside className="floating-dock">
            <section className="dock-card">
              <span className="section-kicker">Radar lateral</span>
              <h3>Top 5 chances</h3>

              {topGames.length ? (
                <div className="top-list">
                  {topGames.map((game, index) => (
                    <button
                      key={game.id}
                      type="button"
                      className={selectedId === game.id ? "top-item is-active" : "top-item"}
                      onClick={() => setSelectedId(game.id)}
                    >
                      <div className="top-rank">{index + 1}</div>
                      <div className="top-copy">
                        <strong>{game.game}</strong>
                        <span>
                          {game.pickLabel} | {game.scoreLine} | {formatClock(game)}
                        </span>
                      </div>
                      <div className="top-ev">{formatChance(game.probability)}</div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="empty-inline">{emptyMessage}</div>
              )}
            </section>

            <section className="dock-card">
              <span className="section-kicker">Jogo selecionado</span>

              {selectedGame ? (
                <>
                  <h3>{selectedGame.game}</h3>

                  <div className="detail-grid">
                    <article>
                      <span>Leitura</span>
                      <strong>
                        {selectedGame.pickCode} - {selectedGame.pickLabel}
                      </strong>
                    </article>
                    <article>
                      <span>Chance</span>
                      <strong>{formatChance(selectedGame.probability)}</strong>
                    </article>
                    <article>
                      <span>Status</span>
                      <strong>{formatClock(selectedGame)}</strong>
                    </article>
                    <article>
                      <span>Odd</span>
                      <strong>{formatOdd(selectedGame.oddHome)}</strong>
                    </article>
                  </div>

                  <div className={`signal-card is-${selectedSignal.tone}`}>
                    <span className="signal-badge">Previsao</span>
                    <strong>{selectedSignal.title}</strong>
                    <p>{selectedSignal.note}</p>
                  </div>

                  <div className="micro-stats">
                    <article>
                      <span>EV</span>
                      <strong>{formatEv(selectedGame.ev)}</strong>
                    </article>
                    <article>
                      <span>Casa</span>
                      <strong>{selectedGame.bestBookmaker}</strong>
                    </article>
                    <article>
                      <span>Inicio</span>
                      <strong>{formatKickoff(selectedGame.commenceTime)}</strong>
                    </article>
                    <article>
                      <span>Liga</span>
                      <strong>{selectedGame.league}</strong>
                    </article>
                  </div>
                </>
              ) : (
                <div className="empty-inline">{emptyMessage}</div>
              )}
            </section>
          </aside>

          <div className="board-footer">
            <span>{filterLabel}</span>
            <span>{sortLabel}</span>
            <span>{sourceLabel}</span>
          </div>
        </div>
      </section>
    </div>
  );
}
