const WIDGET_SPORTS = [
  { key: "football", label: "Football" },
  { key: "basketball", label: "Basketball" },
  { key: "baseball", label: "Baseball" },
  { key: "hockey", label: "Hockey" },
  { key: "rugby", label: "Rugby" },
  { key: "volleyball", label: "Volleyball" },
  { key: "handball", label: "Handball" },
];

function WidgetsPage() {
  const [sport, setSport] = useState("football");
  const widgetKey = import.meta.env.VITE_API_FOOTBALL_WIDGET_KEY || "";

  return (
    <div className="widgets-page">
      <header className="widgets-toolbar">
        <a className="widgets-brand" href="/">
          <span className="brand-dot" />
          <strong>BUBLES RADAR</strong>
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
          widgets oficiais da API-SPORTS.
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
        data-player-trophies="true"
        data-standings="true"
        data-player-injuries="true"
        data-team-squad="true"
        data-team-statistics="true"
        data-player-statistics="true"
        data-tab="games"
        data-game-tab="statistics"
        data-target-player="modal"
        data-target-league="#games-list"
        data-target-team="#team-content"
        data-target-game="#game-content"
        data-target-standings="#standings-content"
      />
    </div>
  );
}
