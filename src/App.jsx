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
  { label: "Patrocinador master", title: "Espaco premium", note: "Topo do radar da Copa 2026" },
  { label: "Odds parceiras", title: "Disponivel", note: "Cota principal por jogo" },
  { label: "Publicidade", title: "Cota lateral", note: "Marca visivel no mapa" },
];

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
const formatChance = (value) => `${Math.round((value || 0) * 100)}%`;
const formatOdd = (value) =>
  value && Number.isFinite(value) && value > 0 ? value.toFixed(2).replace(".", ",") : "--";

const formatClock = (game) => {
  if (game?.isLive) return `${Math.max(1, Math.round(game.minute || 1))}'`;
  if (game?.isFinished) return "FT";
  return "PRE";
};

const getTier = (probability) => {
  if (probability >= 0.62) return "high";
  if (probability >= 0.44) return "medium";
  return "low";
};

const getDisplaySize = (probability, scale) => {
  const base = 52 + clamp(probability || 0.33, 0.05, 0.9) * 185;
  if (scale === "large") return clamp(base * 1.14, 78, 260);
  if (scale === "small") return clamp(base * 0.74, 48, 172);
  return clamp(base * 0.9, 58, 214);
};

const getInitialPosition = (index, total, bounds, size) => {
  const width = Math.max(bounds.width || 0, 1280);
  const height = Math.max(bounds.height || 0, 660);
  const angle = index * 2.399963229728653;
  const orbit = Math.sqrt(index + 1) * (width > 900 ? 52 : 38);
  const centerX = width / 2;
  const centerY = height / 2;

  return {
    x: clamp(centerX + Math.cos(angle) * orbit * 1.45 - size / 2, 12, width - size - 12),
    y: clamp(centerY + Math.sin(angle) * orbit * 0.92 - size / 2, 12, height - size - 12),
  };
};

const createBubble = (game, existing, bounds, index, total, scale) => {
  const size = getDisplaySize(game.bubbleValue ?? game.probability, scale);
  const position = existing ?? getInitialPosition(index, total, bounds, size);

  return {
    ...game,
    size,
    radius: size / 2,
    tier: getTier(game.bubbleValue ?? game.probability),
    x: position.x,
    y: position.y,
    vx: existing?.vx ?? ((index % 2 ? 1 : -1) * (0.22 + (index % 7) * 0.035)),
    vy: existing?.vy ?? ((index % 3 ? 1 : -1) * (0.18 + (index % 5) * 0.035)),
  };
};

const moveBubbles = (items, bounds) => {
  const width = Math.max(bounds.width || 0, 1280);
  const height = Math.max(bounds.height || 0, 660);

  const next = items.map((item) => {
    const bubble = { ...item, x: item.x + item.vx, y: item.y + item.vy };

    if (bubble.x <= 8 || bubble.x >= width - bubble.size - 8) {
      bubble.vx *= -1;
      bubble.x = clamp(bubble.x, 8, width - bubble.size - 8);
    }

    if (bubble.y <= 8 || bubble.y >= height - bubble.size - 8) {
      bubble.vy *= -1;
      bubble.y = clamp(bubble.y, 8, height - bubble.size - 8);
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
      const minDistance = first.radius + second.radius + 3;

      if (distance < minDistance) {
        const overlap = minDistance - distance;
        const normalX = dx / distance;
        const normalY = dy / distance;
        first.x += normalX * overlap * 0.5;
        first.y += normalY * overlap * 0.5;
        second.x -= normalX * overlap * 0.5;
        second.y -= normalY * overlap * 0.5;
      }
    }
  }

  return next;
};

const getAiSummary = (game) => {
  if (game?.aiInsights?.headline) return game.aiInsights.headline;

  const leader = game?.marketOptions?.[0];
  const second = game?.marketOptions?.[1];
  const gap = Math.max(0, (leader?.probability || 0) - (second?.probability || 0));

  if (!leader) return "Sem leitura completa ainda";
  if (game?.confidence === "estimate") return `Modelo visual favorece ${leader.label}`;
  if (gap >= 0.16) return `Mercado forte para ${leader.label}`;
  return `Jogo competitivo, leve vantagem para ${leader.label}`;
};

function WidgetsPage() {
  const [sport, setSport] = useState("football");
  const widgetKey = import.meta.env.VITE_API_FOOTBALL_WIDGET_KEY || "";

  return (
    <div className="widgets-page">
      <header className="widgets-toolbar">
        <a className="widgets-brand" href="/">
          <img className="brand-logo" src="/logo-bubles-transparent.png" alt="Bubles" />
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

        <a className="chip-link" href="/">Voltar ao radar</a>
      </header>

      {!widgetKey ? (
        <div className="widgets-warning">
          Configure <strong>VITE_API_FOOTBALL_WIDGET_KEY</strong> no Vercel para carregar os widgets oficiais.
        </div>
      ) : null}

      <main className="widgets-grid">
        <section className="widgets-panel widgets-leagues">
          <api-sports-widget key={`leagues-${sport}`} data-type="leagues" data-sport={sport} />
        </section>

        <section id="games-list" className="widgets-panel widgets-games">
          <api-sports-widget key={`games-${sport}`} data-type="games" data-sport={sport} />
        </section>

        <aside className="widgets-side">
          <section id="standings-content" className="widgets-panel" />
          <section id="team-content" className="widgets-panel" />
          <section id="game-content" className="widgets-panel">
            <api-sports-widget key={`game-${sport}`} data-type="game" data-sport={sport} />
          </section>
        </aside>
      </main>

      <api-sports-widget
        key={`config-${sport}`}
        data-type="config"
        data-sport={sport}
        data-key={widgetKey}
        data-lang="pt"
        data-theme="grey"
        data-show-error="true"
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
    </div>
  );
}

function BubblesWorldCup() {
  const boardRef = useRef(null);
  const animationRef = useRef(0);
  const boundsRef = useRef({ width: 0, height: 0 });

  const [games, setGames] = useState([]);
  const [selectedId, setSelectedId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState("");
  const [message, setMessage] = useState("");
  const [debug, setDebug] = useState("");
  const [mode, setMode] = useState("today");
  const [filter, setFilter] = useState("all");
  const [sort, setSort] = useState("time");
  const [scale, setScale] = useState("small");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const syncBounds = () => {
      if (!boardRef.current) return;
      const rect = boardRef.current.getBoundingClientRect();
      boundsRef.current = { width: rect.width, height: rect.height };
    };

    syncBounds();
    window.addEventListener("resize", syncBounds);
    return () => window.removeEventListener("resize", syncBounds);
  }, []);

  useEffect(() => {
    let mounted = true;

    const fetchGames = async (silent = false) => {
      if (silent) setRefreshing(true);
      else setLoading(true);

      try {
        const response = await fetch(`/api/games?mode=${mode}`, { cache: "no-store" });
        const payload = await response.json();
        const items = Array.isArray(payload?.games) ? payload.games : [];

        if (!mounted) return;

        setUpdatedAt(payload?.updatedAt || "");
        setMessage(payload?.message || "");
        setDebug(payload?.debug || "");

        setGames((current) => {
          const currentMap = new Map(current.map((item) => [item.id, item]));
          return items.map((item, index) =>
            createBubble(item, currentMap.get(item.id), boundsRef.current, index, items.length, scale)
          );
        });

        setSelectedId((current) =>
          items.some((item) => item.id === current) ? current : items[0]?.id ?? null
        );
      } catch (_error) {
        if (!mounted) return;
        setGames([]);
        setSelectedId(null);
        setMessage(mode === "today" ? "Falha ao carregar jogos de hoje" : "Falha ao carregar a Copa 2026");
        setDebug("Nao foi possivel consultar /api/games");
      } finally {
        if (!mounted) return;
        setLoading(false);
        setRefreshing(false);
      }
    };

    fetchGames(false);
    const timer = window.setInterval(() => fetchGames(true), 240000);

    return () => {
      mounted = false;
      window.clearInterval(timer);
    };
  }, [mode, scale]);

  useEffect(() => {
    setFilter("all");
    setSelectedId(null);
  }, [mode]);

  useEffect(() => {
    if (!games.length) return undefined;

    const animate = () => {
      setGames((current) => moveBubbles(current, boundsRef.current));
      animationRef.current = window.requestAnimationFrame(animate);
    };

    animationRef.current = window.requestAnimationFrame(animate);
    return () => window.cancelAnimationFrame(animationRef.current);
  }, [games.length]);

  const filteredGames = useMemo(() => {
    const text = query.trim().toLowerCase();
    let items = [...games];

    if (text) {
      items = items.filter((game) =>
        `${game.game} ${game.round} ${game.venue} ${game.city}`.toLowerCase().includes(text)
      );
    }

    if (filter === "live") items = items.filter((game) => game.isLive);
    else if (filter === "pre") items = items.filter((game) => !game.isLive && !game.isFinished);
    else if (filter === "finished") items = items.filter((game) => game.isFinished);
    else if (filter === "groups") items = items.filter((game) => game.stage === "groups");
    else if (filter === "knockout") items = items.filter((game) => game.stage === "knockout");
    else if (filter === "odds") items = items.filter((game) => game.hasOdds);
    else if (filter === "sponsors") items = items.filter((game) => (game.probability || 0) >= 0.5);

    if (sort === "chance") {
      items.sort((left, right) => (right.probability || 0) - (left.probability || 0));
    } else if (sort === "live") {
      items.sort((left, right) => Number(right.isLive) - Number(left.isLive));
    } else {
      items.sort(
        (left, right) =>
          new Date(left.commenceTime || 0).getTime() -
          new Date(right.commenceTime || 0).getTime()
      );
    }

    return items;
  }, [filter, games, query, sort]);

  const selectedGame =
    filteredGames.find((game) => game.id === selectedId) ?? filteredGames[0] ?? games[0] ?? null;

  const liveCount = games.filter((game) => game.isLive).length;
  const preCount = games.filter((game) => !game.isLive && !game.isFinished).length;
  const finishedCount = games.filter((game) => game.isFinished).length;
  const oddsCount = games.filter((game) => game.hasOdds).length;
  const groupsCount = games.filter((game) => game.stage === "groups").length;
  const knockoutCount = games.filter((game) => game.stage === "knockout").length;

  const topGames = [...filteredGames]
    .sort((left, right) => (right.probability || 0) - (left.probability || 0))
    .slice(0, 5);

  const selectedOptions = selectedGame?.marketOptions ?? [];
  const selectedMarkets = selectedGame?.betMarkets ?? [];
  const aiInsights = selectedGame?.aiInsights ?? {};

  useEffect(() => {
    if (!filteredGames.length) return;

    const visibleIds = filteredGames.map((game) => game.id);

    setGames((current) =>
      current.map((game) => {
        const visibleIndex = visibleIds.indexOf(game.id);
        if (visibleIndex === -1) return game;

        const size = getDisplaySize(game.bubbleValue ?? game.probability, scale);
        const position = getInitialPosition(visibleIndex, visibleIds.length, boundsRef.current, size);

        return { ...game, size, radius: size / 2, x: position.x, y: position.y };
      })
    );
  }, [filter, query, scale, sort, updatedAt, filteredGames.length]);

  return (
    <div className="cup-shell">
      <header className="cup-toolbar">
        <a className="cup-brand" href="/">
          <img className="brand-logo" src="/logo-bubles-transparent.png" alt="Bubles" />
          <strong className="brand-context">{mode === "today" ? "AO VIVO" : "COPA 2026"}</strong>
        </a>

        <input
          className="cup-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Buscar selecao, jogo, estadio"
          type="search"
        />

        <nav className="cup-controls mode-controls" aria-label="Modo do radar">
          <button className={mode === "today" ? "chip-button is-active" : "chip-button"} onClick={() => setMode("today")} type="button">
            Jogos de hoje
          </button>
          <button className={mode === "worldcup" ? "chip-button is-active" : "chip-button"} onClick={() => setMode("worldcup")} type="button">
            Copa 2026
          </button>
        </nav>

        <nav className="cup-controls" aria-label="Filtros">
          <button className={filter === "all" ? "chip-button is-active" : "chip-button"} onClick={() => setFilter("all")} type="button">
            Todos {games.length}
          </button>
          <button className={filter === "live" ? "chip-button is-active" : "chip-button"} onClick={() => setFilter("live")} type="button">
            Ao vivo {liveCount}
          </button>

          {mode === "today" ? (
            <>
              <button className={filter === "pre" ? "chip-button is-active" : "chip-button"} onClick={() => setFilter("pre")} type="button">
                Pre {preCount}
              </button>
              <button className={filter === "finished" ? "chip-button is-active" : "chip-button"} onClick={() => setFilter("finished")} type="button">
                Fim {finishedCount}
              </button>
            </>
          ) : (
            <>
              <button className={filter === "groups" ? "chip-button is-active" : "chip-button"} onClick={() => setFilter("groups")} type="button">
                Grupos {groupsCount}
              </button>
              <button className={filter === "knockout" ? "chip-button is-active" : "chip-button"} onClick={() => setFilter("knockout")} type="button">
                Mata-mata {knockoutCount}
              </button>
            </>
          )}

          <button className={filter === "odds" ? "chip-button is-active" : "chip-button"} onClick={() => setFilter("odds")} type="button">
            Odds {oddsCount}
          </button>
          <button className={filter === "sponsors" ? "chip-button is-active" : "chip-button"} onClick={() => setFilter("sponsors")} type="button">
            Comercial
          </button>
        </nav>

        <nav className="cup-controls compact" aria-label="Ordenacao">
          <button className={sort === "time" ? "chip-button is-neutral is-active" : "chip-button is-neutral"} onClick={() => setSort("time")} type="button">
            Hora
          </button>
          <button className={sort === "chance" ? "chip-button is-neutral is-active" : "chip-button is-neutral"} onClick={() => setSort("chance")} type="button">
            Chance
          </button>
          <button className={scale === "small" ? "icon-button is-active" : "icon-button"} onClick={() => setScale("small")} type="button">
            S
          </button>
          <button className={scale === "normal" ? "icon-button is-active" : "icon-button"} onClick={() => setScale("normal")} type="button">
            M
          </button>
          <button className={scale === "large" ? "icon-button is-active" : "icon-button"} onClick={() => setScale("large")} type="button">
            L
          </button>
          <a className="chip-link" href="/widgets">Widgets</a>
        </nav>
      </header>

      <section className="sponsor-strip" aria-label="Espacos comerciais">
        {SPONSORS.map((sponsor) => (
          <article className="sponsor-slot" key={sponsor.label}>
            <span>{sponsor.label}</span>
            <strong>{sponsor.title}</strong>
            <small>{sponsor.note}</small>
          </article>
        ))}
      </section>

      <section className="cup-info">
        <article className="match-card">
          <span>{selectedGame?.isLive ? "Ao vivo" : mode === "today" ? "Jogos de hoje" : "Copa do Mundo 2026"}</span>
          <h1>{selectedGame?.game ?? (mode === "today" ? "Jogos de hoje" : "FIFA World Cup 2026")}</h1>
          <p>
            {selectedGame
              ? `${selectedGame.round} | ${selectedGame.scoreLine} | ${formatClock(selectedGame)} | ${selectedGame.pickLabel}`
              : message || "Carregando jogos e probabilidades."}
          </p>
        </article>

        <article className="insight-card">
          <span>Leitura IA</span>
          <strong>{getAiSummary(selectedGame)}</strong>
          <small>
            {selectedGame?.hasOdds
              ? `${selectedGame.totalMarkets || 1} mercados analisados pela API.`
              : "Estimativa visual ate odds oficiais ficarem disponiveis."}
          </small>
        </article>

        <article className="insight-card">
          <span>Radar</span>
          <strong>{filteredGames.length} jogos</strong>
          <small>
            {refreshing
              ? "Atualizando..."
              : updatedAt
                ? `Atualizado as ${new Date(updatedAt).toLocaleTimeString("pt-BR")}`
                : debug}
          </small>
        </article>
      </section>

      <section className="market-bar">
        <div className="top-games">
          {topGames.map((game, index) => (
            <button
              className={selectedGame?.id === game.id ? "top-pill is-active" : "top-pill"}
              key={game.id}
              onClick={() => setSelectedId(game.id)}
              type="button"
            >
              <span>{index + 1}</span>
              <strong>{game.game}</strong>
              <small>{formatChance(game.probability)}</small>
            </button>
          ))}
        </div>

        <div className="option-row">
          {selectedOptions.map((option) => (
            <article className={option.code === selectedGame?.pickCode ? "option-card is-leader" : "option-card"} key={option.code}>
              <span>{option.code}</span>
              <strong>{option.label}</strong>
              <small>{formatChance(option.probability)} | Odd {formatOdd(option.odd)}</small>
            </article>
          ))}
        </div>
      </section>

      <section className="ai-market-panel">
        <article className="ai-prediction-card">
          <span>Previsoes IA</span>
          <strong>{selectedGame?.game ?? "Selecione uma bolha"}</strong>
          <p>{aiInsights.headline || getAiSummary(selectedGame)}</p>
          <ul>
            <li>{aiInsights.goals || "Gols: aguardando mercado"}</li>
            <li>{aiInsights.corners || "Escanteios: aguardando mercado"}</li>
            <li>{aiInsights.cards || "Cartoes: aguardando mercado"}</li>
          </ul>
        </article>

        <div className="markets-grid" aria-label="Todas as opcoes de apostas">
          {selectedMarkets.map((market) => (
            <article className="market-card" key={`${market.id}-${market.name}`}>
              <div className="market-card-head">
                <span>{market.category}</span>
                <strong>{market.name}</strong>
              </div>
              <div className="market-options">
                {(market.options || []).map((option) => (
                  <div className="market-option" key={`${market.id}-${option.label}`}>
                    <span>{option.label}</span>
                    <strong>{formatChance(option.probability)}</strong>
                    <small>Odd {formatOdd(option.odd)}</small>
                  </div>
                ))}
              </div>
            </article>
          ))}
        </div>
      </section>

      <main className="bubble-board" ref={boardRef}>
        <div className="board-grid" />

        {loading ? (
          <div className="empty-state">
            <h2>{mode === "today" ? "Carregando jogos de hoje..." : "Carregando Copa 2026..."}</h2>
            <p>Buscando jogos, odds e estimativas.</p>
          </div>
        ) : null}

        {!loading && !filteredGames.length ? (
          <div className="empty-state">
            <h2>Sem jogos neste filtro</h2>
            <p>{debug || "Tente outro filtro no topo."}</p>
          </div>
        ) : null}

        {!loading &&
          filteredGames.map((game) => (
            <button
              className={selectedGame?.id === game.id ? `bubble is-${game.tier} is-selected` : `bubble is-${game.tier}`}
              key={game.id}
              onClick={() => setSelectedId(game.id)}
              style={{
                width: `${game.size}px`,
                height: `${game.size}px`,
                transform: `translate(${game.x}px, ${game.y}px)`,
              }}
              type="button"
            >
              <small>{game.homeTeam}</small>
              <strong>{formatChance(game.probability)}</strong>
              <em>{game.awayTeam}</em>
              <span>{game.pickCode} | {formatClock(game)}</span>
            </button>
          ))}
      </main>
    </div>
  );
}

export default function App() {
  const isWidgetsPage =
    typeof window !== "undefined" && window.location.pathname.startsWith("/widgets");

  return isWidgetsPage ? <WidgetsPage /> : <BubblesWorldCup />;
}
