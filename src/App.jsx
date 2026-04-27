import { useEffect, useMemo, useRef, useState } from "react";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const formatEv = (value) => `${value > 0 ? "+" : ""}${value.toFixed(2).replace(".", ",")}`;
const formatMinute = (value) => `${Math.max(0, Math.round(value))}'`;
const formatOdd = (value) => value.toFixed(2).replace(".", ",");
const formatPercent = (value) => `${(value * 100).toFixed(1).replace(".", ",")}%`;
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
    positive: "somente EV positivo",
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
    ev: "ordenado por EV",
    odd: "ordenado por odds",
    kickoff: "ordenado por horario",
  };

  return labelMap[sortMode] ?? "ordenado por EV";
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
    if (game.ev >= 0.12) {
      return {
        tone: "good",
        title: "Pressao favoravel",
        note: "Jogo ao vivo com leitura positiva para buscar entrada na casa.",
      };
    }

    if (game.ev >= 0) {
      return {
        tone: "watch",
        title: "Observacao ativa",
        note: "Existe algum valor, mas o edge ainda e curto para agressividade total.",
      };
    }

    return {
      tone: "bad",
      title: "Sem valor agora",
      note: "O mercado esta mais forte que a leitura de pressao atual.",
    };
  }

  if (game.ev >= 0.08) {
    return {
      tone: "good",
      title: "Back casa",
      note: "A odd da casa esta acima da odd justa calculada pelo consenso.",
    };
  }

  if (game.probability >= 0.5) {
    return {
      tone: "watch",
      title: "Casa favorita",
      note: "O mercado ve favoritismo da casa, mas ainda sem edge claro.",
    };
  }

  return {
    tone: "bad",
    title: "Sem valor pre-jogo",
    note: "As cotacoes atuais nao estao entregando vantagem estatistica.",
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

const getTier = (ev) => {
  if (ev >= 0.18) {
    return "high";
  }

  if (ev >= 0) {
    return "medium";
  }

  return "low";
};

const createBubble = (game, existing, bounds, index) => {
  const size = clamp(118 + Math.max(game.ev, 0) * 240, 118, 270);
  const safeWidth = Math.max(bounds.width || 0, size + 40);
  const safeHeight = Math.max(bounds.height || 0, size + 40);

  return {
    ...game,
    tier: getTier(game.ev),
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
  const [sortMode, setSortMode] = useState("ev");
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
    } else if (statusFilter === "positive") {
      items = items.filter((item) => item.ev > 0);
    }

    if (rangeFilter === "top5") {
      items = [...items].sort((left, right) => right.ev - left.ev).slice(0, 5);
    } else if (rangeFilter === "top10") {
      items = [...items].sort((left, right) => right.ev - left.ev).slice(0, 10);
    } else if (rangeFilter === "today") {
      const today = new Date().toLocaleDateString("pt-BR");
      items = items.filter((item) => {
        if (!item.commenceTime) {
          return false;
        }

        return new Date(item.commenceTime).toLocaleDateString("pt-BR") === today;
      });
    }

    if (sortMode === "odd") {
      items.sort((left, right) => right.oddHome - left.oddHome);
    } else if (sortMode === "kickoff") {
      items.sort(
        (left, right) =>
          new Date(left.commenceTime || 0).getTime() - new Date(right.commenceTime || 0).getTime()
      );
    } else {
      items.sort((left, right) => right.ev - left.ev);
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
    () => [...filteredBubbles].sort((left, right) => right.ev - left.ev).slice(0, 5),
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
  const positiveCount = bubbles.filter((item) => item.ev > 0).length;
  const hasAnyGames = bubbles.length > 0;
  const emptyMessage = hasAnyGames ? "Sem jogos para este filtro" : "Sem jogos ao vivo";
  const hasLiveGames = filteredBubbles.some((item) => item.isLive);
  const badgeLabel = hasLiveGames ? "Ao vivo" : filteredBubbles.length ? "Proximos" : "Ao vivo";
  const headlineText = hasLiveGames
    ? "Jogos ao vivo com cotacoes e EV"
    : "Proximos jogos com cotacoes e EV";
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
            className={statusFilter === "positive" ? "chip-button is-active" : "chip-button"}
            onClick={() => setStatusFilter("positive")}
          >
            EV+ {positiveCount}
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
            className={sortMode === "ev" ? "chip-button is-neutral is-active" : "chip-button is-neutral"}
            onClick={() => setSortMode("ev")}
          >
            EV
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
          <p>Radar com SportMonks para jogos ao vivo e proximos jogos com cotacoes.</p>
        </div>

        <div className="status-panel">
          <span>{refreshing ? "Atualizando..." : "Sincronizado"}</span>
          <strong>
            {filteredBubbles.length ? `${filteredBubbles.length} jogos com cotacoes` : emptyMessage}
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
              <span className="section-kicker">Radar de oportunidades</span>
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
                <h3>Carregando oportunidades...</h3>
                <p>Buscando livescores, estatisticas e cotacoes.</p>
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
                  <strong>{formatClock(bubble)}</strong>
                  <span>EV {formatEv(bubble.ev)}</span>
                </button>
              ))}
          </div>
        </section>

        <aside className="sidebar">
          <section className="sidebar-card">
            <span className="section-kicker">TOP 5 oportunidades</span>
            <h2>Melhores entradas</h2>

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
                        {game.league} | {game.scoreLine} | {formatClock(game)}
                      </span>
                    </div>
                    <div className="top-ev">EV {formatEv(game.ev)}</div>
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
                    <span>EV</span>
                    <strong>{formatEv(selectedGame.ev)}</strong>
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
                    <span>Casa</span>
                    <strong>{selectedGame.bestBookmaker}</strong>
                  </article>
                  <article>
                    <span>Prob. consenso</span>
                    <strong>{formatPercent(selectedGame.probability)}</strong>
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
