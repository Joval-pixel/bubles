import { useEffect, useMemo, useRef, useState } from "react";

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const formatEv = (value) => `${value > 0 ? "+" : ""}${value.toFixed(2).replace(".", ",")}`;
const formatMinute = (value) => `${Math.max(0, Math.round(value))}'`;
const formatOdd = (value) => value.toFixed(2).replace(".", ",");
const formatPercent = (value) => `${(value * 100).toFixed(1).replace(".", ",")}%`;

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
  const size = clamp(118 + game.ev * 240, 118, 270);
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

  const topGames = useMemo(
    () => [...bubbles].sort((left, right) => right.ev - left.ev).slice(0, 5),
    [bubbles]
  );

  const selectedGame = bubbles.find((item) => item.id === selectedId) ?? topGames[0] ?? null;
  const emptyMessage = "Sem jogos ao vivo";

  return (
    <div className="app-shell">
      <div className="glow glow-left" />
      <div className="glow glow-right" />

      <header className="header">
        <div className="header-copy">
          <span className="badge">Ao vivo</span>
          <h1>Bubles Live Radar</h1>
          <p>Radar com The Odds API, minuto estimado e EV por consenso de mercado.</p>
        </div>

        <div className="status-panel">
          <span>{refreshing ? "Atualizando..." : "Sincronizado"}</span>
          <strong>{bubbles.length ? `${bubbles.length} jogos ao vivo` : emptyMessage}</strong>
          <small>
            {updatedAt
              ? `Atualizado as ${new Date(updatedAt).toLocaleTimeString("pt-BR")}`
              : emptyMessage}
          </small>
        </div>
      </header>

      <main className="layout">
        <section className="board-shell">
          <div className="board-top">
            <div>
              <span className="section-kicker">Radar de oportunidades</span>
              <h2>Jogos ao vivo com cotacoes e EV</h2>
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
                <p>Buscando placares ao vivo e odds recentes.</p>
              </div>
            ) : null}

            {!loading && !bubbles.length ? (
              <div className="empty-state">
                <h3>{emptyMessage}</h3>
                <p>
                  Se nao houver jogos ao vivo nas ligas configuradas ou a API limitar as
                  consultas, o radar mostra esta mensagem.
                </p>
                {debugMessage ? <small className="debug-note">{debugMessage}</small> : null}
              </div>
            ) : null}

            {!loading &&
              bubbles.map((bubble) => (
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
                  <strong>{formatMinute(bubble.minute)}</strong>
                  <span>EV {formatEv(bubble.ev)}</span>
                </button>
              ))}
          </div>
        </section>

        <aside className="sidebar">
          <section className="sidebar-card">
            <span className="section-kicker">TOP 5 oportunidades</span>
            <h2>Melhores entradas ao vivo</h2>

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
                        {game.league} • {game.scoreLine} • {formatMinute(game.minute)}
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
                    <span>Minuto</span>
                    <strong>{formatMinute(selectedGame.minute)}</strong>
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
