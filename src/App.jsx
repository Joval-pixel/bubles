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
    return size * 0.82;
  }

  if (scaleMode === "boost") {
    return clamp(size * 1.15, 128, 320);
  }

  return size;
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
        note: "A leitura do mercado aponta alta chance para o resultado selecionado neste jogo.",
      };
    }

    if ((game.probability || 0) >= 0.52) {
      return {
        tone: "watch",
        title: "Jogo monitoravel",
        note: "Existe um lado ligeiramente favorito, mas ainda com equilibrio relevante no confronto.",
      };
    }

    return {
      tone: "bad",
      title: "Leitura instavel",
      note: "O mercado nao mostra um favoritismo tao claro neste momento.",
    };
  }

  if ((game.probability || 0) >= 0.62) {
    return {
      tone: "good",
      title: "Resultado forte",
      note: "Pre-jogo com uma probabilidade alta para o desfecho destacado pelo radar.",
    };
  }

  if ((game.probability || 0) >= 0.5) {
    return {
      tone: "watch",
      title: "Favoritismo moderado",
      note: "O mercado ve uma leve frente para esse resultado, mas sem dominancia total.",
    };
  }

  return {
    tone: "bad",
    title: "Jogo equilibrado",
    note: "As probabilidades estao mais espalhadas e nao formam uma lideranca forte.",
  };
};

const getLayoutPosition = (index, total, bounds, size) => {
  const width = Math.max(bounds.width || 0, 900);
  const height = Math.max(bounds.height || 0, 620);
  const columns = Math.max(1, Math.min(4, Math.floor(width / 240)));
  const rows = Math.max(1, Math.ceil(total / columns));
  const topPadding = 42;
  const bottomPadding = 28;
  const usableHeight = Math.max(220, height - topPadding - bottomPadding);
  const cellWidth = width / columns;
  const cellHeight = usableHeight / rows;
  const column = index % columns;
  const row = Math.floor(index / columns);
  const x = column * cellWidth + (cellWidth - size) / 2;
  const y = topPadding + row * cellHeight + (cellHeight - size) / 2;

  return {
    x: clamp(x, 0, width - size),
    y: clamp(y, 0, height - size),
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

const createBubble = (game, existing, bounds, index) => {
  const bubbleStrength = clamp(game.bubbleValue ?? game.probability ?? 0, 0.08, 0.92);
  const size = clamp(86 + bubbleStrength * 300 + (game.isLive ? 16 : 0), 86, 336);
  const safeWidth = Math.max(bounds.width || 0, size + 40);
  const safeHeight = Math.max(bounds.height || 0, size + 40);

  return {
    ...game,
    tier: getTier(bubbleStrength),
    size,
    radius: size / 2,
    x: existing?.x ?? Math.random() * Math.max(40, safeWidth - size - 40),
    y: existing?.y ?? Math.random() * Math.max(40, safeHeight - size - 40),
    vx: existing?.vx ?? ((Math.random() - 0.5) * (0.65 + (index % 5) * 0.12) || 0.4),
    vy: existing?.vy ?? ((Math.random() - 0.5) * (0.65 + (index % 4) * 0.14) || -0.4),
  };
};

const moveBubbles = (items, bounds) => {
  const width = Math.max(bounds.width || 0, 900);
  const height = Math.max(bounds.height || 0, 620);

  const next = items.map((item) => {
    const bubble = {
      ...item,
      x: item.x + item.vx,
      y: item.y + item.vy,
    };

    if (bubble.x <= 0 || bubble.x >= width - bubble.size) {
      bubble.vx *= -1;
      bubble.x = clamp(bubble.x, 0, width - bubble.size);
    }

    if (bubble.y <= 0 || bubble.y >= height - bubble.size) {
      bubble.vy *= -1;
      bubble.y = clamp(bubble.y, 0, height - bubble.size);
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
      const minDistance = first.radius + second.radius + 8;

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
  const [rangeFilter, setRangeFilter] = useState("all");
  const [sortMode, setSortMode] = useState("probability");
  const [bubbleScale, setBubbleScale] = useState("smart");

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
            createBubble(item, currentMap.get(item.id), boundsRef.current, index)
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

  const renderedBubbles = useMemo(() => {
    return filteredBubbles.map((item) => {
      return item;
    }).map((item) => {
      const displaySize = getDisplaySize(item.size, bubbleScale);

      return {
        ...item,
        size: displaySize,
        radius: displaySize / 2,
      };
    });
  }, [bubbleScale, filteredBubbles]);

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
  const badgeLabel = hasLiveGames ? "Ao vivo" : filteredBubbles.length ? "Proximos" : "Ao vivo";
  const headlineText = hasLiveGames
    ? "Radar ao vivo por probabilidade"
    : "Pre-jogo por probabilidade";
  const filterLabel = getFilterLabel(statusFilter, rangeFilter);
  const sortLabel = getSortLabel(sortMode);
  const selectedSignal = getSignal(selectedGame);

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

      <header className="header">
        <div className="header-copy">
          <span className="badge">{badgeLabel}</span>
          <h1>Bubles Live Radar</h1>
          <p>Radar com The Odds API, bolhas por probabilidade e leitura mais forte em destaque.</p>
        </div>

        <div className="status-panel">
          <span>{refreshing ? "Atualizando..." : "Sincronizado"}</span>
          <strong>
            {filteredBubbles.length ? `${filteredBubbles.length} jogos no radar` : emptyMessage}
          </strong>
          <small>
            {updatedAt
              ? `Atualizado as ${new Date(updatedAt).toLocaleTimeString("pt-BR")}`
              : emptyMessage}
          </small>
          {serverMessage && serverMessage !== "ok" ? <small>{serverMessage}</small> : null}
          {debugMessage ? <small>{debugMessage}</small> : null}
        </div>
      </header>

      <main className="layout">
        <section className="board-shell">
          <div className="board-top">
            <div>
              <span className="section-kicker">Radar de probabilidades</span>
              <h2>{headlineText}</h2>
            </div>

            <div className="legend">
              <span className="legend-item is-high">alto</span>
              <span className="legend-item is-medium">medio</span>
              <span className="legend-item is-low">baixo</span>
            </div>
          </div>

          <div className="board" ref={boardRef}>
            <div className="board-grid" />

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
          </div>
        </section>

        <aside className="sidebar">
          <section className="sidebar-card">
            <span className="section-kicker">TOP 5 probabilidades</span>
            <h2>Jogos mais fortes</h2>

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
                        {game.league} | {game.pickLabel} | {game.scoreLine} | {formatClock(game)} | Chance {formatChance(game.probability)}
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

          <section className="sidebar-card">
            <span className="section-kicker">Detalhes</span>
            {selectedGame ? (
              <>
                <h2>{selectedGame.game}</h2>
                <div className="detail-metrics">
                  <article>
                    <span>Placar</span>
                    <strong>{selectedGame.scoreLine}</strong>
                  </article>
                  <article>
                    <span>Status</span>
                    <strong>{formatClock(selectedGame)}</strong>
                  </article>
                  <article>
                    <span>Leitura</span>
                    <strong>{selectedGame.pickCode} - {selectedGame.pickLabel}</strong>
                  </article>
                  <article>
                    <span>Chance</span>
                    <strong>{formatChance(selectedGame.probability)}</strong>
                  </article>
                  <article>
                    <span>Melhor odd</span>
                    <strong>{formatOdd(selectedGame.oddHome)}</strong>
                  </article>
                </div>

                <div className={`signal-card is-${selectedSignal.tone}`}>
                  <span className="signal-badge">Previsao</span>
                  <strong>{selectedSignal.title}</strong>
                  <p>{selectedSignal.note}</p>
                </div>

                <div className="stat-grid">
                  <article>
                    <span>EV</span>
                    <strong>{formatEv(selectedGame.ev)}</strong>
                  </article>
                  <article>
                    <span>Casa</span>
                    <strong>{selectedGame.bestBookmaker}</strong>
                  </article>
                  <article>
                    <span>Prob. mercado</span>
                    <strong>{formatPercent(selectedGame.marketProbability || selectedGame.probability)}</strong>
                  </article>
                  <article>
                    <span>Odd justa</span>
                    <strong>{formatOdd(selectedGame.fairOdd)}</strong>
                  </article>
                  <article>
                    <span>Edge</span>
                    <strong>{formatOdd(selectedGame.marketEdge)}</strong>
                  </article>
                  <article>
                    <span>Liga</span>
                    <strong>{selectedGame.league}</strong>
                  </article>
                  <article>
                    <span>Inicio</span>
                    <strong>{formatKickoff(selectedGame.commenceTime)}</strong>
                  </article>
                  <article>
                    <span>Fonte</span>
                    <strong>{selectedGame.source}</strong>
                  </article>
                </div>
              </>
            ) : (
              <div className="empty-inline">{emptyMessage}</div>
            )}
          </section>
        </aside>
      </main>
    </div>
  );
}
