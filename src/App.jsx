  const selectedGame =
    filteredGames.find((game) => game.id === selectedId) ?? filteredGames[0] ?? games[0] ?? null;

  const todayListGames = useMemo(() => {
    if (mode !== "today") {
      return [];
    }

    return [...games].sort(
      (left, right) =>
        Number(right.isLive) - Number(left.isLive) ||
        Number(left.isFinished) - Number(right.isFinished) ||
        new Date(left.commenceTime || 0).getTime() -
          new Date(right.commenceTime || 0).getTime() ||
        (right.probability || 0) - (left.probability || 0)
    );
  }, [games, mode]);

  const liveCount = games.filter((game) => game.isLive).length;
  const preCount = games.filter((game) => !game.isLive && !game.isFinished).length;
  const finishedCount = games.filter((game) => game.isFinished).length;
  const groupsCount = games.filter((game) => game.stage === "groups").length;
  const knockoutCount = games.filter((game) => game.stage === "knockout").length;

  const topGames = [...filteredGames]
    .sort((left, right) => (right.probability || 0) - (left.probability || 0))
    .slice(0, 5);

  const selectedOptions = selectedGame?.marketOptions ?? [];
  const selectedMarkets = selectedGame?.betMarkets ?? [];
  const aiInsights = selectedGame?.aiInsights ?? {};
  const aiWhy = Array.isArray(aiInsights.why) ? aiInsights.why : [];
  const aiChecklist = Array.isArray(aiInsights.checklist) ? aiInsights.checklist : [];
  const aiAvoidIf = Array.isArray(aiInsights.avoidIf) ? aiInsights.avoidIf : [];
  const aiBestMarkets = Array.isArray(aiInsights.bestMarkets) ? aiInsights.bestMarkets : [];

  useEffect(() => {
    if (!filteredGames.length) {
      return;
    }

    const visibleIds = filteredGames.map((game) => game.id);

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
            visibleIds.length
          );
          const position = getInitialPosition(visibleIndex, visibleIds.length, boundsRef.current, size);

          return {
            ...game,
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
  }, [filter, query, updatedAt, filteredGames.length]);

  return (
    <div className="cup-shell">
      <header className="cup-toolbar">
        <a className="cup-brand" href="/">
          <BublesLogo />
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
          <button
            className={mode === "today" ? "chip-button is-active" : "chip-button"}
            onClick={() => {
              setMode("today");
              setFilter("all");
            }}
            type="button"
          >
            Jogos de hoje
          </button>

          <button
            className={mode === "worldcup" ? "chip-button is-active" : "chip-button"}
            onClick={() => {
              setMode("worldcup");
              setFilter("all");
            }}
            type="button"
          >
            Copa 2026
          </button>
        </nav>

        <nav className="cup-controls" aria-label="Filtros da Copa">
          <button
            className={filter === "all" ? "chip-button is-active" : "chip-button"}
            onClick={() => setFilter("all")}
            type="button"
          >
            Todos {games.length}
          </button>

          <button
            className={filter === "live" ? "chip-button is-active" : "chip-button"}
            onClick={() => setFilter("live")}
            type="button"
          >
            Ao vivo {liveCount}
          </button>

          {mode === "today" ? (
            <>
              <button
                className={filter === "pre" ? "chip-button is-active" : "chip-button"}
                onClick={() => setFilter("pre")}
                type="button"
              >
                Pre {preCount}
              </button>

              <button
                className={filter === "finished" ? "chip-button is-active" : "chip-button"}
                onClick={() => setFilter("finished")}
                type="button"
              >
                Fim {finishedCount}
              </button>
            </>
          ) : (
            <>
              <button
                className={filter === "groups" ? "chip-button is-active" : "chip-button"}
                onClick={() => setFilter("groups")}
                type="button"
              >
                Grupos {groupsCount}
              </button>

              <button
                className={filter === "knockout" ? "chip-button is-active" : "chip-button"}
                onClick={() => setFilter("knockout")}
                type="button"
              >
                Mata-mata {knockoutCount}
              </button>
            </>
          )}
        </nav>

        <nav className="cup-controls compact" aria-label="Atalhos">
          <button className="chip-button today-list-button" onClick={openTodayList} type="button">
            Todos jogos de hoje {mode === "today" ? games.length : ""}
          </button>

          <a className="chip-link" href="/widgets">
            Widgets
          </a>
        </nav>
      </header>

      <section className="radar-stage">
        <main className="bubble-board" ref={boardRef}>
          <div className="board-grid" />

          <div className="board-status">
            <span>{mode === "today" ? "Jogos de hoje" : "Copa 2026"}</span>
            <strong>{filteredGames.length} jogos</strong>
            <small>
              {refreshing
                ? "Atualizando..."
                : updatedAt
                  ? `Atualizado as ${new Date(updatedAt).toLocaleTimeString("pt-BR")}`
                  : debug}
            </small>
          </div>

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
                aria-label={`Abrir previsoes de ${game.game}`}
                className={
                  selectedGame?.id === game.id
                    ? `bubble is-${game.tier} is-selected`
                    : `bubble is-${game.tier}`
                }
                key={game.id}
                onClick={() => openGameModal(game.id)}
                style={{
                  width: `${game.size}px`,
                  height: `${game.size}px`,
                  transform: `translate(${game.x}px, ${game.y}px)`,
                }}
                title={game.game}
                type="button"
              >
                <span className="bubble-team bubble-home">{game.homeTeam}</span>

                <strong>{formatChance(game.probability)}</strong>

                {hasScoreLine(game) || game.isLive ? (
                  <span className={game.isLive ? "bubble-score is-live" : "bubble-score"}>
                    {formatScoreLine(game)}
                  </span>
                ) : null}

                <span className="bubble-team bubble-away">{game.awayTeam}</span>
                <span className="bubble-meta">{game.pickCode} | {formatClock(game)}</span>
              </button>
            ))}
        </main>
      </section>
