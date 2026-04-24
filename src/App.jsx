import { startTransition, useDeferredValue, useEffect, useRef, useState } from "react";

const SEGMENTS = ["Todos", "AAA", "Indie", "Strategy", "Multiplayer", "Mobile"];
const SORTS = [
  { value: "ev", label: "Maior EV" },
  { value: "trend", label: "24h" },
  { value: "players", label: "Jogadores" },
];

const formatCompact = (value) =>
  new Intl.NumberFormat("pt-BR", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

const formatPercent = (value) =>
  `${value > 0 ? "+" : ""}${value.toFixed(1).replace(".", ",")}%`;

const formatEv = (value) =>
  `${value > 0 ? "+" : ""}${value.toFixed(2).replace(".", ",")}`;

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const calcEV = (game) => {
  const confidence = game.aiConfidence / 100;
  const winRate = game.winRate / 100;
  const margin = game.margin / 100;
  const trend = game.trend24h / 100;
  return (confidence * 0.4 + winRate * 0.25 + margin * 0.2 + trend * 0.15 - 0.45) * 3.2;
};

const createBubble = (game, index, bounds) => {
  const ev = calcEV(game);
  const volatility = Math.max(0.2, Math.abs(game.trend24h) / 14);
  const size = clamp(92 + Math.abs(ev) * 108 + Math.min(game.players / 1600, 72), 96, 240);
  const radius = size / 2;
  const width = Math.max(bounds.width, size + 40);
  const height = Math.max(bounds.height, size + 40);

  return {
    ...game,
    ev,
    size,
    radius,
    x: Math.random() * Math.max(40, width - size - 40),
    y: Math.random() * Math.max(40, height - size - 40),
    vx: (Math.random() - 0.5) * (0.7 + volatility),
    vy: (Math.random() - 0.5) * (0.7 + volatility),
  };
};

const updateBubbles = (items, bounds) => {
  const width = Math.max(bounds.width, 900);
  const height = Math.max(bounds.height, 620);

  const next = items.map((item) => {
    const moved = {
      ...item,
      x: item.x + item.vx,
      y: item.y + item.vy,
    };

    if (moved.x <= 0 || moved.x >= width - moved.size) {
      moved.vx *= -1;
      moved.x = clamp(moved.x, 0, width - moved.size);
    }

    if (moved.y <= 0 || moved.y >= height - moved.size) {
      moved.vy *= -1;
      moved.y = clamp(moved.y, 0, height - moved.size);
    }

    return moved;
  });

  for (let i = 0; i < next.length; i += 1) {
    for (let j = i + 1; j < next.length; j += 1) {
      const bubbleA = next[i];
      const bubbleB = next[j];
      const centerAX = bubbleA.x + bubbleA.radius;
      const centerAY = bubbleA.y + bubbleA.radius;
      const centerBX = bubbleB.x + bubbleB.radius;
      const centerBY = bubbleB.y + bubbleB.radius;
      const dx = centerAX - centerBX;
      const dy = centerAY - centerBY;
      const distance = Math.hypot(dx, dy) || 1;
      const minDistance = bubbleA.radius + bubbleB.radius + 8;

      if (distance >= minDistance) {
        continue;
      }

      const overlap = minDistance - distance;
      const normalX = dx / distance;
      const normalY = dy / distance;

      bubbleA.x += normalX * (overlap * 0.5);
      bubbleA.y += normalY * (overlap * 0.5);
      bubbleB.x -= normalX * (overlap * 0.5);
      bubbleB.y -= normalY * (overlap * 0.5);

      const swapVx = bubbleA.vx;
      const swapVy = bubbleA.vy;
      bubbleA.vx = bubbleB.vx * 0.98;
      bubbleA.vy = bubbleB.vy * 0.98;
      bubbleB.vx = swapVx * 0.98;
      bubbleB.vy = swapVy * 0.98;
    }
  }

  return next;
};

export default function App() {
  const boardRef = useRef(null);
  const frameRef = useRef(0);
  const boundsRef = useRef({ width: 0, height: 0 });

  const [bubbles, setBubbles] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [segment, setSegment] = useState("Todos");
  const [sortBy, setSortBy] = useState("ev");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const deferredQuery = useDeferredValue(query);

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
    const fetchGames = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch("/api/games");

        if (!response.ok) {
          throw new Error("Falha ao buscar dados");
        }

        const data = await response.json();
        const processed = data.map((game, index) =>
          createBubble(game, index, boundsRef.current)
        );

        setBubbles(processed);
        setSelectedId(processed[0]?.id ?? null);
      } catch (err) {
        setError("Não consegui carregar o radar agora.");
      } finally {
        setLoading(false);
      }
    };

    fetchGames();
  }, []);

  useEffect(() => {
    if (!bubbles.length) {
      return undefined;
    }

    const animate = () => {
      setBubbles((current) => updateBubbles(current, boundsRef.current));
      frameRef.current = window.requestAnimationFrame(animate);
    };

    frameRef.current = window.requestAnimationFrame(animate);

    return () => {
      window.cancelAnimationFrame(frameRef.current);
    };
  }, [bubbles.length]);

  const visibleBubbles = bubbles
    .filter((bubble) => {
      const matchesSegment = segment === "Todos" || bubble.segment === segment;
      const matchesQuery =
        !deferredQuery ||
        `${bubble.name} ${bubble.symbol} ${bubble.segment}`
          .toLowerCase()
          .includes(deferredQuery.toLowerCase());

      return matchesSegment && matchesQuery;
    })
    .sort((left, right) => {
      if (sortBy === "players") {
        return right.players - left.players;
      }

      if (sortBy === "trend") {
        return right.trend24h - left.trend24h;
      }

      return right.ev - left.ev;
    });

  useEffect(() => {
    if (!visibleBubbles.length) {
      setSelectedId(null);
      return;
    }

    const stillVisible = visibleBubbles.some((bubble) => bubble.id === selectedId);

    if (!stillVisible) {
      setSelectedId(visibleBubbles[0].id);
    }
  }, [selectedId, visibleBubbles]);

  const selectedBubble =
    visibleBubbles.find((bubble) => bubble.id === selectedId) ?? visibleBubbles[0] ?? null;

  const positives = visibleBubbles.filter((bubble) => bubble.ev > 0).length;
  const averageEv = visibleBubbles.length
    ? visibleBubbles.reduce((sum, bubble) => sum + bubble.ev, 0) / visibleBubbles.length
    : 0;

  return (
    <div className="app-shell">
      <div className="ambient ambient-a" />
      <div className="ambient ambient-b" />
      <div className="ambient ambient-c" />

      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">B</div>
          <div>
            <p className="kicker">Bubles radar</p>
            <h1>Bubble board com cara de produto real</h1>
          </div>
        </div>

        <div className="topbar-meta">
          <span>Visual inspirado em market map</span>
          <span>React + Vite + API</span>
        </div>
      </header>

      <section className="hero-strip">
        <article className="hero-card hero-card-strong">
          <p className="kicker">Leitura rápida</p>
          <h2>Seu site precisa abrir como um painel vivo, não como uma página parada.</h2>
          <p>
            Esta versão troca o topo editorial por um radar interativo de bubbles, com
            movimento contínuo, filtros, seleção e painel lateral.
          </p>
        </article>

        <article className="hero-card">
          <strong>{visibleBubbles.length}</strong>
          <span>ativos no radar</span>
        </article>

        <article className="hero-card">
          <strong>{formatEv(averageEv)}</strong>
          <span>EV médio</span>
        </article>

        <article className="hero-card">
          <strong>{positives}</strong>
          <span>bubbles positivas</span>
        </article>
      </section>

      <section className="controls-panel">
        <div className="search-shell">
          <label htmlFor="search" className="sr-only">
            Buscar item
          </label>
          <input
            id="search"
            type="search"
            placeholder="Buscar por nome, símbolo ou segmento"
            value={query}
            onChange={(event) => {
              const nextValue = event.target.value;
              startTransition(() => {
                setQuery(nextValue);
              });
            }}
          />
        </div>

        <div className="chip-row">
          {SEGMENTS.map((item) => (
            <button
              key={item}
              type="button"
              className={segment === item ? "chip is-active" : "chip"}
              onClick={() => setSegment(item)}
            >
              {item}
            </button>
          ))}
        </div>

        <div className="sort-shell">
          <label htmlFor="sort-by">Ordenar</label>
          <select id="sort-by" value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </section>

      <main className="dashboard">
        <section className="board-panel">
          <div className="board-header">
            <div>
              <p className="kicker">Radar</p>
              <h2>Mapa de bolhas com movimento contínuo</h2>
            </div>

            <div className="legend">
              <span className="legend-dot legend-up" />
              <small>positivo</small>
              <span className="legend-dot legend-down" />
              <small>pressionado</small>
            </div>
          </div>

          <div className="board" ref={boardRef}>
            <div className="grid grid-x" />
            <div className="grid grid-y" />

            {loading && <div className="state-card">Carregando radar...</div>}
            {error && <div className="state-card is-error">{error}</div>}

            {!loading &&
              !error &&
              visibleBubbles.map((bubble, index) => (
                <button
                  key={bubble.id}
                  type="button"
                  className={
                    selectedId === bubble.id
                      ? `bubble ${bubble.ev >= 0 ? "is-up" : "is-down"} is-selected`
                      : `bubble ${bubble.ev >= 0 ? "is-up" : "is-down"}`
                  }
                  style={{
                    width: `${bubble.size}px`,
                    height: `${bubble.size}px`,
                    transform: `translate(${bubble.x}px, ${bubble.y}px)`,
                    animationDelay: `${index * 120}ms`,
                  }}
                  onClick={() => setSelectedId(bubble.id)}
                >
                  <span className="bubble-symbol">{bubble.symbol}</span>
                  <strong>{formatPercent(bubble.trend24h)}</strong>
                  <small>EV {formatEv(bubble.ev)}</small>
                </button>
              ))}
          </div>
        </section>

        <aside className="detail-panel">
          {selectedBubble ? (
            <>
              <div className="detail-top">
                <div>
                  <p className="kicker">Selecionado</p>
                  <h3>{selectedBubble.name}</h3>
                </div>
                <span className="symbol-pill">{selectedBubble.symbol}</span>
              </div>

              <p className="detail-summary">{selectedBubble.summary}</p>

              <div className="metric-list">
                <div className="metric-card">
                  <span>EV</span>
                  <strong>{formatEv(selectedBubble.ev)}</strong>
                </div>
                <div className="metric-card">
                  <span>24h</span>
                  <strong>{formatPercent(selectedBubble.trend24h)}</strong>
                </div>
                <div className="metric-card">
                  <span>Jogadores</span>
                  <strong>{formatCompact(selectedBubble.players)}</strong>
                </div>
                <div className="metric-card">
                  <span>Preço</span>
                  <strong>
                    {selectedBubble.price > 0
                      ? `R$ ${selectedBubble.price.toFixed(2).replace(".", ",")}`
                      : "Free"}
                  </strong>
                </div>
              </div>

              <div className="detail-bars">
                <div className="bar-row">
                  <div className="bar-copy">
                    <span>Confiança da IA</span>
                    <strong>{selectedBubble.aiConfidence}%</strong>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill is-cyan"
                      style={{ width: `${selectedBubble.aiConfidence}%` }}
                    />
                  </div>
                </div>

                <div className="bar-row">
                  <div className="bar-copy">
                    <span>Taxa de vitória</span>
                    <strong>{selectedBubble.winRate}%</strong>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill is-emerald"
                      style={{ width: `${selectedBubble.winRate}%` }}
                    />
                  </div>
                </div>

                <div className="bar-row">
                  <div className="bar-copy">
                    <span>Margem</span>
                    <strong>{selectedBubble.margin.toFixed(1).replace(".", ",")}%</strong>
                  </div>
                  <div className="bar-track">
                    <div
                      className="bar-fill is-gold"
                      style={{ width: `${Math.min(selectedBubble.margin * 3, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="detail-grid">
                <article className="mini-panel">
                  <span>Segmento</span>
                  <strong>{selectedBubble.segment}</strong>
                </article>
                <article className="mini-panel">
                  <span>Janela</span>
                  <strong>{selectedBubble.releaseWindow}</strong>
                </article>
              </div>
            </>
          ) : (
            <div className="state-card">Nenhuma bubble encontrada.</div>
          )}
        </aside>
      </main>
    </div>
  );
}
